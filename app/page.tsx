import { prisma } from "@/lib/prisma";
import { fallbackCategories, fallbackOfferProducts } from "@/lib/fallbackData";
import Hero from "@/app/components/Hero";
import TrustBar from "@/app/components/TrustBar";
import CategoryGrid from "@/app/components/CategoryGrid";
import ProductsSection from "@/app/components/ProductsSection";
import ReviewsSection from "@/app/components/ReviewsSection";
import AboutTeaser from "@/app/components/AboutTeaser";

export const revalidate = 3600;

async function getData() {
  try {
    const [categories, offerProducts, reviews, banners] = await Promise.all([
      prisma.category.findMany({ orderBy: { createdAt: "asc" } }),
      prisma.product.findMany({
        where: { oldPrice: { not: null } },
        orderBy: { createdAt: "desc" },
        take: 4,
      }),
      prisma.review.findMany({
        where: { approved: true },
        orderBy: { createdAt: "desc" },
        take: 8,
        select: { id: true, name: true, rating: true, text: true, product: true },
      }),
      prisma.banner.findMany({ orderBy: { order: "asc" } }),
    ]);
    return {
      categories,
      offerProducts: offerProducts.length > 0 ? offerProducts : fallbackOfferProducts.slice(0, 4),
      reviews,
      banners,
    };
  } catch {
    return {
      categories: fallbackCategories,
      offerProducts: fallbackOfferProducts.slice(0, 4),
      reviews: [],
      banners: [],
    };
  }
}

export default async function HomePage() {
  const { categories, offerProducts, reviews, banners } = await getData();

  return (
    <main>
      <Hero banners={banners} />
      <TrustBar />
      <CategoryGrid categories={categories} />
      <ProductsSection
        products={offerProducts}
        title="Oferte"
        highlighted="speciale"
        viewAllHref="/produse?oferte=1"
      />
      <ReviewsSection reviews={reviews} />
      <AboutTeaser />
    </main>
  );
}
