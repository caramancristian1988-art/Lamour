import { prisma } from "@/lib/prisma";
import AdminPageHeader from "../components/AdminPageHeader";
import MessagesList from "./MessagesList";

async function getMessages() {
  try {
    return await prisma.contactMessage.findMany({ orderBy: { createdAt: "desc" } });
  } catch {
    return [];
  }
}

// Looks up the actual products tied to each message via the stored
// productIds, so the admin list can show their id and link to them directly.
async function attachProducts<T extends { productIds: string[] }>(messages: T[]) {
  try {
    const allIds = [...new Set(messages.flatMap((m) => m.productIds))];
    const products = allIds.length
      ? await prisma.product.findMany({ where: { id: { in: allIds } }, select: { id: true, name: true, slug: true } })
      : [];
    const byId = new Map(products.map((p) => [p.id, p]));
    return messages.map((m) => ({ ...m, products: m.productIds.map((id) => byId.get(id)).filter((p) => p !== undefined) }));
  } catch {
    return messages.map((m) => ({ ...m, products: [] }));
  }
}

export default async function AdminMesajePage() {
  const rawMessages = await getMessages();
  const messages = await attachProducts(rawMessages);

  return (
    <div>
      <AdminPageHeader title="Mesaje Contact" description="Mesajele primite prin formularul de contact." />
      <MessagesList messages={messages} />
    </div>
  );
}
