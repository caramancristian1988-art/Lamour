// Destinatarii Telegram ai conturilor de staff (depozitar / contabil) și legarea unui chat
// de un cont. NU e un fișier "use server" — funcțiile de aici (mai ales linkChatByToken, care
// acceptă un chatId arbitrar) nu trebuie să fie apelabile din browser.
import { prisma } from "./prisma";
import { sendTelegramMessage } from "./telegram";

import { staffRoleLabel, type StaffRole } from "./staffRoles";

// Chat-urile conectate ale conturilor cu un anumit rol (poate fi mai mult de un depozitar/contabil).
export async function getChatIdsForRole(role: StaffRole): Promise<string[]> {
  try {
    const users = await prisma.user.findMany({
      where: { staffRole: role, telegramChatId: { not: null } },
      select: { telegramChatId: true },
    });
    return users.map((u) => u.telegramChatId).filter((id): id is string => Boolean(id));
  } catch (err) {
    console.error(`telegram: nu am putut citi destinatarii pentru rolul ${role}:`, err);
    return [];
  }
}

// Apelată din webhook la "/start <token>": leagă chatul de contul care a generat tokenul.
// Tokenul e de unică folosință (se șterge la legare), deci un link vechi/redistribuit nu mai merge.
export async function linkChatByToken(token: string, chatId: string): Promise<boolean> {
  if (!/^[a-f0-9]{32}$/.test(token)) return false;
  const user = await prisma.user.findFirst({ where: { telegramLinkToken: token }, select: { id: true, name: true, staffRole: true } });
  if (!user) return false;

  await prisma.user.update({ where: { id: user.id }, data: { telegramChatId: chatId, telegramLinkToken: null } });

  const role = staffRoleLabel(user.staffRole);
  await sendTelegramMessage(
    `✅ Telegram conectat pentru ${user.name}${role ? ` (${role})` : ""}. De acum primești aici notificările comenzilor.`,
    [],
    undefined,
    chatId
  );
  return true;
}
