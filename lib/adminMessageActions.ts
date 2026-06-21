"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "./prisma";
import { requireAdmin } from "./adminAuth";
import { MESSAGE_STATUSES } from "./messageStatuses";
import { CLIENT_TYPES } from "./clientTypes";
import { sendTelegramMessage, editTelegramMessage, buildContactMessageText, buildMessageButtons } from "./telegram";

export interface ContactFormState {
  error?: string;
  success?: boolean;
}

export async function submitContactMessageAction(
  _prevState: ContactFormState,
  formData: FormData
): Promise<ContactFormState> {
  const name = String(formData.get("name") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const subject = String(formData.get("subject") ?? "").trim();
  const messageText = String(formData.get("message") ?? "").trim();
  const sourcePath = String(formData.get("source") ?? "").trim();

  if (!name || !phone) {
    return { error: `Lipsește ${!name ? "numele" : ""}${!name && !phone ? " și " : ""}${!phone ? "numărul de telefon" : ""}.` };
  }

  const message = [subject && `Subiect: ${subject}`, messageText].filter(Boolean).join("\n\n") || null;
  const source = sourcePath === "/contact" ? "Pagina de contact" : sourcePath || "Pagina de contact";

  let created;
  try {
    created = await prisma.contactMessage.create({ data: { name, phone, email: email || null, message, source } });
  } catch {
    return { error: "Nu am putut trimite mesajul. Încearcă din nou." };
  }

  const statusLabel = MESSAGE_STATUSES.find((s) => s.value === created.status)?.label ?? created.status;
  const text = buildContactMessageText({ name, phone, email: email || null, message, source, statusLabel });
  const telegramMessageId = await sendTelegramMessage(text, buildMessageButtons(created.id));
  if (telegramMessageId) {
    await prisma.contactMessage.update({ where: { id: created.id }, data: { telegramMessageId } });
  }

  revalidatePath("/admin/mesaje");
  return { success: true };
}

export async function markMessageReadAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  await prisma.contactMessage.update({ where: { id }, data: { read: true } });
  revalidatePath("/admin/mesaje");
}

async function syncTelegramMessage(updated: {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  message: string | null;
  source: string;
  status: string;
  clientType: string | null;
  telegramMessageId: number | null;
}) {
  if (!updated.telegramMessageId) return;
  const statusLabel = MESSAGE_STATUSES.find((s) => s.value === updated.status)?.label ?? updated.status;
  const clientTypeLabel = CLIENT_TYPES.find((c) => c.value === updated.clientType)?.label ?? null;
  const text = buildContactMessageText({
    name: updated.name,
    phone: updated.phone,
    email: updated.email,
    message: updated.message,
    source: updated.source,
    statusLabel,
    clientTypeLabel,
  });
  await editTelegramMessage(updated.telegramMessageId, text, buildMessageButtons(updated.id));
}

export async function setMessageStatusAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "");
  if (!id || !MESSAGE_STATUSES.some((s) => s.value === status)) return;
  const updated = await prisma.contactMessage.update({ where: { id }, data: { status, read: true } });
  await syncTelegramMessage(updated);
  revalidatePath("/admin/mesaje");
}

export async function setClientTypeAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const clientType = String(formData.get("clientType") ?? "");
  if (!id || !CLIENT_TYPES.some((c) => c.value === clientType)) return;
  const updated = await prisma.contactMessage.update({ where: { id }, data: { clientType } });
  await syncTelegramMessage(updated);
  revalidatePath("/admin/mesaje");
}

export async function deleteMessageAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  await prisma.contactMessage.delete({ where: { id } });
  revalidatePath("/admin/mesaje");
}
