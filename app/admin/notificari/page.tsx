import { prisma } from "@/lib/prisma";
import AdminPageHeader from "../components/AdminPageHeader";
import NotificationsList from "./NotificationsList";

async function getData() {
  try {
    const [messages, reviews] = await Promise.all([
      prisma.contactMessage.findMany({ where: { read: false }, orderBy: { createdAt: "desc" } }),
      prisma.review.findMany({ where: { approved: false }, orderBy: { createdAt: "desc" } }),
    ]);

    const allProductIds = [...new Set(messages.flatMap((m) => m.productIds))];
    const products = allProductIds.length
      ? await prisma.product.findMany({ where: { id: { in: allProductIds } }, select: { id: true, name: true, slug: true } })
      : [];
    const byId = new Map(products.map((p) => [p.id, p]));

    return {
      messages: messages.map((m) => ({
        id: m.id,
        name: m.name,
        phone: m.phone,
        message: m.message,
        source: m.source,
        createdAt: m.createdAt.toISOString(),
        products: m.productIds.map((id) => byId.get(id)).filter((p) => p !== undefined),
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
  } catch {
    return { messages: [], reviews: [] };
  }
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
