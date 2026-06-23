import { prisma } from "@/lib/prisma";
import AdminPageHeader from "../components/AdminPageHeader";
import MessagesList from "./MessagesList";

async function getMessages() {
  try {
    return await prisma.contactMessage.findMany({ orderBy: { createdAt: "desc" } });
  } catch (e) {
    console.error("mesaje: failed to load messages", e);
    return [];
  }
}

async function getProductsByIds(ids: string[]) {
  if (ids.length === 0) return [];
  try {
    return await prisma.product.findMany({ where: { id: { in: ids } }, select: { id: true, name: true, slug: true } });
  } catch (e) {
    console.error("mesaje: failed to load products", e);
    return [];
  }
}

// Looks up the actual products tied to each message via the stored
// productIds, so the admin list can show their id and link to them directly.
// Isolated from the messages query so a hiccup here can't blank the list.
async function attachProducts<T extends { productIds: string[] }>(messages: T[]) {
  const allIds = [...new Set(messages.flatMap((m) => m.productIds ?? []))];
  const products = await getProductsByIds(allIds);
  const byId = new Map(products.map((p) => [p.id, p]));
  return messages.map((m) => ({ ...m, products: (m.productIds ?? []).map((id) => byId.get(id)).filter((p) => p !== undefined) }));
}

export default async function AdminMesajePage() {
  const rawMessages = await getMessages();
  const messages = await attachProducts(rawMessages);

  return (
    <div>
      <AdminPageHeader title="Cereri și comenzi" description="Cereri de ofertă, mesaje de contact și comenzi din coș, într-un singur loc." />
      <MessagesList messages={messages} />
    </div>
  );
}
