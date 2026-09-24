import { CART_ORDER_SOURCE } from "./orderStages";

const TELEGRAM_API = "https://api.telegram.org";

// Telegram cere exact una dintre cele două — callback_data pentru butoane
// gestionate de webhook, url pentru butoane care deschid direct un link
// (ex: Editează, care duce la /editare-comanda?token=...).
interface InlineButton {
  text: string;
  callback_data?: string;
  url?: string;
}

// Telegram respinge orice mesaj peste 4096 de caractere, cu 400 si fara sa trimita
// nimic. O comanda cu multe produse poate depasi limita, asa ca taiem coada in loc
// sa pierdem comanda cu totul — datele clientului sunt in primele randuri.
const TELEGRAM_MAX_LEN = 4096;

function clampForTelegram(text: string): string {
  if (text.length <= TELEGRAM_MAX_LEN) return text;
  const notice = "\n\n… listă prescurtată, vezi comanda completă în admin.";
  return text.slice(0, TELEGRAM_MAX_LEN - notice.length) + notice;
}

export async function sendTelegramMessage(
  text: string,
  buttons: InlineButton[][],
  replyToMessageId?: number,
  chatIdOverride?: string
): Promise<number | null> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = chatIdOverride ?? process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) {
    console.error("telegram: TELEGRAM_BOT_TOKEN sau TELEGRAM_CHAT_ID lipseste — mesajul nu a fost trimis");
    return null;
  }

  try {
    const res = await fetch(`${TELEGRAM_API}/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: clampForTelegram(text),
        parse_mode: "HTML",
        // Linkurile către produse din mesaj generau un card mare de previzualizare care acoperea comanda.
        link_preview_options: { is_disabled: true },
        reply_markup: { inline_keyboard: buttons },
        ...(replyToMessageId ? { reply_to_message_id: replyToMessageId, allow_sending_without_reply: true } : {}),
      }),
    });
    const data = await res.json();
    // Esecurile erau inghitite in tacere, deci o comanda pierduta nu lasa nicio urma.
    // Acum motivul apare in logurile serverului (description-ul de la Telegram).
    if (!data?.ok) {
      console.error("telegram sendMessage a esuat:", res.status, JSON.stringify(data));
      return null;
    }
    return data?.result?.message_id ?? null;
  } catch (err) {
    console.error("telegram sendMessage a aruncat:", err);
    return null;
  }
}

// "message is not modified" (400) e o eroare Telegram normală — apasă cineva un buton a
// doua oară, sau webhook-ul livrează același update de două ori — conținutul e deja cel
// nou, deci nu e nimic de raportat. Orice ALT 400 (ex. "can't parse entities" dintr-un HTML
// stricat, sau alt motiv necunoscut) chiar înseamnă că butonul apăsat n-a schimbat nimic
// vizibil pentru operator — fără logare aici, eșecul ăsta era complet invizibil.
function isBenignEditError(description: unknown): boolean {
  return typeof description === "string" && description.includes("message is not modified");
}

export async function editTelegramMessage(
  messageId: number,
  text: string,
  buttons: InlineButton[][],
  chatIdOverride?: string
): Promise<void> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = chatIdOverride ?? process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) return;

  try {
    const res = await fetch(`${TELEGRAM_API}/bot${token}/editMessageText`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        message_id: messageId,
        text,
        parse_mode: "HTML",
        link_preview_options: { is_disabled: true },
        reply_markup: { inline_keyboard: buttons },
      }),
    });
    const data = await res.json();
    if (!data?.ok && !isBenignEditError(data?.description)) {
      console.error("telegram editMessageText a esuat:", res.status, JSON.stringify(data));
    }
  } catch (err) {
    console.error("telegram editMessageText a aruncat:", err);
  }
}

export async function editTelegramReplyMarkup(messageId: number, buttons: InlineButton[][]): Promise<void> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) return;

  try {
    const res = await fetch(`${TELEGRAM_API}/bot${token}/editMessageReplyMarkup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        message_id: messageId,
        reply_markup: { inline_keyboard: buttons },
      }),
    });
    const data = await res.json();
    if (!data?.ok && !isBenignEditError(data?.description)) {
      console.error("telegram editMessageReplyMarkup a esuat:", res.status, JSON.stringify(data));
    }
  } catch (err) {
    console.error("telegram editMessageReplyMarkup a aruncat:", err);
  }
}

