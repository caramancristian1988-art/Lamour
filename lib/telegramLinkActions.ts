"use server";

import { randomBytes } from "crypto";
import { revalidatePath } from "next/cache";
import { prisma } from "./prisma";
import { requireAdmin } from "./adminAuth";
import { getBotUsername, sendTelegramMessage } from "./telegram";
import { isStaffRole, staffRoleLabel } from "./staffRoles";

// Toate acțiunile de aici sunt doar pentru admin: destinatarii Telegram nu au cont pe site,
// deci nu există alt mod de a-i gestiona decât din /admin/telegram.

export interface TelegramActionState {
  ok?: boolean;
  error?: string;
  // Se schimbă la fiecare adăugare reușită — formularul se remontează (key) și se golește.
  at?: number;
}

export interface TelegramLinkState {
  url?: string;
  error?: string;
}

export async function addTelegramRecipientAction(
  _prev: TelegramActionState,
  formData: FormData
): Promise<TelegramActionState> {
  await requireAdmin();
  const name = String(formData.get("name") ?? "").trim();
  const role = String(formData.get("role") ?? "");
  if (!name) return { error: "Completează numele." };
  if (!isStaffRole(role)) return { error: "Alege un rol." };

  await prisma.telegramRecipient.create({ data: { name, role } });
  revalidatePath("/admin/telegram");
  return { ok: true, at: Date.now() };
}

// Butonul "Conectează Telegram": generează un token de unică folosință și întoarce linkul
// t.me/<bot>?start=<token>. Când persoana apasă Start în Telegram, webhook-ul leagă chatul
// de destinatar (lib/telegramRecipients.ts → linkChatByToken).
export async function createTelegramLinkAction(recipientId: string): Promise<TelegramLinkState> {
  await requireAdmin();
  const botUsername = await getBotUsername();
  if (!botUsername) return { error: "Botul Telegram nu este configurat (lipsește TELEGRAM_BOT_TOKEN)." };

  const token = randomBytes(16).toString("hex");
  const updated = await prisma.telegramRecipient.updateMany({ where: { id: recipientId }, data: { linkToken: token } });
  if (updated.count === 0) return { error: "Destinatarul nu mai există." };
  return { url: `https://t.me/${botUsername}?start=${token}` };
}

// Folosit de componentul de conectare ca să afle (polling) când persoana a apăsat Start în Telegram.
export async function getTelegramConnectedAction(recipientId: string): Promise<boolean> {
  await requireAdmin();
  const r = await prisma.telegramRecipient.findUnique({ where: { id: recipientId }, select: { chatId: true } });
  return Boolean(r?.chatId);
}

export async function disconnectTelegramAction(recipientId: string) {
  await requireAdmin();
  await prisma.telegramRecipient.updateMany({ where: { id: recipientId }, data: { chatId: null, linkToken: null } });
  revalidatePath("/admin/telegram");
}

export async function deleteTelegramRecipientAction(recipientId: string) {
  await requireAdmin();
  await prisma.telegramRecipient.deleteMany({ where: { id: recipientId } });
  revalidatePath("/admin/telegram");
}

// Mesaj de probă către chatul salvat — arată imediat dacă persoana chiar primește (Telegram refuză
// livrarea dacă n-a apăsat niciodată Start în bot).
export async function sendTelegramTestAction(recipientId: string): Promise<TelegramActionState> {
  await requireAdmin();
  const r = await prisma.telegramRecipient.findUnique({ where: { id: recipientId } });
  if (!r?.chatId) return { error: "Persoana nu e conectată încă." };
  const id = await sendTelegramMessage(
    `🔔 Mesaj de test pentru ${r.name} (${staffRoleLabel(r.role) ?? r.role}). Dacă îl vezi, notificările funcționează.`,
    [],
    undefined,
    r.chatId
  );
  return id ? { ok: true } : { error: "Telegram a refuzat livrarea — persoana trebuie să deschidă botul și să apese Start." };
}
