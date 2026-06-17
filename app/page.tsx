import { prisma } from "@/lib/prisma";
import {
  fallbackCategories,
  fallbackProducts,
  fallbackPopularProducts,
  fallbackOfferProducts,
} from "@/lib/fallbackData";
import Hero from "@/app/components/Hero";
import CategoryGrid from "@/app/components/CategoryGrid";
import ProductsSection from "@/app/components/ProductsSection";
import ServicesSection from "@/app/components/ServicesSection";
import TrustBar from "@/app/components/TrustBar";

export const revalidate = 3600;

async function getData() {
  try {
    const [categories, products, popularProducts] = await Promise.all([
      prisma.category.findMany({ orderBy: { createdAt: "asc" } }),
      prisma.product.findMany({ take: 4, orderBy: { rating: "desc" } }),
      prisma.product.findMany({ take: 4, orderBy: { reviewCount: "desc" } }),
    ]);
    return {
      categories,
      products,
      popularProducts,
      offerProducts: fallbackOfferProducts.slice(0, 4),
    };
  } catch {
    return {
      categories: fallbackCategories,
      products: fallbackProducts,
      popularProducts: fallbackPopularProducts,
      offerProducts: fallbackOfferProducts.slice(0, 4),
    };
  }
}

export default async function HomePage() {
  const { categories, products, popularProducts, offerProducts } = await getData();

  return (
    <main>
      <Hero />
      <CategoryGrid categories={categories} />
      <ProductsSection products={products} />
      <ProductsSection
        products={popularProducts}
        title="Produse"
        highlighted="populare"
        viewAllHref="/produse?sort=rating"
        bg="bg-[#f8fafc]"
      />
      <ProductsSection
        products={offerProducts}
        title="Oferte"
        highlighted="speciale"
        viewAllHref="/produse?oferte=1"
        bg="bg-[#f8fafc]"
      />
      <ServicesSection />
      <TrustBar />
    </main>
  );
}
