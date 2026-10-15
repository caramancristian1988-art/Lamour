// Registrul de comenzi în Telegram — comenzile text (/noi, /registru, /extrage ...) și butoanele lor.
//
// Aceeași bază de date și aceleași funcții ca pe site (lib/orderRegistry.ts): o comandă extrasă dintr-o parte apare
// extrasă și în cealaltă, imediat. Mesajele sunt text simplu, în propoziții, fără emoji sau tabele, ca să fie citite
// bine de cititoarele de ecran. Datele personale (telefon, adresă) și fișierul Excel complet merg DOAR în conversația
// privată cu botul, DOAR către persoanele autorizate (verificate după ID-ul Telegram, la fiecare acțiune).
import { sendTelegramMessage, sendTelegramDocument, answerCallbackQuery, escapeHtml } from "./telegram";
import {
  EXTRACTION,
  EXTRACTION_LABELS,
  confirmExport,
  cancelExport,
  describeOrderForSpeech,
  findRegistryOrder,
  formatDateTime,
  formatMoney,
  getExportOrders,
  getExportSummary,
  listActiveExports,
  listExports,
  listRegistry,
  prepareExport,
  registryCounts,
  type Actor,
  type ExportSummary,
  type RegistryFilter,
  type RegistryOrder,
} from "./orderRegistry";
import { buildExportWorkbook, exportFilename } from "./orderRegistryExcel";
import { getUserPermissions, type RegistryPermission } from "./telegramPermissions";
import { registryChatId, retryPendingRegistryNotifications } from "./registryNotify";

const XLSX_MIME = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
const PAGE_SIZE = 10;

type Button = { text: string; callback_data: string };

interface TgUser {
  id: number;
  first_name?: string;
  last_name?: string;
  username?: string;
}
interface TgChat {
  id: number;
  type?: string;
}
export interface TgMessage {
  chat: TgChat;
  from?: TgUser;
  text?: string;
}
export interface TgCallback {
  id: string;
  from: TgUser;
  data?: string;
  message?: { chat: TgChat };
}

interface Ctx {
  userId: string;
  name: string;
  chatId: string;
  isPrivate: boolean;
  perms: Set<RegistryPermission>;
  actor: Actor;
}

function displayName(u: TgUser): string {
  const full = [u.first_name, u.last_name].filter(Boolean).join(" ").trim();
  return full || (u.username ? `@${u.username}` : `utilizator ${u.id}`);
}

async function buildCtx(user: TgUser, chat: TgChat): Promise<Ctx> {
  const userId = String(user.id);
  const name = displayName(user);
  return {
    userId,
    name,
    chatId: String(chat.id),
    isPrivate: chat.type === "private",
    perms: await getUserPermissions(userId),
    actor: { channel: "telegram", id: userId, name },
  };
}

/** Comenzile registrului se acceptă doar în conversații private cu botul sau în grupul registrului — nu în alte grupuri. */
function chatAllowed(ctx: Ctx): boolean {
  return ctx.isPrivate || ctx.chatId === registryChatId();
}

async function say(chatId: string, plain: string, buttons: Button[][] = []): Promise<number | null> {
  return sendTelegramMessage(escapeHtml(plain), buttons, undefined, chatId);
}

function plural(n: number, one: string, many: string): string {
  return n === 1 ? `1 ${one}` : `${n} ${many}`;
}

function denied(ctx: Ctx, what: string): string {
  return `Nu aveți dreptul pentru această acțiune: ${what}. ID-ul dumneavoastră Telegram este ${ctx.userId}. Cereți unui administrator să vă acorde dreptul din pagina Telegram a site-ului.`;
}

async function requirePerm(ctx: Ctx, perm: RegistryPermission, what: string): Promise<boolean> {
  if (ctx.perms.has(perm)) return true;
  await say(ctx.chatId, denied(ctx, what));
  return false;
}

// ── Ajutor / identitate ────────────────────────────────────────────────────────────────────────

