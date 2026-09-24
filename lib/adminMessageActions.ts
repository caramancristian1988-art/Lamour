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
  buildWarehouseButtons,
  extractInvoiceBlock,
  escapeHtml,
  notifyOrderStageChange,
  getSiteUrl,
  STATUSES_REQUIRING_CONFIRMATION,
} from "./telegram";
import { createShipment, activatePickup, removeShipment, fetchLatestAwbStatus } from "./evsExpress";
import { getChatIdsForRole } from "./telegramRecipients";

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
  // Best-effort: un eșec aici (hiccup de bază) nu trebuie să blocheze plasarea
  // comenzii — comanda rămâne validă și fără număr, alocabil manual din admin.
  const orderNumber = isCartOrder ? await nextOrderNumber().catch(() => null) : null;

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
    telegramMessageId = await sendTelegramMessage(text, buildOrderStageButtons(created.id, "noua", editUrl, Boolean(extractInvoiceBlock(message))));
  } else {
    const statusLabel = MESSAGE_STATUSES.find((s) => s.value === created.status)?.label ?? created.status;
    const text = buildContactMessageText({ name, phone, email: email || null, message, source, statusLabel, products });
    telegramMessageId = await sendTelegramMessage(text, buildMessageButtons(created.id));
  }
  if (telegramMessageId) {
    await prisma.contactMessage.update({ where: { id: created.id }, data: { telegramMessageId } });
  }

  // Comandă cu factură pe companie: contabilul primește datele imediat, fără să aștepte un buton.
  if (isCartOrder && extractInvoiceBlock(message)) {
    await sendInvoiceToAccountant(created.id).catch((err) =>
      console.error("telegram: trimiterea automată a facturii către contabil a eșuat:", err)
    );
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
}, options: { pickup?: boolean } = {}): Promise<{ ok: boolean; description: string } | null> {
  if (message.awbCode) return null;
  if (!message.deliveryAddress || !message.deliveryZip) {
    return { ok: false, description: "comanda nu are adresă/cod poștal de livrare" };
  }

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
    { validateOnly: false, pickup: options.pickup }
  );

  if (result.ok && result.awb) {
    console.log(`evs shipment înregistrat pentru mesajul ${message.id}: ${result.awb}`, JSON.stringify(result.raw));
    await prisma.contactMessage.update({ where: { id: message.id }, data: { awbCode: result.awb, awbCreatedAt: new Date() } });
    return { ok: true, description: result.description };
  }
  console.error(`evs auto-shipment eșuat pentru mesajul ${message.id}:`, result.description);
  return { ok: false, description: result.description };
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
  awbStatus: string | null;
  warehouseMessages: unknown;
  orderNumber: string | null;
  invoiceSentAt: Date | null;
  accountantMessages: unknown;
}) {
  if (!updated.telegramMessageId) return;
  const text = await buildOrderText(updated);
  const editUrl = `${getSiteUrl()}/editare-comanda?token=${updated.editToken ?? ""}`;
  const buttons =
    updated.orderStage === "noua" || updated.orderStage === "confirmata"
      ? buildOrderStageButtons(updated.id, updated.orderStage, editUrl,
          Boolean(extractInvoiceBlock(updated.message)) && !updated.invoiceSentAt,
          // Niciun depozitar conectat -> altfel comanda n-ar mai putea fi marcată gata de ridicare.
          !Array.isArray(updated.warehouseMessages) || updated.warehouseMessages.length === 0
        )
      : [];
  await editTelegramMessage(updated.telegramMessageId, text, buttons);
  // Copiile din privat ale contabililor (comenzi cu factură) rămân în pas cu mesajul principal.
  await Promise.all(
    parseChatMessages(updated.accountantMessages).map((m) => editTelegramMessage(m.messageId, text, [], m.chatId))
  );
}

