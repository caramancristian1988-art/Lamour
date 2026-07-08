import { prisma } from "@/lib/prisma";
import AdminPageHeader from "../components/AdminPageHeader";
import NewsletterCampaignPanel from "./NewsletterCampaignPanel";

async function getSubscribers() {
  try {
    return await prisma.newsletterSubscriber.findMany({ orderBy: { createdAt: "desc" } });
  } catch {
    return [];
  }
}

async function getProductPickerData() {
  try {
    const [products, categories] = await Promise.all([
      prisma.product.findMany({
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          name: true,
          price: true,
          oldPrice: true,
          image: true,
          categoryId: true,
        },
      }),
      prisma.category.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
    ]);
    return { products, categories };
  } catch {
    return { products: [], categories: [] };
  }
}

export default async function AdminNewsletterPage() {
  const [subscribers, { products, categories }] = await Promise.all([
    getSubscribers(),
    getProductPickerData(),
  ]);

  return (
    <div>
      <AdminPageHeader
        title="Newsletter"
        description="Abonații la newsletter din formularul de pe site și trimiterea de oferte prin email."
      />

      <NewsletterCampaignPanel subscribers={subscribers} products={products} categories={categories} />
    </div>
  );
}