const HELP_TEXT = [
  "Registrul de comenzi. Comenzile disponibile:",
  "/noi — comenzile neextrase, cu paginare.",
  "/registru — toate comenzile din registru, cu paginare.",
  "/extrase — comenzile deja extrase.",
  "/comanda 1052 — detaliile comenzii cu numărul 1052.",
  "/extrage — pregătește fișierul Excel cu toate comenzile neextrase.",
  "/istoric — ultimele extrageri.",
  "/status — informații generale despre sistem.",
  "/id — ID-ul dumneavoastră Telegram, necesar pentru drepturi.",
  "/ajutor — acest mesaj.",
  "Telefonul, adresa și fișierul Excel se trimit doar în conversația privată cu botul, persoanelor autorizate.",
].join("\n");

// ── Liste ──────────────────────────────────────────────────────────────────────────────────────

const FILTER_CODE: Record<string, RegistryFilter> = { n: EXTRACTION.NEW, e: EXTRACTION.DONE, t: "toate" };
const FILTER_TO_CODE: Record<RegistryFilter, string> = { neextrasa: "n", extrasa: "e", toate: "t", rezervata: "t" };
const FILTER_TITLE: Record<RegistryFilter, string> = {
  neextrasa: "Comenzi neextrase",
  extrasa: "Comenzi extrase",
  toate: "Registrul de comenzi, toate comenzile",
  rezervata: "Comenzi rezervate pentru extragere",
};

async function sendListPage(ctx: Ctx, filter: RegistryFilter, page: number): Promise<void> {
  const r = await listRegistry({ status: filter, page, pageSize: PAGE_SIZE, includeArchived: true });
  if (r.total === 0) {
    await say(ctx.chatId, filter === EXTRACTION.NEW ? "Nu există comenzi noi, neextrase." : `${FILTER_TITLE[filter]}: nu există comenzi.`);
    return;
  }
  const head = `${FILTER_TITLE[filter]}. În total ${plural(r.total, "comandă", "comenzi")}. Pagina ${r.page} din ${r.pages}.`;
  const body = r.orders.map((o) => describeOrderForSpeech(o)).join("\n\n");
  const hint = "Pentru detalii folosiți /comanda urmat de număr, de exemplu /comanda " + r.orders[0].ref + ".";

  const code = FILTER_TO_CODE[filter];
  const row: Button[] = [];
  if (r.page > 1) row.push({ text: "Comenzile anterioare", callback_data: `reg_pg:${code}:${r.page - 1}` });
  if (r.page < r.pages) {
    const remaining = r.total - r.page * PAGE_SIZE;
    row.push({ text: `Următoarele ${Math.min(PAGE_SIZE, remaining)} comenzi`, callback_data: `reg_pg:${code}:${r.page + 1}` });
  }
  await say(ctx.chatId, `${head}\n\n${body}\n\n${hint}`, row.length ? [row] : []);
}

// ── Detalii comandă ────────────────────────────────────────────────────────────────────────────

function publicOrderText(o: RegistryOrder): string {
  const lines = [
    `Comanda ${o.ref}.`,
    `Plasată la ${formatDateTime(o.createdAt)}.`,
    `Status comandă: ${o.stageLabel}.`,
    `Status extragere: ${EXTRACTION_LABELS[o.extractionStatus].toLowerCase()}${
      o.extractedAt ? `, la ${formatDateTime(o.extractedAt)}${o.extractedBy ? `, de ${o.extractedBy}` : ""}` : ""
    }.`,
    `Client: ${o.name}.`,
  ];
  if (o.items.length === 0) lines.push("Produse: nu sunt înregistrate.");
  else {
    lines.push("Produse:");
    for (const it of o.items) {
      const price = it.unitPrice === null ? "preț necunoscut" : `${formatMoney(it.unitPrice)} bucata, total ${formatMoney(it.lineTotal)}`;
      lines.push(`${it.quantity === 1 ? "1 bucată" : `${it.quantity} bucăți`} ${it.name}, ${price}.`);
    }
  }
  lines.push(`Total comandă: ${formatMoney(o.total)}.`, `Metoda de plată: ${o.paymentMethod}.`);
  return lines.join("\n");
}

