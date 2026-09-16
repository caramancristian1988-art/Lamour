"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "./prisma";
import { requireAdmin } from "./adminAuth";
import { MESSAGE_STATUSES } from "./messageStatuses";
import { MOODS } from "./moods";
import {
  sendTelegramMessage,
  editTelegramMessage,
  buildContactMessageText,
  buildMessageButtons,
  STATUSES_REQUIRING_CONFIRMATION,
} from "./telegram";
import { createShipment } from "./evsExpress";

export interface ContactFormState {
  error?: string;
  success?: boolean;
}

// Resolves the actual product(s) tied to a message — by id (single product
// requests) or by slug (cart orders, which can list several) — so the
// Telegram link and admin "Vezi produsul" link point at the real product
// instead of relying on fuzzy name matching.
async function resolveProducts(formData: FormData): Promise<{ id: string; name: string; slug: string }[]> {
  try {
    const productId = String(formData.get("productId") ?? "").trim();
    if (productId) {
      return await prisma.product.findMany({ where: { id: productId }, select: { id: true, name: true, slug: true } });
    }
    const slugsRaw = String(formData.get("productSlugs") ?? "").trim();
    const slugs = slugsRaw ? slugsRaw.split(",").map((s) => s.trim()).filter(Boolean) : [];
    if (slugs.length === 0) return [];
    return await prisma.product.findMany({ where: { slug: { in: slugs } }, select: { id: true, name: true, slug: true } });
  } catch {
    return [];
  }
}

async function getProductsByIds(productIds: string[]): Promise<{ id: string; name: string; slug: string }[]> {
  if (productIds.length === 0) return [];
  try {
    return await prisma.product.findMany({ where: { id: { in: productIds } }, select: { id: true, name: true, slug: true } });
  } catch {
    return [];
  }
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

  // Completate doar de CheckoutPanel (comenzi din coș) — folosite ca să
  // putem crea automat expedierea EVS Express când comanda e marcată
  // "Achitat", fără să depindem de parsarea textului liber al mesajului.
  const deliveryLocality = String(formData.get("deliveryLocality") ?? "").trim() || null;
  const deliveryAddress = String(formData.get("deliveryAddress") ?? "").trim() || null;
  const deliveryZip = String(formData.get("deliveryZip") ?? "").trim() || null;
  const deliveryWeightKgRaw = Number(formData.get("deliveryWeightKg"));
  const deliveryWeightKg = Number.isFinite(deliveryWeightKgRaw) && deliveryWeightKgRaw > 0 ? deliveryWeightKgRaw : null;
  const deliveryCodAmountRaw = Number(formData.get("deliveryCodAmount"));
  const deliveryCodAmount = Number.isFinite(deliveryCodAmountRaw) && deliveryCodAmountRaw >= 0 ? deliveryCodAmountRaw : null;

  const products = await resolveProducts(formData);
  const productIds = products.map((p) => p.id);

  let created;
  try {
    created = await prisma.contactMessage.create({
      data: {
        name,
        phone,
        email: email || null,
        message,
        source,
        productIds,
        deliveryLocality,
        deliveryAddress,
        deliveryZip,
        deliveryWeightKg,
        deliveryCodAmount,
      },
    });
  } catch {
    return { error: "Nu am putut trimite mesajul. Încearcă din nou." };
  }

  const statusLabel = MESSAGE_STATUSES.find((s) => s.value === created.status)?.label ?? created.status;
  const text = buildContactMessageText({ name, phone, email: email || null, message, source, statusLabel, products });
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
  revalidatePath("/admin/notificari");
}

async function syncTelegramMessage(updated: {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  message: string | null;
  source: string;
  status: string;
  mood: string | null;
  telegramMessageId: number | null;
  productIds: string[];
}) {
  if (!updated.telegramMessageId) return;
  const statusLabel = MESSAGE_STATUSES.find((s) => s.value === updated.status)?.label ?? updated.status;
  const moodLabel = MOODS.find((m) => m.value === updated.mood)?.label ?? null;
  const products = await getProductsByIds(updated.productIds);
  const text = buildContactMessageText({
    name: updated.name,
    phone: updated.phone,
    email: updated.email,
    message: updated.message,
    source: updated.source,
    statusLabel,
    moodLabel,
    products,
  });
  const buttons = STATUSES_REQUIRING_CONFIRMATION.includes(updated.status) ? [] : buildMessageButtons(updated.id);
  await editTelegramMessage(updated.telegramMessageId, text, buttons);
}

