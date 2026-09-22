"use server";

import { randomBytes } from "crypto";
import { revalidatePath } from "next/cache";
import { prisma } from "./prisma";
import { requireAdmin } from "./adminAuth";
import { MESSAGE_STATUSES } from "./messageStatuses";
import { MOODS } from "./moods";
import { ORDER_STAGES, orderStageLabel, type OrderStage } from "./orderStages";
import { nextOrderNumber } from "./orderNumber";
import {
  sendTelegramMessage,
  editTelegramMessage,
  buildContactMessageText,
  buildMessageButtons,
  buildOrderStageButtons,
  getSiteUrl,
  STATUSES_REQUIRING_CONFIRMATION,
} from "./telegram";
import { createShipment } from "./evsExpress";

export interface ContactFormState {
  error?: string;
  success?: boolean;
}

const CART_ORDER_SOURCE = "Comandă din coș";

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

// Cantitățile din formularul de checkout (JSON: [{ slug, quantity }]),
// rezolvate la productId prin lista deja încărcată de resolveProducts —
// stocate separat de productIds ca la editare să putem reconstitui coșul
// cu cantitățile corecte (productIds e doar o listă flată de id-uri).
function resolveOrderItems(
  formData: FormData,
  products: { id: string; slug: string }[]
): { productId: string; quantity: number }[] {
  const raw = String(formData.get("orderItems") ?? "").trim();
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as { slug: string; quantity: number }[];
    const bySlug = new Map(products.map((p) => [p.slug, p.id]));
    return parsed
      .map((item) => ({ productId: bySlug.get(item.slug), quantity: Math.max(1, Math.floor(Number(item.quantity) || 1)) }))
      .filter((item): item is { productId: string; quantity: number } => Boolean(item.productId));
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
  const orderItems = resolveOrderItems(formData, products);

  // Comenzile din coș intră pe fluxul separat operator -> depozitar ->
  // curier (lib/orderStages.ts) — au nevoie de un token de editare, folosit
  // de butonul "Editează" din Telegram ca să deschidă coșul pre-completat
  // fără login separat pentru operatori.
  const isCartOrder = source === CART_ORDER_SOURCE;
  const editToken = isCartOrder ? randomBytes(24).toString("hex") : null;
  const orderNumber = isCartOrder ? await nextOrderNumber() : null;

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
        ...(isCartOrder ? { orderStage: "noua", editToken, orderItems, orderNumber } : {}),
      },
    });
  } catch {
    return { error: "Nu am putut trimite mesajul. Încearcă din nou." };
  }

  let telegramMessageId: number | null;
  if (isCartOrder) {
    const editUrl = `${getSiteUrl()}/editare-comanda?token=${editToken}`;
    const text = buildContactMessageText({ name, phone, email: email || null, message, source, statusLabel: orderStageLabel("noua"), products, orderNumber });
    telegramMessageId = await sendTelegramMessage(text, buildOrderStageButtons(created.id, "noua", editUrl));
  } else {
    const statusLabel = MESSAGE_STATUSES.find((s) => s.value === created.status)?.label ?? created.status;
    const text = buildContactMessageText({ name, phone, email: email || null, message, source, statusLabel, products });
    telegramMessageId = await sendTelegramMessage(text, buildMessageButtons(created.id));
  }
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
    console.log(`evs shipment înregistrat pentru mesajul ${message.id}: ${result.awb}`, JSON.stringify(result.raw));
    await prisma.contactMessage.update({ where: { id: message.id }, data: { awbCode: result.awb, awbCreatedAt: new Date() } });
  } else {
    console.error(`evs auto-shipment eșuat pentru mesajul ${message.id}:`, result.description);
  }
}

// Re-editează mesajul din Telegram al unei comenzi (buton Editează, sau o
// tranziție de etapă) — text + butoane potrivite etapei curente.
async function syncOrderTelegramMessage(updated: {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  message: string | null;
  source: string;
  orderStage: string | null;
  editToken: string | null;
  telegramMessageId: number | null;
  productIds: string[];
  awbCode: string | null;
  orderNumber: string | null;
}) {
  if (!updated.telegramMessageId) return;
  const products = await getProductsByIds(updated.productIds);
  const stageLabel = orderStageLabel(updated.orderStage);
  const text = buildContactMessageText({
    name: updated.name,
    phone: updated.phone,
    email: updated.email,
    message: updated.message,
    source: updated.source,
    statusLabel: updated.awbCode ? `${stageLabel} — AWB ${updated.awbCode}` : stageLabel,
    products,
    orderNumber: updated.orderNumber,
  });
  const editUrl = `${getSiteUrl()}/editare-comanda?token=${updated.editToken ?? ""}`;
  const buttons =
    updated.orderStage === "noua" || updated.orderStage === "confirmata"
      ? buildOrderStageButtons(updated.id, updated.orderStage, editUrl)
      : [];
  await editTelegramMessage(updated.telegramMessageId, text, buttons);
}

