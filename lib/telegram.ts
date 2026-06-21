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

const STATUS_BUTTON_ROWS: { value: string; label: string }[][] = [
  [{ value: "sunat", label: "📞 Sunat" }, { value: "nu_raspunde", label: "🚫 Nu răspunde" }, { value: "se_gandeste", label: "🤔 Se gândește" }],
  [{ value: "programat", label: "🗓 Programat" }, { value: "in_lucru", label: "🛠 În lucru" }, { value: "achitat", label: "💰 Achitat" }],
  [{ value: "anulat", label: "❌ Anulat" }],
];

const CLIENT_TYPE_BUTTON_ROWS: { value: string; label: string }[][] = [
  [{ value: "nou", label: "🆕" }, { value: "cald", label: "🔥" }, { value: "rece", label: "🧊" }, { value: "vip", label: "💎" }],
];

export const STATUS_BUTTONS = STATUS_BUTTON_ROWS.flat();
export const CLIENT_TYPE_BUTTONS = CLIENT_TYPE_BUTTON_ROWS.flat();

function rowsToButtons(rows: { value: string; label: string }[][], prefix: string, messageId: string): InlineButton[][] {
  return rows.map((row) => row.map((b) => ({ text: b.label, callback_data: `${prefix}:${messageId}:${b.value}` })));
}

export function buildStatusButtons(messageId: string): InlineButton[][] {
  return rowsToButtons(STATUS_BUTTON_ROWS, "status", messageId);
}

export function buildMessageButtons(messageId: string): InlineButton[][] {
  return [...rowsToButtons(STATUS_BUTTON_ROWS, "status", messageId), ...rowsToButtons(CLIENT_TYPE_BUTTON_ROWS, "client", messageId)];
}
