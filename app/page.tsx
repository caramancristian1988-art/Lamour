import { prisma } from "@/lib/prisma";
import { fallbackCategories, fallbackOfferProducts } from "@/lib/fallbackData";
import { furnitureListings } from "@/lib/mobilaData";
import { spaceListings } from "@/lib/spatiiComercialeData";
import Hero from "@/app/components/Hero";
import TrustBar from "@/app/components/TrustBar";
import CategoryGrid from "@/app/components/CategoryGrid";
import ProductsSection from "@/app/components/ProductsSection";
import FurnitureSection from "@/app/components/FurnitureSection";
import SpaceSection from "@/app/components/SpaceSection";
import ReviewsSection from "@/app/components/ReviewsSection";
import AboutTeaser from "@/app/components/AboutTeaser";

export const revalidate = 3600;

async function getData() {
  try {
    const [rawCategories, offerProducts, newProducts, recommendedProducts, popularProducts, reviews, banners] =
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
        // Rândul "Produse de uz casnic" — din toate categoriile, după cele mai apreciate
        prisma.product.findMany({ orderBy: { reviewCount: "desc" }, take: 4 }),
        prisma.review.findMany({
          where: { approved: true },
          orderBy: { createdAt: "desc" },
          take: 8,
          select: { id: true, name: true, rating: true, text: true, product: true },
        }),
        prisma.banner.findMany({ orderBy: { order: "asc" } }),
      ]);

    // Preferăm o poză reală a unui produs din categorie — poza categoriei
    // în sine e aproape mereu doar un placeholder generat la seed.
    const isPlaceholder = (url: string | null | undefined) => !url || url.includes("placehold.co");
    const categories = rawCategories.map(({ products, ...cat }) => {
      const productImage = products
        .flatMap((p) => [p.image, ...p.images])
        .find((img) => !isPlaceholder(img));
      return {
        ...cat,
        image: productImage ?? (isPlaceholder(cat.image) ? null : cat.image),
      };
    });

    return {
      categories,
      offerProducts: offerProducts.length > 0 ? offerProducts : fallbackOfferProducts.slice(0, 4),
      newProducts,
      recommendedProducts,
      popularProducts,
      reviews,
      banners,
    };
  } catch {
    return {
      categories: fallbackCategories,
      offerProducts: fallbackOfferProducts.slice(0, 4),
      newProducts: [],
      recommendedProducts: [],
      popularProducts: [],
      reviews: [],
      banners: [],
    };
  }
}

export default async function HomePage() {
  const { categories, offerProducts, newProducts, recommendedProducts, popularProducts, reviews, banners } =
    await getData();

  return (
    <main>
      <Hero banners={banners} />
      <TrustBar />

      {popularProducts.length > 0 && (
        <ProductsSection
          products={popularProducts}
          title="Produse"
          highlighted="de uz casnic"
          viewAllHref="/produse?division=uz-casnic"
          viewAllLabel="Vezi toate produsele"
        />
      )}
      <FurnitureSection listings={furnitureListings.slice(0, 4)} />
      <SpaceSection listings={spaceListings.slice(0, 4)} />

      <CategoryGrid categories={categories} />
      <ProductsSection
        products={offerProducts}
        title="Oferte"
        highlighted="speciale"
        viewAllHref="/produse?division=uz-casnic&oferte=1"
        viewAllLabel="Vezi toate ofertele"
        bg="bg-muted/30"
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
          bg="bg-muted/30"
        />
      )}
      <AboutTeaser />
      <ReviewsSection reviews={reviews} />
    </main>
  );
}
