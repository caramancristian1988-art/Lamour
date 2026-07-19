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
    const [rawCategories, offerProducts, newProducts, recommendedProducts, reviews, banners] =
      await Promise.all([
        prisma.category.findMany({
          orderBy: { createdAt: "asc" },
          include: {
            products: {
              where: { image: { not: null } },
              select: { image: true },
              take: 1,
              orderBy: { createdAt: "desc" },
            },
          },
        }),
        prisma.product.findMany({
          where: { oldPrice: { not: null } },
          orderBy: { createdAt: "desc" },
          take: 4,
        }),
        prisma.product.findMany({ orderBy: { createdAt: "desc" }, take: 4 }),
        // Recomandate din TOATE categoriile, după rating
        prisma.product.findMany({ orderBy: { rating: "desc" }, take: 8 }),
        prisma.review.findMany({
          where: { approved: true },
          orderBy: { createdAt: "desc" },
          take: 8,
          select: { id: true, name: true, rating: true, text: true, product: true },
        }),
        prisma.banner.findMany({ orderBy: { order: "asc" } }),
      ]);

    // Folosim poza categoriei dacă există, altfel prima poză din produsele sale
    const categories = rawCategories.map(({ products, ...cat }) => ({
      ...cat,
      image: cat.image ?? products[0]?.image ?? null,
    }));

    return {
      categories,
      offerProducts: offerProducts.length > 0 ? offerProducts : fallbackOfferProducts.slice(0, 4),
      newProducts,
      recommendedProducts,
      reviews,
      banners,
    };
  } catch {
    return {
      categories: fallbackCategories,
      offerProducts: fallbackOfferProducts.slice(0, 4),
      newProducts: [],
      recommendedProducts: [],
      reviews: [],
      banners: [],
    };
  }
}

export default async function HomePage() {
  const { categories, offerProducts, newProducts, recommendedProducts, reviews, banners } =
    await getData();

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
        viewAllLabel="Vezi toate ofertele"
      />
      {newProducts.length > 0 && (
        <ProductsSection
          products={newProducts}
          title="Produse"
          highlighted="noi"
          viewAllHref="/produse"
          viewAllLabel="Vezi toate produsele"
        />
      )}
      {recommendedProducts.length > 0 && (
        <ProductsSection
          products={recommendedProducts}
          title="Produse"
          highlighted="recomandate"
          viewAllHref="/produse"
          viewAllLabel="Vezi toate produsele"
        />
      )}
      <AboutTeaser />
      <ReviewsSection reviews={reviews} />
    </main>
  );
}
