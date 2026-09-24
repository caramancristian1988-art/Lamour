// Destinatarii Telegram (depozitar / contabil / curier / manager) și legarea unui chat de un destinatar.
// NU e un fișier "use server" — funcțiile de aici (mai ales linkChatByToken, care acceptă un chatId
// arbitrar) nu trebuie să fie apelabile din browser.
import { prisma } from "./prisma";
import { sendTelegramMessage } from "./telegram";
import { staffRoleLabel, type StaffRole } from "./staffRoles";

// Chat-urile conectate ale destinatarilor cu un anumit rol (poate fi mai mult de un depozitar/contabil).
export async function getChatIdsForRole(role: StaffRole): Promise<string[]> {
  try {
    const recipients = await prisma.telegramRecipient.findMany({
      where: { role, chatId: { not: null } },
      select: { chatId: true },
    });
    return [...new Set(recipients.map((r) => r.chatId).filter((id): id is string => Boolean(id)))];
  } catch (err) {
    console.error(`telegram: nu am putut citi destinatarii pentru rolul ${role}:`, err);
    return [];
  }
}

// Apelată din webhook la "/start <token>": leagă chatul de destinatarul care a generat tokenul.
// Tokenul e de unică folosință (se șterge la legare), deci un link vechi/redistribuit nu mai merge.
export async function linkChatByToken(token: string, chatId: string): Promise<boolean> {
  if (!/^[a-f0-9]{32}$/.test(token)) return false;
  const recipient = await prisma.telegramRecipient.findFirst({ where: { linkToken: token }, select: { id: true, name: true, role: true } });
  if (!recipient) return false;

  await prisma.telegramRecipient.update({ where: { id: recipient.id }, data: { chatId, linkToken: null } });

  const role = staffRoleLabel(recipient.role);
  await sendTelegramMessage(
    `✅ Telegram conectat pentru ${recipient.name}${role ? ` (${role})` : ""}. De acum primești aici notificările comenzilor.`,
    [],
    undefined,
    chatId
  );
  return true;
}
