// Sincronizarea mesajelor din Telegram cu starea comenzii / cererii din baza de date (text + butoane). Aici, nu în
// adminMessageActions.ts, pentru că acel fișier e "use server": tot ce exportă devine acțiune apelabilă din browser.
// Funcțiile de aici sunt folosite doar de cod de server (acțiunile admin, webhook-ul Telegram, API-ul de catalog).
import { prisma } from "./prisma";
import { MESSAGE_STATUSES } from "./messageStatuses";
import { MOODS } from "./moods";
import { orderStageLabel } from "./orderStages";
import {
  editTelegramMessage,
  buildContactMessageText,
  buildMessageButtons,
  buildOrderStageButtons,
  buildOrderPrintUrl,
  extractInvoiceBlock,
  getSiteUrl,
  STATUSES_REQUIRING_CONFIRMATION,
} from "./telegram";

export async function getProductsByIds(productIds: string[]): Promise<{ id: string; name: string; slug: string }[]> {
  if (productIds.length === 0) return [];
  try {
    return await prisma.product.findMany({ where: { id: { in: productIds } }, select: { id: true, name: true, slug: true } });
  } catch {
    return [];
  }
}

export async function syncTelegramMessage(updated: {
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

// Re-editează mesajul din Telegram al unei comenzi (buton Editează, sau o
// tranziție de etapă) — text + butoane potrivite etapei curente.
export async function syncOrderTelegramMessage(updated: {
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
  deliveryWeightKg: number | null;
}) {
  if (!updated.telegramMessageId) return;
  const text = await buildOrderText(updated);
  const editUrl = `${getSiteUrl()}/editare-comanda?token=${updated.editToken ?? ""}`;
  const buttons =
    updated.orderStage === "noua" || updated.orderStage === "confirmata"
      ? buildOrderStageButtons(
          updated.id,
          updated.orderStage,
          editUrl,
          Boolean(extractInvoiceBlock(updated.message)) && !updated.invoiceSentAt,
          buildOrderPrintUrl(updated.id, updated.editToken)
        )
      : [];
  await editTelegramMessage(updated.telegramMessageId, text, buttons);
  // Copiile din privat ale contabililor (comenzi cu factură) rămân în pas cu mesajul principal.
  await Promise.all(
    parseChatMessages(updated.accountantMessages).map((m) => editTelegramMessage(m.messageId, text, [], m.chatId))
  );
}

// Același text ca în grupul principal — folosit și pentru copiile trimise contabililor.
export async function buildOrderText(order: {
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
  deliveryWeightKg: number | null;
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
    weightKg: order.deliveryWeightKg,
  });
}

export function parseChatMessages(value: unknown): { chatId: string; messageId: number }[] {
  if (!Array.isArray(value)) return [];
  return value.filter(
    (m): m is { chatId: string; messageId: number } =>
      typeof m?.chatId === "string" && typeof m?.messageId === "number"
  );
}
