import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { fallbackCategories, fallbackOfferProducts } from "@/lib/fallbackData";
import Hero from "@/app/components/Hero";
import TrustBar from "@/app/components/TrustBar";
import CategoryGrid from "@/app/components/CategoryGrid";
import ProductsSection from "@/app/components/ProductsSection";
import ReviewsSection from "@/app/components/ReviewsSection";
import AboutTeaser from "@/app/components/AboutTeaser";
import JsonLd from "@/app/components/JsonLd";
import { homepageGraph } from "@/lib/structuredData";
import { absoluteUrl } from "@/lib/seo";

export const revalidate = 3600;

const HOME_TITLE = "LuminTehnica | Produse fabricate în Moldova";
const HOME_DESCRIPTION =
  "Produse din hârtie și de uz casnic fabricate în Moldova, mobilă realizată la comandă în fabrica proprie și spații disponibile spre închiriere.";

export const metadata: Metadata = {
  title: { absolute: HOME_TITLE },
  description: HOME_DESCRIPTION,
  alternates: { canonical: absoluteUrl("/") },
  openGraph: {
    title: HOME_TITLE,
    description: HOME_DESCRIPTION,
    url: absoluteUrl("/"),
  },
  twitter: {
    title: HOME_TITLE,
    description: HOME_DESCRIPTION,
  },
};

async function getData() {
  try {
    const [rawCategories, offerProducts, newProducts, recommendedProducts, reviews, banners] =
      await Promise.all([
        prisma.category.findMany({
          orderBy: { createdAt: "asc" },
          include: {
            products: {
              select: { image: true, images: true },
              take: 5,
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

    // Preferăm poza setată explicit pe categorie (din admin); dacă nu există
    // una reală, cădem pe prima poză de produs găsită — poza categoriei
    // din seed e doar un placeholder.
    const isPlaceholder = (url: string | null | undefined) => !url || url.includes("placehold.co");
    const categories = rawCategories.map(({ products, ...cat }) => {
      const categoryImage = isPlaceholder(cat.image) ? null : cat.image;
      const productImage = products
        .flatMap((p) => [p.image, ...p.images])
        .find((img) => !isPlaceholder(img));
      return {
        ...cat,
        image: categoryImage ?? productImage ?? null,
      };
    });

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
      <JsonLd
        data={homepageGraph({
          logoUrl: "/logo.png",
          description: HOME_DESCRIPTION,
        })}
      />
      <h1 className="sr-only">Produse și soluții realizate în Moldova</h1>
      <Hero banners={banners} />
      <TrustBar />
      <CategoryGrid categories={categories} />
      <ProductsSection
        products={offerProducts}
        title="Oferte"
        highlighted="speciale"
        viewAllHref="/produse?division=uz-casnic&oferte=1"
        viewAllLabel="Vezi toate ofertele"
      />
      {newProducts.length > 0 && (
        <ProductsSection
          products={newProducts}
          title="Produse"
          highlighted="noi"
          viewAllHref="/produse?division=uz-casnic"
          viewAllLabel="Vezi toate produsele"
        />
      )}
      {recommendedProducts.length > 0 && (
        <ProductsSection
          products={recommendedProducts}
          title="Produse"
          highlighted="recomandate"
          viewAllHref="/produse?division=uz-casnic"
          viewAllLabel="Vezi toate produsele"
        />
      )}
      <AboutTeaser />
      <ReviewsSection reviews={reviews} />
    </main>
  );
}
