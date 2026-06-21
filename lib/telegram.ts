const TELEGRAM_API = "https://api.telegram.org";

interface InlineButton {
  text: string;
  callback_data: string;
}

export async function sendTelegramMessage(text: string, buttons: InlineButton[][]): Promise<number | null> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) return null;

  try {
    const res = await fetch(`${TELEGRAM_API}/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: "HTML",
        reply_markup: { inline_keyboard: buttons },
      }),
    });
    const data = await res.json();
    return data?.result?.message_id ?? null;
  } catch {
    return null;
  }
}

export async function editTelegramMessage(messageId: number, text: string, buttons: InlineButton[][]): Promise<void> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) return;

  try {
    await fetch(`${TELEGRAM_API}/bot${token}/editMessageText`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        message_id: messageId,
        text,
        parse_mode: "HTML",
        reply_markup: { inline_keyboard: buttons },
      }),
    });
  } catch {
    // ignore
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

function escapeHtml(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export function buildContactMessageText(message: {
  name: string;
  phone: string;
  email: string | null;
  message: string | null;
  source: string;
  statusLabel: string;
  clientTypeLabel?: string | null;
}): string {
  const lines = [
    `📩 <b>Mesaj nou</b>`,
    ``,
    `👤 ${escapeHtml(message.name)}`,
    `📞 ${escapeHtml(message.phone)}`,
    message.email ? `✉️ ${escapeHtml(message.email)}` : null,
    message.message ? `\n${escapeHtml(message.message)}` : null,
    ``,
    `🔗 Sursă: ${escapeHtml(message.source)}`,
    `📌 Status: <b>${escapeHtml(message.statusLabel)}</b>`,
    message.clientTypeLabel ? `🏷 Tip client: <b>${escapeHtml(message.clientTypeLabel)}</b>` : null,
  ].filter((l) => l !== null);
  return lines.join("\n");
}

export const STATUS_BUTTONS: { value: string; label: string }[] = [
  { value: "sunat", label: "📞 L-am sunat" },
  { value: "nu_raspunde", label: "🚫 Nu răspunde" },
  { value: "ocupat", label: "🔁 Ocupat, revin" },
  { value: "se_gandeste", label: "🤔 Se gândește" },
  { value: "in_lucru", label: "🛠 În lucru" },
  { value: "task_creat", label: "📋 Task creat" },
  { value: "comanda_confirmata", label: "🧾 Comandă confirmată" },
  { value: "asteptam_plata", label: "⏳ Aștept plata" },
  { value: "achitat", label: "💰 Achitat" },
  { value: "programat", label: "🗓 Programat" },
  { value: "rezolvat", label: "✅ Rezolvat" },
  { value: "anulat", label: "❌ Anulat" },
  { value: "nu_interesat", label: "👎 Nu e interesat" },
];

export const CLIENT_TYPE_BUTTONS: { value: string; label: string }[] = [
  { value: "nou", label: "🆕 Client nou" },
  { value: "recurent", label: "🔄 Client recurent" },
  { value: "cald", label: "🔥 Client cald" },
  { value: "rece", label: "🧊 Client rece" },
  { value: "vip", label: "💎 Client VIP" },
  { value: "comercial", label: "🏢 Client comercial" },
  { value: "dificil", label: "😤 Client dificil" },
];

function chunkButtons(items: { value: string; label: string }[], prefix: string, messageId: string): InlineButton[][] {
  const rows: InlineButton[][] = [];
  for (let i = 0; i < items.length; i += 2) {
    rows.push(items.slice(i, i + 2).map((b) => ({ text: b.label, callback_data: `${prefix}:${messageId}:${b.value}` })));
  }
  return rows;
}

export function buildStatusButtons(messageId: string): InlineButton[][] {
  return chunkButtons(STATUS_BUTTONS, "status", messageId);
}

export function buildMessageButtons(messageId: string): InlineButton[][] {
  return [...chunkButtons(STATUS_BUTTONS, "status", messageId), ...chunkButtons(CLIENT_TYPE_BUTTONS, "client", messageId)];
}