// "achitat" is the only status that represents a confirmed sale — bump each
// linked product's counter once when it's first marked as paid, and undo it
// if the status is later corrected away from "achitat". Shared by the admin
// UI action and the Telegram webhook (both can change a message's status).
export async function applySalesCountForStatusChange(
  previousStatus: string,
  newStatus: string,
  productIds: string[]
) {
  if (productIds.length === 0 || previousStatus === newStatus) return;
  if (newStatus === "achitat") {
    await prisma.product.updateMany({ where: { id: { in: productIds } }, data: { salesCount: { increment: 1 } } });
  } else if (previousStatus === "achitat") {
    await prisma.product.updateMany({ where: { id: { in: productIds }, salesCount: { gt: 0 } }, data: { salesCount: { decrement: 1 } } });
  }
}

// Creează automat expedierea EVS Express când o comandă e marcată "Achitat"
// — doar dacă are adresă structurată (comenzi din coș; cererile de ofertă nu
// au) și nu are deja un AWB (evită expedieri duplicate la retrogradări/
// remarcări repetate). Un eșec (ZIP greșit, EVS jos etc.) NU blochează
// schimbarea de status — rămâne doar fără AWB, creabil manual din panoul
// EVS Express al mesajului. Apelată atât din admin cât și din webhook-ul
// Telegram (butonul "💰 Achitat" schimbă statusul direct din Telegram).
export async function maybeCreateEvsShipment(message: {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  awbCode: string | null;
  deliveryLocality: string | null;
  deliveryAddress: string | null;
  deliveryZip: string | null;
  deliveryWeightKg: number | null;
  deliveryCodAmount: number | null;
}) {
  if (message.awbCode) return;
  if (!message.deliveryAddress || !message.deliveryZip) return;

  const line1 = [message.deliveryLocality, message.deliveryAddress].filter(Boolean).join(", ");
  const result = await createShipment(
    {
      receiver: {
        name: message.name,
        phone: message.phone,
        email: message.email ?? undefined,
        line1,
        zip: message.deliveryZip,
      },
      weight: message.deliveryWeightKg ?? 1,
      codAmount: message.deliveryCodAmount ?? 0,
    },
    { validateOnly: false }
  );

  if (result.ok && result.awb) {
    await prisma.contactMessage.update({ where: { id: message.id }, data: { awbCode: result.awb, awbCreatedAt: new Date() } });
  } else {
    console.error(`evs auto-shipment eșuat pentru mesajul ${message.id}:`, result.description);
  }
}

export async function setMessageStatusAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "");
  if (!id || !MESSAGE_STATUSES.some((s) => s.value === status)) return;

  const existing = await prisma.contactMessage.findUnique({ where: { id }, select: { status: true, productIds: true } });
  const updated = await prisma.contactMessage.update({ where: { id }, data: { status, read: true } });

  if (existing) await applySalesCountForStatusChange(existing.status, status, existing.productIds);
  if (status === "achitat") await maybeCreateEvsShipment(updated);

  await syncTelegramMessage(updated);
  revalidatePath("/admin/mesaje");
  revalidatePath("/admin/produse");
  revalidatePath("/produse");
}

export async function setMoodAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const mood = String(formData.get("mood") ?? "");
  if (!id || !MOODS.some((m) => m.value === mood)) return;
  const updated = await prisma.contactMessage.update({ where: { id }, data: { mood } });
  await syncTelegramMessage(updated);
  revalidatePath("/admin/mesaje");
}

export async function deleteMessageAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  await prisma.contactMessage.delete({ where: { id } });
  revalidatePath("/admin/mesaje");
  revalidatePath("/admin/notificari");
}
