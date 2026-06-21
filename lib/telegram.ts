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
  ].filter((l) => l !== null);
  return lines.join("\n");
}

export const STATUS_BUTTONS: { value: string; label: string }[] = [
  { value: "sunat", label: "📞 L-am sunat" },
  { value: "nu_raspunde", label: "🚫 Nu răspunde" },
  { value: "asteptam_plata", label: "⏳ Aștept plata" },
  { value: "rezolvat", label: "✅ Rezolvat" },
];

export function buildStatusButtons(messageId: string): InlineButton[][] {
  return [
    [STATUS_BUTTONS[0], STATUS_BUTTONS[1]].map((b) => ({ text: b.label, callback_data: `status:${messageId}:${b.value}` })),
    [STATUS_BUTTONS[2], STATUS_BUTTONS[3]].map((b) => ({ text: b.label, callback_data: `status:${messageId}:${b.value}` })),
  ];
}