function personalOrderText(o: RegistryOrder): string {
  return [
    `Date de contact pentru comanda ${o.ref}.`,
    `Telefon: ${o.phone}.`,
    `Adresă de livrare: ${o.address || "necompletată"}.`,
    `Email: ${o.email ?? "necompletat"}.`,
  ].join("\n");
}

async function sendOrderDetails(ctx: Ctx, reference: string): Promise<void> {
  if (!reference) {
    await say(ctx.chatId, "Scrieți numărul comenzii, de exemplu: /comanda 1052.");
    return;
  }
  const order = await findRegistryOrder(reference);
  if (!order) {
    await say(ctx.chatId, `Nu am găsit comanda ${reference}. Verificați numărul și încercați din nou.`);
    return;
  }

  let text = publicOrderText(order);
  const canSeePersonal = ctx.perms.has("date_personale");
  if (canSeePersonal && ctx.isPrivate) {
    text += `\n\n${personalOrderText(order)}`;
  } else if (canSeePersonal) {
    const sent = await say(ctx.userId, personalOrderText(order));
    text += sent
      ? "\n\nTelefonul și adresa au fost trimise în conversația privată."
      : "\n\nPentru telefon și adresă deschideți o conversație privată cu botul, apăsați Start și cereți din nou comanda.";
  } else {
    text += "\n\nTelefonul și adresa nu sunt afișate aici; se văd doar în privat, de persoanele autorizate.";
  }
  await say(ctx.chatId, text);
}

// ── Extragere ──────────────────────────────────────────────────────────────────────────────────

async function deliverExport(exp: ExportSummary, userId: string): Promise<boolean> {
  const orders = await getExportOrders(exp.id);
  const file = buildExportWorkbook(exp, orders);
  const caption = escapeHtml(`Exportul numărul ${exp.number}, ${plural(orders.length, "comandă", "comenzi")}.`);
  return sendTelegramDocument(userId, file, exportFilename(exp), caption, XLSX_MIME);
}

function confirmButtons(exp: ExportSummary): Button[][] {
  return [
    [{ text: "Confirm extragerea", callback_data: `reg_ok:${exp.id}` }],
    [{ text: "Nu am primit fișierul", callback_data: `reg_nofile:${exp.id}` }],
    [{ text: "Anulează exportul", callback_data: `reg_cancel:${exp.id}` }],
  ];
}

/** Trimite fișierul în privat + butoanele de confirmare; în grup anunță doar că exportul e pregătit. */
async function presentExport(ctx: Ctx, exp: ExportSummary, resumed: boolean): Promise<void> {
  const delivered = await deliverExport(exp, ctx.userId);
  if (!delivered) {
    await say(
      ctx.chatId,
      "Eroare. Fișierul nu a putut fi trimis în conversația privată. Deschideți o conversație privată cu botul, apăsați Start, apoi folosiți din nou /extrage — veți relua același export, nu se creează altul. Comenzile sunt păstrate."
    );
    return;
  }
  const lead = resumed ? "Ați reluat exportul" : "Exportul a fost pregătit";
  const body = `${lead}, numărul ${exp.number}. Conține ${plural(exp.orderCount, "comandă", "comenzi")}. Fișierul Excel a fost trimis mai sus. Confirmați extragerea abia după ce l-ați primit și l-ați deschis. Până la confirmare, comenzile rămân rezervate și nu apar în alt export.`;
  await say(ctx.userId, body, confirmButtons(exp));
  if (!ctx.isPrivate) {
    await say(ctx.chatId, `Exportul numărul ${exp.number}, pornit de ${ctx.name}, conține ${plural(exp.orderCount, "comandă", "comenzi")}. Fișierul și butoanele de confirmare au fost trimise în conversația privată.`);
  }
}