export async function answerCallbackQuery(callbackQueryId: string, text?: string): Promise<void> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) return;

  try {
    await fetch(`${TELEGRAM_API}/bot${token}/answerCallbackQuery`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ callback_query_id: callbackQueryId, text }),
    });
  } catch {
    // ignore
  }
}

export function escapeHtml(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export function getSiteUrl(): string {
  // Trim: SITE_URL din Vercel a avut un newline la coadă, iar Telegram respinge tot mesajul
  // (400 "Disallowed character in URL host") dacă URL-ul unui buton nu e valid.
  const url = process.env.SITE_URL?.trim().replace(/\/+$/, "");
  if (url) return url;
  return "http://localhost:3000";
}

// Wraps any mentioned product names in an HTML link to that product's page,
// so tapping the (already-visible) product name in Telegram jumps straight
// to it — no extra/visible URL text cluttering the message.
function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function linkifyProducts(text: string, products: { name: string; slug: string }[]): string {
  // O singură trecere, cu numele lungi întâi.
  //
  // Varianta pe iterații (un replace per produs) producea <a> imbricate cand un
  // nume era continut in altul — iar catalogul e plin de asemenea perechi
  // ("Taz rotund cu mâner 24 L" ⊂ "Taz rotund cu mâner 24 L (cat II color)").
  // Al doilea replace nimerea inauntrul primului link, iar Telegram respingea
  // tot mesajul cu 400 "can't parse entities", deci comanda se pierdea.
  const usable = products
    .map((p) => ({ ...p, escapedName: escapeHtml(p.name) }))
    .filter((p) => p.escapedName)
    .sort((a, b) => b.escapedName.length - a.escapedName.length);
  if (usable.length === 0) return text;

  const bySnippet = new Map(usable.map((p) => [p.escapedName, p]));
  const pattern = new RegExp(usable.map((p) => escapeRegExp(p.escapedName)).join("|"), "g");

  return text.replace(pattern, (match) => {
    const p = bySnippet.get(match);
    if (!p) return match;
    return `<a href="${getSiteUrl()}/produse/${p.slug}">${match}</a>`;
  });
}

// Comenzile din coș: textul stocat (scris de CheckoutPanel, citit și de orderExport/admin — de-asta nu-l
// schimbăm) e reordonat pe secțiuni pentru Telegram. Dacă structura nu e recunoscută, întoarce null și
// se folosește formatul vechi, ca nicio comandă să nu se piardă din cauza unei diferențe de format.
function renderCartOrderBody(raw: string, products: { name: string; slug: string }[]): string | null {
  const items: { name: string; qty?: string; unit?: string; total?: string; note?: string }[] = [];
  const totals: { subtotal?: string; savings?: string; delivery?: string; deliveryLabel?: string; total?: string } = {};
  let address: string | null = null;
  const invoice: string[] = [];
  const clientNote: string[] = [];
  let mode: "items" | "invoice" | "note" | "other" = "other";

  for (const line of raw.split("\n")) {
    const t = line.trim();
    let m: RegExpMatchArray | null;
    if (mode === "note") { clientNote.push(line); continue; }
    if (!t) { if (mode === "invoice") mode = "other"; continue; }
    if (t.startsWith("Produse comandate")) { mode = "items"; continue; }
    if (t.startsWith("🧾 CERE FACTURĂ")) { mode = "invoice"; continue; }
    if ((m = t.match(/^Mesaj client:\s*(.*)$/))) { mode = "note"; clientNote.push(m[1]); continue; }
    if ((m = t.match(/^Subtotal:\s*(.+)$/))) { totals.subtotal = m[1]; mode = "other"; continue; }
    if ((m = t.match(/^Economisește:\s*(.+)$/))) { totals.savings = m[1]; continue; }
    if ((m = t.match(/^Livrare \((.+?)\):\s*(.+)$/))) { totals.deliveryLabel = m[1]; totals.delivery = m[2]; continue; }
    if ((m = t.match(/^Total cu livrare:\s*(.+)$/))) { totals.total = m[1]; continue; }
    if ((m = t.match(/^Livrare:\s*(.+)$/))) { address = m[1]; mode = "other"; continue; }
    if (mode === "invoice") { invoice.push(t); continue; }
    if (mode === "items") {
      if ((m = t.match(/^•\s*(.+)$/))) { items.push({ name: m[1] }); continue; }
      if ((m = t.match(/^(\d+) buc × (.+?) = (.+?)(?: \((.+)\))?$/)) && items.length > 0) {
        Object.assign(items[items.length - 1], { qty: m[1], unit: m[2], total: m[3], note: m[4] });
        continue;
      }
    }
    // Linie necunoscută într-o comandă din coș — renunțăm la randarea structurată (fallback la formatul vechi).
    return null;
  }
  if (items.length === 0) return null;

  const out: string[] = [];
  out.push("<b>🛒 Produse</b>");
  items.forEach((it, i) => {
    out.push(`${i + 1}. ${linkifyProducts(escapeHtml(it.name), products)}`);
    if (it.qty) out.push(`     ${escapeHtml(it.qty)} × ${escapeHtml(it.unit ?? "")} = <b>${escapeHtml(it.total ?? "")}</b>`);
    if (it.note) out.push(`     <i>${escapeHtml(it.note)}</i>`);
  });

  const money: string[] = [];
  if (totals.subtotal) money.push(`Produse: ${escapeHtml(totals.subtotal)}`);
  if (totals.savings) money.push(`Economie: ${escapeHtml(totals.savings)}`);
  if (totals.delivery) money.push(`Livrare${totals.deliveryLabel ? ` (${escapeHtml(totals.deliveryLabel)})` : ""}: ${escapeHtml(totals.delivery)}`);
  if (totals.total) money.push(`<b>TOTAL: ${escapeHtml(totals.total)}</b>`);
  if (money.length > 0) out.push("", "<b>💰 Sumar</b>", ...money);

  if (address) out.push("", "<b>🚚 Adresa de livrare</b>", escapeHtml(address));
  if (invoice.length > 0) out.push("", "<b>🧾 Factură (companie)</b>", ...invoice.map((l) => escapeHtml(l)));
  const note = clientNote.join("\n").trim();
  if (note) out.push("", "<b>💬 Mesaj client</b>", escapeHtml(note));
  return out.join("\n");
}

export function buildContactMessageText(message: {
  name: string;
  phone: string;
  email: string | null;
  message: string | null;
  source: string;
  statusLabel: string;
  moodLabel?: string | null;
  products?: { name: string; slug: string }[];
  orderNumber?: string | null;
}): string {
  const products = message.products ?? [];
  const escapedMessage = message.message ? escapeHtml(message.message) : null;
  const escapedSource = escapeHtml(message.source);

  const cartBody = message.source === CART_ORDER_SOURCE && message.message ? renderCartOrderBody(message.message, products) : null;
  if (cartBody) {
    return [
      message.orderNumber ? `📦 <b>Comandă #${escapeHtml(message.orderNumber)}</b>` : `📦 <b>Comandă nouă</b>`,
      `📌 <b>${escapeHtml(message.statusLabel)}</b>`,
      message.moodLabel ? `🙂 Reacție: <b>${escapeHtml(message.moodLabel)}</b>` : null,
      ``,
      `<b>👤 Client</b>`,
      escapeHtml(message.name),
      `📞 ${escapeHtml(message.phone)}`,
      message.email ? `✉️ ${escapeHtml(message.email)}` : null,
      ``,
      cartBody,
    ]
      .filter((l) => l !== null)
      .join("\n");
  }

  const lines = [
    message.orderNumber ? `📦 <b>Comandă #${escapeHtml(message.orderNumber)}</b>` : `📩 <b>Mesaj nou</b>`,
    ``,
    `👤 ${escapeHtml(message.name)}`,
    `📞 ${escapeHtml(message.phone)}`,
    message.email ? `✉️ ${escapeHtml(message.email)}` : null,
    escapedMessage ? `\n${linkifyProducts(escapedMessage, products)}` : null,
    ``,
    `🔗 Sursă: ${linkifyProducts(escapedSource, products)}`,
    `📌 Status: <b>${escapeHtml(message.statusLabel)}</b>`,
    message.moodLabel ? `🙂 Reacție: <b>${escapeHtml(message.moodLabel)}</b>` : null,
  ].filter((l) => l !== null);
  return lines.join("\n");
}

const STATUS_BUTTON_ROWS: { value: string; label: string }[][] = [
  [{ value: "sunat", label: "📞 Sunat" }, { value: "nu_raspunde", label: "🚫 Nu răspunde" }, { value: "se_gandeste", label: "🤔 Se gândește" }],
  [{ value: "programat", label: "🗓 Programat" }, { value: "in_lucru", label: "🛠 În lucru" }, { value: "achitat", label: "💰 Achitat" }],
  [{ value: "anulat", label: "❌ Anulat" }],
];

const MOOD_BUTTON_ROWS: { value: string; label: string }[][] = [
  [{ value: "incantat", label: "🤑" }, { value: "fericit", label: "😁" }, { value: "nervos", label: "😠" }, { value: "furios", label: "🤬" }],
];

export const STATUS_BUTTONS = STATUS_BUTTON_ROWS.flat();
export const MOOD_BUTTONS = MOOD_BUTTON_ROWS.flat();

function rowsToButtons(rows: { value: string; label: string }[][], prefix: string, messageId: string): InlineButton[][] {
  return rows.map((row) => row.map((b) => ({ text: b.label, callback_data: `${prefix}:${messageId}:${b.value}` })));
}

export function buildStatusButtons(messageId: string): InlineButton[][] {
  return rowsToButtons(STATUS_BUTTON_ROWS, "status", messageId);
}

export function buildMessageButtons(messageId: string): InlineButton[][] {
  return [...rowsToButtons(STATUS_BUTTON_ROWS, "status", messageId), ...rowsToButtons(MOOD_BUTTON_ROWS, "mood", messageId)];
}

export const STATUSES_REQUIRING_CONFIRMATION = ["achitat", "anulat"];

export function buildConfirmButtons(messageId: string, value: string): InlineButton[][] {
  return [
    [
      { text: "✅ Da", callback_data: `confirm:${messageId}:${value}` },
      { text: "❌ Nu", callback_data: `cancel:${messageId}` },
    ],
  ];
}

// Fluxul separat pentru comenzi din coș (operator -> depozitar -> curier) —
// vezi lib/orderStages.ts. Nu se amestecă cu STATUS_BUTTON_ROWS/prefixele
// "status"/"confirm"/"cancel" de mai sus, ca să nu existe ambiguitate în
// webhook între cele două fluxuri.
export function buildOrderStageButtons(
  messageId: string,
  stage: string,
  editUrl: string,
  canSendInvoice = false,
  showReadyButton = false
): InlineButton[][] {
  // Butonul "Factură" apare doar dacă clientul a cerut factură și ea n-a fost trimisă încă.
  const invoiceRow: InlineButton[][] = canSendInvoice
    ? [[{ text: "🧾 Trimite factura", callback_data: `ord_invoice:${messageId}` }]]
    : [];
  if (stage === "noua") {
    return [
      [{ text: "✅ Confirmă", callback_data: `ord_confirm:${messageId}` }],
      [{ text: "✏️ Editează", url: editUrl }],
      ...invoiceRow,
      [{ text: "❌ Anulează", callback_data: `ord_cancel:${messageId}` }],
    ];
  }
  if (stage === "confirmata") {
    // "Gata de ridicare" e apăsat de depozitar în chatul lui (buildWarehouseButtons), nu de operator.
    const readyRow: InlineButton[][] = showReadyButton
      ? [[{ text: "📦 Gata de ridicare", callback_data: `ord_ready:${messageId}` }]]
      : [];
    return [...readyRow, ...invoiceRow, [{ text: "❌ Anulează", callback_data: `ord_cancel:${messageId}` }]];
  }
  return [];
}

// Numele botului, necesar pentru linkul de conectare t.me/<bot>?start=<token>. Din env dacă e setat
// (TELEGRAM_BOT_USERNAME, fără @), altfel îl cerem o dată de la Telegram (getMe) și îl ținem minte.
let cachedBotUsername: string | null = null;

export async function getBotUsername(): Promise<string | null> {
  const fromEnv = process.env.TELEGRAM_BOT_USERNAME?.trim().replace(/^@/, "");
  if (fromEnv) return fromEnv;
  if (cachedBotUsername) return cachedBotUsername;
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) return null;
  try {
    const res = await fetch(`${TELEGRAM_API}/bot${token}/getMe`);
    const data = await res.json();
    cachedBotUsername = data?.result?.username ?? null;
  } catch (err) {
    console.error("telegram getMe a aruncat:", err);
  }
  return cachedBotUsername;
}