// Același text ca în grupul principal — folosit și pentru copiile trimise contabililor.
async function buildOrderText(order: {
  name: string;
  phone: string;
  email: string | null;
  message: string | null;
  source: string;
  orderStage: string | null;
  productIds: string[];
  awbCode: string | null;
  awbStatus: string | null;
  orderNumber: string | null;
}): Promise<string> {
  const products = await getProductsByIds(order.productIds);
  const stageLabel = orderStageLabel(order.orderStage);
  return buildContactMessageText({
    name: order.name,
    phone: order.phone,
    email: order.email,
    message: order.message,
    source: order.source,
    statusLabel: order.awbCode ? `${stageLabel} — AWB ${order.awbCode}${order.awbStatus ? ` (${order.awbStatus})` : ""}` : stageLabel,
    products,
    orderNumber: order.orderNumber,
  });
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
//
// Confirmare -> AWB creat obișnuit (pickup=0, curierul NU e chemat încă) + mesaj către
// depozitar cu butonul "Gata de ridicare". Acel buton -> ActivatePickUp pe același AWB.
export async function advanceOrderStage(messageId: string, nextStage: OrderStage) {
  const before = await prisma.contactMessage.findUniqueOrThrow({ where: { id: messageId } });
  // Buton apăsat de două ori / update Telegram livrat de două ori — nu repetăm efectele
  // (AWB duplicat, contor de vânzări dublu, notificări duble).
  if (before.orderStage === nextStage) return before;
  // Un buton vechi din chatul depozitarului nu poate învia o comandă anulată.
  if (before.orderStage === "anulata") return before;

  // Tranziție atomică: doar cererea care găsește încă etapa veche o aplică — două apăsări simultane
  // (sau același update Telegram livrat de două ori) nu mai pot chema curierul / crește vânzările de două ori.
  const claimed = await prisma.contactMessage.updateMany({
    where: { id: messageId, ...(before.orderStage ? { orderStage: before.orderStage } : { orderStage: { isSet: false } }) },
    data: { orderStage: nextStage },
  });
  if (claimed.count === 0) return before;

  const warn = async (text: string) => {
    await sendTelegramMessage(`⚠️ ${escapeHtml(orderRef(before.orderNumber))}: ${escapeHtml(text)}`, [], before.telegramMessageId ?? undefined);
  };

  if (nextStage === "confirmata") {
    const shipment = await maybeCreateEvsShipment(before, { pickup: false });
    // Comanda rămâne confirmată chiar dacă AWB-ul nu s-a creat (se reîncearcă la "gata de ridicare"),
    // dar operatorul trebuie să știe — altfel eșecul rămânea doar în logurile serverului.
    if (shipment && !shipment.ok) await warn(`AWB-ul nu a putut fi creat la confirmare (${shipment.description}). Se reîncearcă la „Gata de ridicare”.`);
  } else if (nextStage === "predata_curier") {
    let ready = { ok: true, description: "" };
    if (before.awbCode) {
      const result = await activatePickup(before.awbCode);
      console.log(`evs activatePickup ${before.awbCode}:`, JSON.stringify(result.raw));
      ready = { ok: result.ok, description: result.description };
    } else {
      const shipment = await maybeCreateEvsShipment(before, { pickup: true });
      if (shipment && !shipment.ok) ready = shipment;
    }
    if (!ready.ok) {
      // Fără asta comanda apărea "gata de ridicare" deși curierul nu fusese chemat. Revenim la etapa
      // veche (butonul rămâne apăsabil) și spunem clar de ce.
      await prisma.contactMessage.updateMany({ where: { id: messageId, orderStage: nextStage }, data: { orderStage: before.orderStage } });
      await warn(`ridicarea nu a putut fi activată la EVS: ${ready.description}. Comanda rămâne la etapa anterioară — încearcă din nou.`);
      return before;
    }
    if (before.productIds.length > 0) {
      await prisma.product.updateMany({ where: { id: { in: before.productIds } }, data: { salesCount: { increment: 1 } } });
    }
  } else if (nextStage === "anulata" && before.awbCode && before.orderStage === "confirmata") {
    // Doar cât AWB-ul nu e "gata de ridicare" — după aceea curierul poate fi deja pe drum.
    const result = await removeShipment(before.awbCode);
    if (result.ok) {
      await prisma.contactMessage.update({ where: { id: messageId }, data: { awbCode: null, awbCreatedAt: null } });
    } else {
      console.error(`evs removeShipment eșuat pentru ${before.awbCode}:`, result.description);
      await warn(`AWB-ul ${before.awbCode} nu a putut fi șters la EVS (${result.description}) — șterge-l manual.`);
    }
  }

  // Statusul AWB-ului la EVS (ex. "Received information") — înainte se citea doar manual din admin.
  const current = await prisma.contactMessage.findUniqueOrThrow({ where: { id: messageId } });
  if (current.awbCode) {
    const awbStatus = await fetchLatestAwbStatus(current.awbCode);
    if (awbStatus) await prisma.contactMessage.update({ where: { id: messageId }, data: { awbStatus } });
  }

  // Reia mesajul — awbCode/awbStatus pot fi setate/șterse mai sus.
  const updated = await prisma.contactMessage.findUniqueOrThrow({ where: { id: messageId } });
  await syncOrderTelegramMessage(updated);
  await syncWarehouseMessage(updated);
  // Managerul vede orice schimbare de etapă; curierul doar când comanda e gata de ridicare.
  const extraChatIds = [
    ...(await getChatIdsForRole("manager")),
    ...(nextStage === "predata_curier" ? await getChatIdsForRole("curier") : []),
  ];
  await notifyOrderStageChange(nextStage, updated.orderNumber, updated.telegramMessageId, [...new Set(extraChatIds)]);

  revalidatePath("/admin/mesaje");
  if (nextStage === "predata_curier") {
    revalidatePath("/admin/produse");
    revalidatePath("/produse");
  }
  return updated;
}

function orderRef(orderNumber: string | null): string {
  return orderNumber ? `Comanda #${orderNumber}` : "Comanda";
}

// Mesajul din chatul depozitarului: trimis la confirmare (cu butonul "Gata de ridicare"),
// apoi editat la ridicare/anulare ca să nu rămână un buton activ pe o comandă închisă.
// Fără TELEGRAM_WAREHOUSE_CHAT_ID nu se trimite nimic (fluxul rămâne funcțional din admin).
async function syncWarehouseMessage(order: {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  message: string | null;
  source: string;
  orderStage: string | null;
  productIds: string[];
  awbCode: string | null;
  awbStatus: string | null;
  orderNumber: string | null;
  warehouseMessages: unknown;
}) {
  const sent = parseChatMessages(order.warehouseMessages);
  const stageLabel =
    order.orderStage === "confirmata"
      ? "De pregătit"
      : order.orderStage === "predata_curier"
        ? "Gata de ridicare ✔"
        : orderStageLabel(order.orderStage);
  const products = await getProductsByIds(order.productIds);
  const text = buildContactMessageText({
    name: order.name,
    phone: order.phone,
    email: order.email,
    message: order.message,
    source: order.source,
    statusLabel: order.awbCode ? `${stageLabel} — AWB ${order.awbCode}${order.awbStatus ? ` (${order.awbStatus})` : ""}` : stageLabel,
    products,
    orderNumber: order.orderNumber,
  });
  const buttons = buildWarehouseButtons(order.id, order.orderStage ?? "");

  if (sent.length > 0) {
    await Promise.all(sent.map((m) => editTelegramMessage(m.messageId, text, buttons, m.chatId)));
  } else if (order.orderStage === "confirmata") {
    const chatIds = await getChatIdsForRole("depozitar");
    if (chatIds.length === 0) {
      console.error("telegram: niciun depozitar nu are Telegram conectat — comanda nu a fost trimisă depozitarului");
      return;
    }
    const results = await Promise.all(
      chatIds.map(async (chatId) => ({ chatId, messageId: await sendTelegramMessage(text, buttons, undefined, chatId) }))
    );
    const delivered = results.filter((r): r is { chatId: string; messageId: number } => r.messageId !== null);
    if (delivered.length > 0) {
      await prisma.contactMessage.update({ where: { id: order.id }, data: { warehouseMessages: delivered } });
    }
  }
}

function parseChatMessages(value: unknown): { chatId: string; messageId: number }[] {
  if (!Array.isArray(value)) return [];
  return value.filter(
    (m): m is { chatId: string; messageId: number } =>
      typeof m?.chatId === "string" && typeof m?.messageId === "number"
  );
}

// Comenzile cu factură pe companie: contabilul primește în privat aceeași comandă ca în grupul principal
// (text complet, editat mai departe odată cu ea). Automat la plasarea comenzii; butonul "🧾 Trimite factura"
// din Telegram rămâne pentru comenzile mai vechi. Se trimite o singură dată (invoiceSentAt).
export async function sendInvoiceToAccountant(
  messageId: string,
  options: { mainGroup?: boolean } = {}
): Promise<"sent" | "already" | "none" | "failed"> {
  const order = await prisma.contactMessage.findUniqueOrThrow({ where: { id: messageId } });
  if (!extractInvoiceBlock(order.message)) return "none";
  if (order.invoiceSentAt) return "already";

  // Marcăm întâi, ca un al doilea click (sau update livrat dublu) să nu trimită comanda de două ori.
  const claimed = await prisma.contactMessage.updateMany({
    // Pe MongoDB câmpul lipsește complet la comenzile fără factură trimisă (nu e null) — `invoiceSentAt: null`
    // nu le-ar găsi niciodată, deci trebuie acoperit explicit și cazul "nesetat".
    where: { id: messageId, OR: [{ invoiceSentAt: null }, { invoiceSentAt: { isSet: false } }] },
    data: { invoiceSentAt: new Date() },
  });
  if (claimed.count === 0) return "already";

  const accountants = await getChatIdsForRole("contabil");
  const text = await buildOrderText(order);
  const results = await Promise.all(
    accountants.map(async (chatId) => ({ chatId, messageId: await sendTelegramMessage(text, [], undefined, chatId) }))
  );
  const delivered = results.filter((r): r is { chatId: string; messageId: number } => r.messageId !== null);
  const label = order.orderNumber ? `Comanda #${order.orderNumber}` : "Comanda";

  if (delivered.length === 0) {
    // Nimic nu a ajuns (niciun contabil conectat, sau Telegram a refuzat livrarea — de obicei persoana n-a apăsat
    // Start în bot). Eliberăm marcajul, ca butonul "Trimite factura" să rămână și retrimiterea să fie posibilă,
    // și spunem asta în grup — înainte se anunța "trimisă" fără nicio verificare.
    await prisma.contactMessage.update({ where: { id: messageId }, data: { invoiceSentAt: null } });
    const reason = accountants.length === 0
      ? "niciun contabil nu are Telegram conectat"
      : "Telegram a refuzat livrarea — contabilul trebuie să deschidă botul și să apese Start";
    console.error(`telegram: comanda cu factură ${messageId} nu a ajuns la contabil: ${reason}`);
    await sendTelegramMessage(`⚠️ ${escapeHtml(label)}: factura NU a ajuns la contabil (${escapeHtml(reason)}). Apasă din nou „Trimite factura” după ce se rezolvă.`, [], order.telegramMessageId ?? undefined);
    const restored = await prisma.contactMessage.findUniqueOrThrow({ where: { id: messageId } });
    await syncOrderTelegramMessage(restored);
    return "failed";
  }

  await prisma.contactMessage.update({ where: { id: messageId }, data: { accountantMessages: delivered } });

  // Apăsat manual din grup: confirmare vizibilă acolo (la plasare, mesajul principal e deja acolo).
  if (options.mainGroup !== false) {
    await sendTelegramMessage(`🧾 ${escapeHtml(label)} trimisă contabilului pentru factură.`, [], order.telegramMessageId ?? undefined);
  }

  const updated = await prisma.contactMessage.findUniqueOrThrow({ where: { id: messageId } });
  await syncOrderTelegramMessage(updated);
  return "sent";
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