async function offerExport(ctx: Ctx): Promise<void> {
  if (!(await requirePerm(ctx, "extragere", "extragerea comenzilor în Excel"))) return;
  const [counts, active] = await Promise.all([registryCounts(), listActiveExports()]);
  const mine = active.find((e) => e.channel === "telegram" && e.initiatedById === ctx.userId);

  if (mine) {
    await say(
      ctx.chatId,
      `Aveți deja un export pregătit, numărul ${mine.number}, cu ${plural(mine.orderCount, "comandă", "comenzi")}, neconfirmat. Doriți să-l reluați?`,
      [[{ text: `Reia exportul ${mine.number}`, callback_data: `reg_resume:${mine.id}` }, { text: "Anulează", callback_data: "reg_x:0" }]]
    );
    return;
  }
  if (counts.neextrase > 0) {
    await say(
      ctx.chatId,
      `Sunt disponibile ${plural(counts.neextrase, "comandă neextrasă", "comenzi neextrase")}. Doriți să pregătiți fișierul Excel?`,
      [[{ text: "Pregătește exportul", callback_data: "reg_prep:0" }, { text: "Anulează", callback_data: "reg_x:0" }]]
    );
    return;
  }
  if (active.length > 0) {
    const e = active[0];
    await say(
      ctx.chatId,
      `Nu există comenzi noi pentru extragere. Există un export în curs, numărul ${e.number}, cu ${plural(e.orderCount, "comandă", "comenzi")}, pornit de ${e.initiatedByName}. Doriți să-l reluați?`,
      [[{ text: `Reia exportul ${e.number}`, callback_data: `reg_resume:${e.id}` }, { text: "Anulează", callback_data: "reg_x:0" }]]
    );
    return;
  }
  await say(ctx.chatId, "Nu există comenzi noi pentru extragere.");
}

async function sendHistory(ctx: Ctx): Promise<void> {
  const rows = await listExports(5);
  if (rows.length === 0) {
    await say(ctx.chatId, "Nu a fost făcută nicio extragere încă.");
    return;
  }
  const lines = rows.map((e) => {
    const who = e.confirmedAt ? `confirmat de ${e.confirmedByName ?? "necunoscut"} la ${formatDateTime(e.confirmedAt)}` : `pornit de ${e.initiatedByName} la ${formatDateTime(e.createdAt)}`;
    return `Exportul numărul ${e.number}: ${e.statusLabel.toLowerCase()}, ${plural(e.orderCount, "comandă", "comenzi")}, ${who}.`;
  });
  await say(ctx.chatId, `Ultimele ${rows.length} extrageri, de la cea mai recentă.\n\n${lines.join("\n\n")}`);
}

async function sendStatus(ctx: Ctx): Promise<void> {
  const retried = await retryPendingRegistryNotifications(5);
  const [counts, active] = await Promise.all([registryCounts(), listActiveExports()]);
  const lines = [
    "Starea registrului de comenzi.",
    `Comenzi în registru: ${counts.total}.`,
    `Neextrase: ${counts.neextrase}.`,
    `Rezervate pentru extragere: ${counts.rezervate}.`,
    `Extrase: ${counts.extrase}.`,
    `Exporturi în curs, neconfirmate: ${active.length}.`,
    registryChatId() ? "Grupul de notificări al registrului este configurat." : "Grupul de notificări al registrului nu este configurat.",
  ];
  if (retried > 0) lines.push(`Au fost retrimise ${plural(retried, "notificare întârziată", "notificări întârziate")}.`);
  await say(ctx.chatId, lines.join("\n"));
}

// ── Intrare: mesaje text ───────────────────────────────────────────────────────────────────────

