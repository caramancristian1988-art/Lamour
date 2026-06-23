import { prisma } from "@/lib/prisma";
import AdminPageHeader from "../components/AdminPageHeader";
import NotificationsList from "./NotificationsList";

// Each query is isolated so a hiccup in one (e.g. the product lookup) can't
// blank out the whole page — it just shows that part empty instead.
async function getMessages() {
  try {
    return await prisma.contactMessage.findMany({ where: { read: false }, orderBy: { createdAt: "desc" } });
  } catch (e) {
    console.error("notificari: failed to load messages", e);
    return [];
  }
}

async function getReviews() {
  try {
    return await prisma.review.findMany({ where: { approved: false }, orderBy: { createdAt: "desc" } });
  } catch (e) {
    console.error("notificari: failed to load reviews", e);
    return [];
  }
}

async function getProductsByIds(ids: string[]) {
  if (ids.length === 0) return [];
  try {
    return await prisma.product.findMany({ where: { id: { in: ids } }, select: { id: true, name: true, slug: true } });
  } catch (e) {
    console.error("notificari: failed to load products", e);
    return [];
  }
}

async function getData() {
  const [messages, reviews] = await Promise.all([getMessages(), getReviews()]);
  const allProductIds = [...new Set(messages.flatMap((m) => m.productIds ?? []))];
  const products = await getProductsByIds(allProductIds);
  const byId = new Map(products.map((p) => [p.id, p]));

  return {
    messages: messages.map((m) => ({
      id: m.id,
      name: m.name,
      phone: m.phone,
      message: m.message,
      source: m.source,
      createdAt: m.createdAt.toISOString(),
      products: (m.productIds ?? []).map((id) => byId.get(id)).filter((p) => p !== undefined),
    })),
    reviews: reviews.map((r) => ({
      id: r.id,
      name: r.name,
      text: r.text,
      rating: r.rating,
      product: r.product,
      createdAt: r.createdAt.toISOString(),
    })),
  };
}

export default async function AdminNotificariPage() {
  const { messages, reviews } = await getData();

  return (
    <div>
      <AdminPageHeader title="Notificări" description="Mesaje necitite și recenzii în așteptare, într-un singur loc." />
      <NotificationsList messages={messages} reviews={reviews} />
    </div>
  );
}
