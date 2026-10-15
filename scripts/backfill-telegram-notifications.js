// One-off: send Telegram notifications for ContactMessage rows created while
// the bot's chat ID was misconfigured, so they don't stay unseen. Mirrors
// submitContactMessageAction's send + telegramMessageId update exactly,
// re-implementing the small pure helpers from lib/telegram.ts (a .ts file,
// no ts-node/tsx available in this project) rather than duplicating logic
// via reflection.
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const MESSAGE_STATUSES = [
  { value: "in_asteptare", label: "În așteptare" },
  { value: "sunat", label: "L-am sunat" },
  { value: "nu_raspunde", label: "Nu răspunde" },
  { value: "se_gandeste", label: "Se gândește" },
  { value: "programat", label: "Programat" },
  { value: "in_lucru", label: "În lucru" },
  { value: "achitat", label: "Achitat" },
  { value: "anulat", label: "Anulat" },
];

const STATUS_BUTTON_ROWS = [
  [{ value: "sunat", label: "📞 Sunat" }, { value: "nu_raspunde", label: "🚫 Nu răspunde" }, { value: "se_gandeste", label: "🤔 Se gândește" }],
  [{ value: "programat", label: "🗓 Programat" }, { value: "in_lucru", label: "🛠 În lucru" }, { value: "achitat", label: "💰 Achitat" }],
  [{ value: "anulat", label: "❌ Anulat" }],
];
const MOOD_BUTTON_ROWS = [
  [{ value: "incantat", label: "🤑" }, { value: "fericit", label: "😁" }, { value: "nervos", label: "😠" }, { value: "furios", label: "🤬" }],
];

function escapeHtml(value) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function linkifyProducts(text, products, siteUrl) {
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
    return `<a href="${siteUrl}/produse/${p.slug}">${match}</a>`;
  });
}

function buildContactMessageText({ name, phone, email, message, source, statusLabel, products }, siteUrl) {
  const escapedMessage = message ? escapeHtml(message) : null;
  const escapedSource = escapeHtml(source);
  const lines = [
    `📩 <b>Mesaj nou</b>`,
    ``,
    `👤 ${escapeHtml(name)}`,
    `📞 ${escapeHtml(phone)}`,
    email ? `✉️ ${escapeHtml(email)}` : null,
    escapedMessage ? `\n${linkifyProducts(escapedMessage, products, siteUrl)}` : null,
    ``,
    `🔗 Sursă: ${linkifyProducts(escapedSource, products, siteUrl)}`,
    `📌 Status: <b>${escapeHtml(statusLabel)}</b>`,
  ].filter((l) => l !== null);
  return lines.join("\n");
}

function rowsToButtons(rows, prefix, messageId) {
  return rows.map((row) => row.map((b) => ({ text: b.label, callback_data: `${prefix}:${messageId}:${b.value}` })));
}

function buildMessageButtons(messageId) {
  return [...rowsToButtons(STATUS_BUTTON_ROWS, "status", messageId), ...rowsToButtons(MOOD_BUTTON_ROWS, "mood", messageId)];
}

async function sendTelegramMessage(text, buttons) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: "HTML", reply_markup: { inline_keyboard: buttons } }),
  });
  const data = await res.json();
  if (!data?.ok) {
    console.error("  ✗ Telegram a refuzat:", res.status, JSON.stringify(data));
    return null;
  }
  return data?.result?.message_id ?? null;
}

async function main() {
  const siteUrl = process.env.SITE_URL || "https://lamour-zeta.vercel.app";
  const all = await prisma.contactMessage.findMany({ orderBy: { createdAt: "asc" } });
  const missing = all.filter((m) => !m.telegramMessageId);

  console.log(`Trimit ${missing.length} notificări restante...\n`);

  for (const m of missing) {
    const products = m.productIds.length
      ? await prisma.product.findMany({ where: { id: { in: m.productIds } }, select: { id: true, name: true, slug: true } })
      : [];
    const statusLabel = MESSAGE_STATUSES.find((s) => s.value === m.status)?.label ?? m.status;
    const text = buildContactMessageText(
      { name: m.name, phone: m.phone, email: m.email, message: m.message, source: m.source, statusLabel, products },
      siteUrl
    );
    const buttons = buildMessageButtons(m.id);
    const telegramMessageId = await sendTelegramMessage(text, buttons);

    if (telegramMessageId) {
      await prisma.contactMessage.update({ where: { id: m.id }, data: { telegramMessageId } });
      console.log(`  ✓ ${m.name} (${m.createdAt.toISOString()}) — message_id ${telegramMessageId}`);
    } else {
      console.log(`  ✗ ${m.name} (${m.createdAt.toISOString()}) — EȘUAT, vezi eroarea de mai sus`);
    }
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