// Mesajul comenzii unei comenzi din coș conține un bloc "🧾 CERE FACTURĂ (companie):" cu datele
// firmei (vezi CheckoutPanel) — butonul "Factură" apare doar când blocul există.
export function extractInvoiceBlock(message: string | null): string | null {
  if (!message) return null;
  const start = message.indexOf("🧾 CERE FACTURĂ");
  if (start === -1) return null;
  const rest = message.slice(start);
  const end = rest.indexOf("\n\n");
  return (end === -1 ? rest : rest.slice(0, end)).trim();
}

export function buildWarehouseButtons(messageId: string, stage: string): InlineButton[][] {
  if (stage === "confirmata") {
    return [[{ text: "📦 Gata de ridicare", callback_data: `ord_ready:${messageId}` }]];
  }
  return [];
}


// Textul mesajului principal al comenzii e editat în același loc la fiecare tranziție de
// etapă (syncOrderTelegramMessage) — dar Telegram NU trimite nicio notificare la o editare
// (editMessageText e silențios), doar la un mesaj nou. Fără asta, depozitarul/curierul ar afla
// că e rândul lor doar dacă deschid manual Telegram și dau scroll până la comandă. Un mesaj
// nou, scurt, ca reply la cel principal, produce o notificare reală, păstrând totuși contextul
// (thread-ul de reply arată la ce comandă se referă).
const STAGE_NOTIFICATION_TEXT: Partial<Record<string, (label: string) => string>> = {
  confirmata: (label) => `✅ ${label} confirmată — AWB creat, trimisă depozitarului.`,
  predata_curier: (label) => `📦 ${label} gata de ridicare — curierul o poate prelua.`,
  anulata: (label) => `❌ ${label} anulată.`,
};

export async function notifyOrderStageChange(
  stage: string,
  orderNumber: string | null,
  replyToMessageId: number | null,
  extraChatIds: string[] = []
): Promise<void> {
  const build = STAGE_NOTIFICATION_TEXT[stage];
  if (!build) return;
  const label = orderNumber ? `Comanda #${orderNumber}` : "Comanda";
  await sendTelegramMessage(build(label), [], replyToMessageId ?? undefined);
  // Conturi de staff conectate (manager / curier) — chat-uri separate, deci fără reply.
  await Promise.all(extraChatIds.map((chatId) => sendTelegramMessage(build(label), [], undefined, chatId)));
}

export function buildOrderCancelConfirmButtons(messageId: string): InlineButton[][] {
  return [
    [
      { text: "✅ Da, anulează", callback_data: `ord_cancel_yes:${messageId}` },
      { text: "↩️ Renunță", callback_data: `ord_cancel_no:${messageId}` },
    ],
  ];
}
