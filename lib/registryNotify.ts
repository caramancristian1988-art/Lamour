// Notificarea accesibilă pentru comenzile noi, trimisă în grupul registrului (TELEGRAM_REGISTRY_CHAT_ID).
// Text simplu, în ordine logică, fără emoji și fără tabele; FĂRĂ telefon/adresă (acestea se văd doar în privat,
// de persoanele autorizate). Grupul principal al operatorilor/depozitarilor își păstrează mesajul existent.
//
// Trimiterea e best-effort: o eroare Telegram NU împiedică salvarea comenzii. Dacă eșuează, câmpul
// registryNotifiedAt rămâne gol, iar retryPendingRegistryNotifications() o reîncearcă (fără să dubleze comanda).
import { prisma } from "./prisma";
import { sendTelegramMessage, escapeHtml } from "./telegram";
import { describeItemsForSpeech, findRegistryOrder, formatMoney, EXTRACTION_LABELS, type RegistryOrder } from "./orderRegistry";
import { CART_ORDER_SOURCE } from "./orderStages";

export function registryChatId(): string | null {
  return process.env.TELEGRAM_REGISTRY_CHAT_ID?.trim() || null;
}

export function buildNewOrderAnnouncement(o: RegistryOrder): string {
  const lines = [
    `Comandă nouă. Numărul ${o.ref}.`,
    `Client: ${o.name}.`,
    `Produse: ${describeItemsForSpeech(o.items)}.`,
    `Total: ${formatMoney(o.total)}.`,
    `Status extragere: ${EXTRACTION_LABELS[o.extractionStatus].toLowerCase()}.`,
  ];
  return lines.map(escapeHtml).join("\n\n");
}

export async function notifyRegistryOfNewOrder(orderId: string): Promise<boolean> {
  const chatId = registryChatId();
  if (!chatId) return false; // grupul registrului nu e configurat — nu e o eroare
  try {
    const order = await findRegistryOrder(orderId);
    if (!order) return false;
    const messageId = await sendTelegramMessage(buildNewOrderAnnouncement(order), [], undefined, chatId);
    if (!messageId) return false;
    await prisma.contactMessage.update({ where: { id: orderId }, data: { registryNotifiedAt: new Date() } });
    return true;
  } catch (err) {
    console.error("registru: notificarea comenzii noi a eșuat:", err);
    return false;
  }
}

/** Reîncearcă notificările rămase netrimise (Telegram indisponibil la plasarea comenzii). Returnează câte au plecat. */
export async function retryPendingRegistryNotifications(limit = 10): Promise<number> {
  if (!registryChatId()) return 0;
  try {
    // Doar comenzile din ultimele 7 zile — comenzile vechi, dinainte de registru, nu se notifică retroactiv.
    const since = new Date(Date.now() - 7 * 24 * 3600 * 1000);
    const pending = await prisma.contactMessage.findMany({
      where: {
        source: CART_ORDER_SOURCE,
        createdAt: { gte: since },
        OR: [{ registryNotifiedAt: { isSet: false } }, { registryNotifiedAt: null }],
        AND: [{ OR: [{ extractionStatus: { isSet: false } }, { extractionStatus: null }, { extractionStatus: "neextrasa" }] }],
      },
      orderBy: { createdAt: "asc" },
      take: limit,
      select: { id: true },
    });
    let sent = 0;
    for (const p of pending) if (await notifyRegistryOfNewOrder(p.id)) sent++;
    return sent;
  } catch (err) {
    console.error("registru: reîncercarea notificărilor a eșuat:", err);
    return 0;
  }
}
