"use server";

import { randomBytes } from "crypto";
import { revalidatePath } from "next/cache";
import { prisma } from "./prisma";
import { getSession } from "./auth";
import { requireAdmin } from "./adminAuth";
import { getBotUsername } from "./telegram";

export interface TelegramLinkState {
  url?: string;
  error?: string;
}

// Contul țintă: al utilizatorului logat (Contul meu) sau, doar pentru admin, al altui utilizator
// (Admin → Utilizatori). Pentru alt cont cerem admin — altfel oricine ar putea lega chatul lui de contul altcuiva.
async function resolveTargetUserId(userId?: string): Promise<string | null> {
  const me = await getSession();
  if (!me) return null;
  if (!userId || userId === me.id) return me.id;
  await requireAdmin();
  return userId;
}

// Butonul "Conectează Telegram": generează un token de unică folosință și întoarce linkul
// t.me/<bot>?start=<token>. Când persoana apasă Start în Telegram, webhook-ul leagă chatul
// de cont (lib/telegramRecipients.ts → linkChatByToken).
export async function createTelegramLinkAction(userId?: string): Promise<TelegramLinkState> {
  const targetId = await resolveTargetUserId(userId);
  if (!targetId) return { error: "Trebuie să fii autentificat." };

  const botUsername = await getBotUsername();
  if (!botUsername) return { error: "Botul Telegram nu este configurat (lipsește TELEGRAM_BOT_TOKEN)." };

  const token = randomBytes(16).toString("hex");
  await prisma.user.update({ where: { id: targetId }, data: { telegramLinkToken: token } });
  return { url: `https://t.me/${botUsername}?start=${token}` };
}

export async function disconnectTelegramAction(userId?: string) {
  const targetId = await resolveTargetUserId(userId);
  if (!targetId) return;
  await prisma.user.update({ where: { id: targetId }, data: { telegramChatId: null, telegramLinkToken: null } });
  revalidatePath("/cont");
  revalidatePath("/admin/setari");
  revalidatePath("/admin/utilizatori");
}

// Folosit de componentul de conectare ca să afle (polling) când persoana a apăsat Start în Telegram.
export async function getTelegramConnectedAction(userId?: string): Promise<boolean> {
  const targetId = await resolveTargetUserId(userId);
  if (!targetId) return false;
  const user = await prisma.user.findUnique({ where: { id: targetId }, select: { telegramChatId: true } });
  return Boolean(user?.telegramChatId);
}
