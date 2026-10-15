"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "./prisma";
import { requireAdmin } from "./adminAuth";
import { isRegistryPermission } from "./telegramPermissions";

// Drepturile utilizatorilor Telegram asupra registrului de comenzi — doar din /admin/telegram (admin autentificat).
// Utilizatorul își află ID-ul trimițând /id botului.

export async function saveTelegramUserPermissionAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const telegramUserId = String(formData.get("telegramUserId") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();
  if (!/^\d{3,15}$/.test(telegramUserId) || !name) return;

  const permissions = formData.getAll("permissions").map(String).filter(isRegistryPermission);
  await prisma.telegramUserPermission.upsert({
    where: { telegramUserId },
    update: { name, permissions },
    create: { telegramUserId, name, permissions },
  });
  revalidatePath("/admin/telegram");
}

// Drepturi pentru TOȚI cei care scriu într-un grup — ca să nu fie nevoie de ID-ul fiecărei persoane.
// chatId: "principal" (= grupul principal, TELEGRAM_CHAT_ID) sau ID-ul numeric al unui grup (ex. -5380228863).
export async function saveTelegramGroupPermissionAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const chatId = String(formData.get("chatId") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim() || (chatId === "principal" ? "Grupul principal" : "Grup");
  if (chatId !== "principal" && !/^-?d{3,20}$/.test(chatId)) return;

  // „administrare” nu se acordă unui grup întreg — doar persoanelor individual.
  const permissions = formData.getAll("permissions").map(String).filter((p) => isRegistryPermission(p) && p !== "administrare");
  await prisma.telegramGroupPermission.upsert({
    where: { chatId },
    update: { name, permissions },
    create: { chatId, name, permissions },
  });
  revalidatePath("/admin/telegram");
}

export async function deleteTelegramGroupPermissionAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const chatId = String(formData.get("chatId") ?? "").trim();
  if (!chatId) return;
  await prisma.telegramGroupPermission.deleteMany({ where: { chatId } });
  revalidatePath("/admin/telegram");
}

export async function deleteTelegramUserPermissionAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const telegramUserId = String(formData.get("telegramUserId") ?? "").trim();
  if (!telegramUserId) return;
  await prisma.telegramUserPermission.deleteMany({ where: { telegramUserId } });
  revalidatePath("/admin/telegram");
}