// Actualizează o comandă existentă prin link-ul de editare (token, fără
// login) — singurul control de acces e potrivirea editToken + faptul că
// mai e în etapa "noua" (o dată confirmată de operator, linkul nu mai
// funcționează). Folosită de CheckoutPanel când operatorul reia checkout-ul
// din /editare-comanda.
export async function updateOrderMessageAction(
  _prevState: ContactFormState,
  formData: FormData
): Promise<ContactFormState> {
  const messageId = String(formData.get("messageId") ?? "");
  const editToken = String(formData.get("editToken") ?? "");
  if (!messageId || !editToken) return { error: "Link invalid." };

  const existing = await prisma.contactMessage.findUnique({ where: { id: messageId } });
  if (!existing || existing.editToken !== editToken || existing.orderStage !== "noua") {
    return { error: "Acest link de editare nu mai este valid — comanda a fost deja procesată." };
  }

  const name = String(formData.get("name") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const message = String(formData.get("message") ?? "").trim() || null;

  if (!name || !phone) {
    return { error: `Lipsește ${!name ? "numele" : "numărul de telefon"}.` };
  }

  const deliveryLocality = String(formData.get("deliveryLocality") ?? "").trim() || null;
  const deliveryAddress = String(formData.get("deliveryAddress") ?? "").trim() || null;
  const deliveryZip = String(formData.get("deliveryZip") ?? "").trim() || null;
  const deliveryWeightKgRaw = Number(formData.get("deliveryWeightKg"));
  const deliveryWeightKg = Number.isFinite(deliveryWeightKgRaw) && deliveryWeightKgRaw > 0 ? deliveryWeightKgRaw : null;
  const deliveryCodAmountRaw = Number(formData.get("deliveryCodAmount"));
  const deliveryCodAmount = Number.isFinite(deliveryCodAmountRaw) && deliveryCodAmountRaw >= 0 ? deliveryCodAmountRaw : null;

  const products = await resolveProducts(formData);
  const productIds = products.map((p) => p.id);
  const orderItems = resolveOrderItems(formData, products);

  let updated;
  try {
    updated = await prisma.contactMessage.update({
      where: { id: messageId },
      data: {
        name,
        phone,
        email: email || null,
        message,
        productIds,
        orderItems,
        deliveryLocality,
        deliveryAddress,
        deliveryZip,
        deliveryWeightKg,
        deliveryCodAmount,
      },
    });
  } catch {
    return { error: "Nu am putut actualiza comanda. Încearcă din nou." };
  }

  await syncOrderTelegramMessage(updated);
  revalidatePath("/admin/mesaje");
  return { success: true };
}

// Avansează o comandă la etapa următoare (operator confirmă / depozitar
// predă la curier) sau o anulează — folosită atât de webhook-ul Telegram
// cât și de acțiunea din admin, ca cele două suprafețe să rămână în sincron.
export async function advanceOrderStage(messageId: string, nextStage: OrderStage) {
  const updated = await prisma.contactMessage.update({ where: { id: messageId }, data: { orderStage: nextStage } });

  if (nextStage === "predata_curier") {
    if (updated.productIds.length > 0) {
      await prisma.product.updateMany({ where: { id: { in: updated.productIds } }, data: { salesCount: { increment: 1 } } });
    }
    await maybeCreateEvsShipment(updated);
    // Reia mesajul actualizat — maybeCreateEvsShipment poate fi setat awbCode.
    const withAwb = await prisma.contactMessage.findUnique({ where: { id: messageId } });
    if (withAwb) await syncOrderTelegramMessage(withAwb);
    revalidatePath("/admin/mesaje");
    revalidatePath("/admin/produse");
    revalidatePath("/produse");
    return withAwb ?? updated;
  }

  await syncOrderTelegramMessage(updated);
  revalidatePath("/admin/mesaje");
  return updated;
}

// Numărul de comandă e doar o referință de afișare (nu o cheie) — un admin
// îl poate suprascrie liber, inclusiv cu un text care coincide cu alt id
// (ex. ca să alinieze cu un alt sistem de evidență).
export async function updateOrderNumberAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const orderNumber = String(formData.get("orderNumber") ?? "").trim();
  if (!id) return;
  const updated = await prisma.contactMessage.update({ where: { id }, data: { orderNumber: orderNumber || null } });
  await syncOrderTelegramMessage(updated);
  revalidatePath("/admin/mesaje");
}

export async function setOrderStageAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const stage = String(formData.get("stage") ?? "");
  if (!id || !ORDER_STAGES.some((s) => s.value === stage)) return;
  await advanceOrderStage(id, stage as OrderStage);
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
