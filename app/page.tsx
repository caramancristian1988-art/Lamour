import { prisma } from "@/lib/prisma";
import {
  fallbackCategories,
  fallbackPopularProducts,
  fallbackOfferProducts,
} from "@/lib/fallbackData";
import Hero from "@/app/components/Hero";
import CategoryGrid from "@/app/components/CategoryGrid";
import ProductsSection from "@/app/components/ProductsSection";
import TrustBar from "@/app/components/TrustBar";
import ReviewsSection from "@/app/components/ReviewsSection";
import AboutTeaser from "@/app/components/AboutTeaser";
import FactoryGallery from "@/app/components/FactoryGallery";
import SocialImpact from "@/app/components/SocialImpact";
import Partners from "@/app/components/Partners";

export const revalidate = 3600;

async function getData() {
  try {
    const [categories, popularProducts, reviews, banners] = await Promise.all([
      prisma.category.findMany({ orderBy: { createdAt: "asc" } }),
      prisma.product.findMany({ take: 4, orderBy: { reviewCount: "desc" } }),
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
      popularProducts,
      offerProducts: fallbackOfferProducts.slice(0, 4),
      reviews,
      banners,
    };
  } catch {
    return {
      categories: fallbackCategories,
      popularProducts: fallbackPopularProducts,
      offerProducts: fallbackOfferProducts.slice(0, 4),
      reviews: [],
      banners: [],
    };
  }
}

export default async function HomePage() {
  const { categories, popularProducts, offerProducts, reviews, banners } = await getData();

  return (
    <main>
      <Hero banners={banners} />
      <TrustBar />
      <CategoryGrid categories={categories} />
      <AboutTeaser />
      <ProductsSection
        products={offerProducts}
        title="Oferte"
        highlighted="speciale"
        viewAllHref="/produse?oferte=1"
      />
      <ProductsSection
        products={popularProducts}
        title="Produse"
        highlighted="populare"
        viewAllHref="/produse?sort=rating"
      />
      <FactoryGallery />
      <SocialImpact />
      {reviews.length > 0 && <ReviewsSection reviews={reviews} />}
      <Partners />
    </main>
  );
}