/** true dacă mesajul a fost o comandă a registrului (tratată aici). */
export async function handleRegistryMessage(message: TgMessage): Promise<boolean> {
  const text = (message.text ?? "").trim();
  const match = text.match(/^\/([a-zA-Z0-9_]+)(?:@\w+)?(?:\s+([\s\S]*))?$/);
  if (!match || !message.from) return false;

  let command = match[1].toLowerCase();
  let arg = (match[2] ?? "").trim();
  // „/comanda_1052” ca scurtătură a lui „/comanda 1052” — argumentul își păstrează majusculele
  // (un număr de comandă editat manual poate conține litere).
  const compact = match[1].match(/^comanda_(.+)$/i);
  if (compact) {
    command = "comanda";
    arg = compact[1];
  }
  const known = ["start", "ajutor", "help", "id", "noi", "lista", "registru", "extrase", "comanda", "extrage", "istoric", "status"];
  if (!known.includes(command)) return false;

  const ctx = await buildCtx(message.from, message.chat);

  // /id funcționează oriunde: arată doar ID-urile celui care întreabă și ale conversației.
  if (command === "id") {
    await say(ctx.chatId, `ID-ul dumneavoastră Telegram este ${ctx.userId}. ID-ul acestei conversații este ${ctx.chatId}.`);
    return true;
  }
  if (!chatAllowed(ctx)) return false; // alt grup: nu răspundem (nu poluăm grupurile operatorilor)

  switch (command) {
    case "start":
    case "ajutor":
    case "help":
      await say(ctx.chatId, `${HELP_TEXT}\n\nID-ul dumneavoastră Telegram este ${ctx.userId}.`);
      break;
    case "noi":
    case "lista":
      if (await requirePerm(ctx, "vizualizare", "vizualizarea comenzilor")) {
        await retryPendingRegistryNotifications(3);
        await sendListPage(ctx, EXTRACTION.NEW, 1);
      }
      break;
    case "registru":
      if (await requirePerm(ctx, "vizualizare", "vizualizarea registrului")) await sendListPage(ctx, "toate", 1);
      break;
    case "extrase":
      if (await requirePerm(ctx, "vizualizare", "vizualizarea comenzilor extrase")) await sendListPage(ctx, EXTRACTION.DONE, 1);
      break;
    case "comanda":
      if (await requirePerm(ctx, "consultare", "consultarea detaliilor unei comenzi")) await sendOrderDetails(ctx, arg);
      break;
    case "extrage":
      await offerExport(ctx);
      break;
    case "istoric":
      if (await requirePerm(ctx, "vizualizare", "vizualizarea istoricului")) await sendHistory(ctx);
      break;
    case "status":
      if (await requirePerm(ctx, "vizualizare", "vizualizarea stării sistemului")) await sendStatus(ctx);
      break;
  }
  return true;
}

// ── Intrare: butoane ───────────────────────────────────────────────────────────────────────────

export function isRegistryCallback(data: string | undefined): boolean {
  return typeof data === "string" && data.startsWith("reg_");
}

