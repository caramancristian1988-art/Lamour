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

export async function deleteTelegramUserPermissionAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const telegramUserId = String(formData.get("telegramUserId") ?? "").trim();
  if (!telegramUserId) return;
  await prisma.telegramUserPermission.deleteMany({ where: { telegramUserId } });
  revalidatePath("/admin/telegram");
}
