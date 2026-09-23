"use server";

import { randomBytes } from "crypto";
import { revalidatePath } from "next/cache";
import { prisma } from "./prisma";
import { getSession } from "./auth";
import { getBotUsername } from "./telegram";

export interface TelegramLinkState {
  url?: string;
  error?: string;
}

// Butonul "Conectează Telegram": generează un token de unică folosință și întoarce linkul
// t.me/<bot>?start=<token>. Când persoana apasă Start în Telegram, webhook-ul leagă chatul
// de cont (lib/telegramRecipients.ts → linkChatByToken).
export async function createTelegramLinkAction(): Promise<TelegramLinkState> {
  const user = await getSession();
  if (!user) return { error: "Trebuie să fii autentificat." };

  const botUsername = await getBotUsername();
  if (!botUsername) return { error: "Botul Telegram nu este configurat (lipsește TELEGRAM_BOT_TOKEN)." };

  const token = randomBytes(16).toString("hex");
  await prisma.user.update({ where: { id: user.id }, data: { telegramLinkToken: token } });
  return { url: `https://t.me/${botUsername}?start=${token}` };
}

export async function disconnectTelegramAction() {
  const user = await getSession();
  if (!user) return;
  await prisma.user.update({ where: { id: user.id }, data: { telegramChatId: null, telegramLinkToken: null } });
  revalidatePath("/cont");
  revalidatePath("/admin/setari");
}

// Folosit de componentul de conectare ca să afle (polling) când persoana a apăsat Start în Telegram.
export async function getTelegramConnectedAction(): Promise<boolean> {
  const user = await getSession();
  return Boolean(user?.telegramChatId);
}