export async function handleRegistryCallback(cb: TgCallback): Promise<void> {
  const [prefix, arg1, arg2] = String(cb.data ?? "").split(":");
  const chat = cb.message?.chat ?? { id: cb.from.id, type: "private" };
  const ctx = await buildCtx(cb.from, chat);

  if (!chatAllowed(ctx)) {
    await answerCallbackQuery(cb.id, "Acțiune indisponibilă aici.");
    return;
  }

  try {
    switch (prefix) {
      case "reg_pg": {
        if (!(await requirePerm(ctx, "vizualizare", "vizualizarea comenzilor"))) break;
        const filter = FILTER_CODE[arg1] ?? EXTRACTION.NEW;
        await answerCallbackQuery(cb.id);
        await sendListPage(ctx, filter, Math.max(1, Number(arg2) || 1));
        return;
      }
      case "reg_x":
        await answerCallbackQuery(cb.id, "Anulat.");
        await say(ctx.chatId, "Nu s-a pregătit niciun export. Comenzile au rămas neschimbate.");
        return;
      case "reg_prep": {
        if (!(await requirePerm(ctx, "extragere", "extragerea comenzilor în Excel"))) break;
        await answerCallbackQuery(cb.id, "Se pregătește exportul.");
        const result = await prepareExport(ctx.actor);
        if (result.kind === "none") {
          await say(ctx.chatId, "Nu există comenzi noi pentru extragere.");
        } else {
          await presentExport(ctx, result.export, result.kind === "resumed");
        }
        return;
      }
      case "reg_resume": {
        if (!(await requirePerm(ctx, "extragere", "extragerea comenzilor în Excel"))) break;
        const exp = await getExportSummary(arg1);
        if (!exp || exp.status !== "pregatit") {
          await answerCallbackQuery(cb.id, "Exportul nu mai este activ.");
          await say(ctx.chatId, "Acest export nu mai este activ. Folosiți /extrage ca să vedeți situația actuală.");
          return;
        }
        await answerCallbackQuery(cb.id, "Se retrimite fișierul.");
        await presentExport(ctx, exp, true);
        return;
      }
      case "reg_nofile": {
        if (!(await requirePerm(ctx, "extragere", "extragerea comenzilor în Excel"))) break;
        const exp = await getExportSummary(arg1);
        if (!exp || exp.status !== "pregatit") {
          await answerCallbackQuery(cb.id, "Exportul nu mai este activ.");
          return;
        }
        await answerCallbackQuery(cb.id, "Retrimit fișierul.");
        const ok = await deliverExport(exp, ctx.userId);
        await say(
          ctx.userId,
          ok
            ? `Am retrimis fișierul exportului ${exp.number}. Dacă tot nu îl primiți, descărcați-l de pe site, din Registrul de comenzi. Comenzile rămân rezervate și nu s-au pierdut.`
            : `Eroare. Fișierul exportului ${exp.number} nu a putut fi retrimis. Descărcați-l de pe site, din Registrul de comenzi. Comenzile rămân rezervate și nu s-au pierdut.`
        );
        return;
      }
      case "reg_ok": {
        if (!(await requirePerm(ctx, "confirmare", "confirmarea extragerii"))) break;
        await answerCallbackQuery(cb.id, "Se confirmă.");
        const r = await confirmExport(arg1, ctx.actor);
        if (r.kind === "confirmed") {
          const msg = r.alreadyConfirmed
            ? `Acest export era deja confirmat. ${plural(r.orderCount, "comandă este marcată", "comenzi sunt marcate")} ca extrase.`
            : `Extragerea a fost confirmată. ${plural(r.orderCount, "comandă a fost marcată", "comenzi au fost marcate")} ca extrase.`;
          await say(ctx.chatId, msg);
          // Colegii din grup află că registrul s-a schimbat (confirmarea se face în privat).
          const group = registryChatId();
          if (!r.alreadyConfirmed && group && group !== ctx.chatId) {
            await say(group, `Exportul numărul ${r.export.number} a fost confirmat de ${ctx.name}. ${plural(r.orderCount, "comandă a fost marcată", "comenzi au fost marcate")} ca extrase.`);
          }
        } else if (r.kind === "closed") {
          await say(ctx.chatId, `Eroare. Exportul nu mai poate fi confirmat, are statusul: ${r.statusLabel.toLowerCase()}. Folosiți /extrage pentru un export nou.`);
        } else {
          await say(ctx.chatId, "Eroare. Exportul nu a fost găsit.");
        }
        return;
      }
      case "reg_cancel": {
        if (!(await requirePerm(ctx, "confirmare", "anularea extragerii"))) break;
        await answerCallbackQuery(cb.id, "Se anulează.");
        const r = await cancelExport(arg1, ctx.actor);
        if (r.kind === "cancelled") {
          await say(ctx.chatId, `Exportul a fost anulat. ${plural(r.released, "comandă a revenit", "comenzi au revenit")} la statusul neextrasă.`);
        } else if (r.kind === "closed") {
          await say(ctx.chatId, `Exportul nu mai poate fi anulat, are statusul: ${r.statusLabel.toLowerCase()}.`);
        } else {
          await say(ctx.chatId, "Eroare. Exportul nu a fost găsit.");
        }
        return;
      }
      default:
        await answerCallbackQuery(cb.id, "Acțiune necunoscută.");
        return;
    }
    // „break” din switch = refuz de permisiune (mesajul a fost deja trimis de requirePerm).
    await answerCallbackQuery(cb.id, "Nu aveți dreptul pentru această acțiune.");
  } catch (err) {
    console.error("telegram: acțiunea registrului a eșuat:", err);
    await answerCallbackQuery(cb.id, "Eroare.").catch(() => undefined);
    await say(ctx.chatId, "Eroare. Acțiunea nu a putut fi finalizată. Comenzile sunt păstrate. Încercați din nou.").catch(() => undefined);
  }
}
