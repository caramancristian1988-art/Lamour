import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { onlyVisible } from "@/lib/productVisibility";
import { sortCategories } from "@/lib/categoryOrder";
import { fallbackCategories } from "@/lib/fallbackData";
import { dedupeVariants, buildVariantOptionsMap } from "@/lib/productListing";
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

// Câte produse arată fiecare secțiune (în carusel) și câte se aduc din bază înainte de a scoate variantele (acestea
// sunt ascunse din liste, deci fără o rezervă ar rămâne mult mai puține decât PER_SECTION).
const PER_SECTION = 15;
const POOL = 80;

async function getData() {
  try {
    const [rawCategories, essentialProducts, offerProducts, newProducts, recommendedProducts, banners, variantRows] =
      await Promise.all([
        prisma.category.findMany({
          where: { parentId: null },
          include: {
            products: {
              where: onlyVisible(),
              select: { image: true, images: true },
              take: 5,
              orderBy: { createdAt: "desc" },
            },
          },
        }),
        // Primele produse afișate pe homepage: prosoape de bucătărie și
        // hârtie igienică — cele mai căutate categorii, cerute explicit
        // să apară primele pe pagina principală.
        prisma.product.findMany({
          // Produsele de hârtie stau în SUBCATEGORIILE acestor categorii (în 2/3 straturi etc.), nu direct în ele —
          // de aceea se caută și după categoria părinte.
          where: onlyVisible({
            category: {
              OR: [
                { slug: { in: ["prosoape-de-hartie", "hartie-igienica"] } },
                { parent: { slug: { in: ["prosoape-de-hartie", "hartie-igienica"] } } },
              ],
            },
          }),
          orderBy: { createdAt: "desc" },
          take: POOL,
        }),
        prisma.product.findMany({
          where: onlyVisible({ oldPrice: { not: null } }),
          orderBy: { createdAt: "desc" },
          take: POOL,
        }),
        // „Produse noi" / „Recomandate": exact cele bifate în admin, TOATE (fără limită). Cât timp nu e bifat niciunul,
        // secțiunea nu rămâne goală — se folosește selecția automată (cele mai noi / cele mai bine cotate).
        prisma.product.findMany({ where: onlyVisible({ isNewProduct: true }), orderBy: { createdAt: "desc" } }),
        prisma.product.findMany({ where: onlyVisible({ recommended: true }), orderBy: { createdAt: "desc" } }),
        prisma.banner.findMany({ orderBy: { order: "asc" } }),
        // Lightweight full-catalog pull just to build the variant-siblings
        // map — homepage sections only fetch a handful of products each, not
        // enough to know a shown product's other sizes.
        prisma.product.findMany({
          where: onlyVisible(),
          select: { id: true, slug: true, variantGroupId: true, variantLabel: true, price: true, oldPrice: true },
        }),
      ]);
      const variantOptionsMap = buildVariantOptionsMap(variantRows);

    // Nimic bifat în admin -> selecția automată de până acum, ca secțiunea să nu dispară de pe prima pagină.
    const [newToShow, recommendedToShow] = await Promise.all([
      dedupeVariants(newProducts).length > 0
        ? dedupeVariants(newProducts)
        : prisma.product
            .findMany({ where: onlyVisible(), orderBy: { createdAt: "desc" }, take: POOL })
            .then((rows) => dedupeVariants(rows).slice(0, PER_SECTION)),
      dedupeVariants(recommendedProducts).length > 0
        ? dedupeVariants(recommendedProducts)
        : prisma.product
            .findMany({ where: onlyVisible(), orderBy: { rating: "desc" }, take: POOL })
            .then((rows) => dedupeVariants(rows).slice(0, PER_SECTION)),
    ]);

    // Preferăm poza setată explicit pe categorie (din admin); dacă nu există
    // una reală, cădem pe prima poză de produs găsită — poza categoriei
    // din seed e doar un placeholder.
    const isPlaceholder = (url: string | null | undefined) => !url || url.includes("placehold.co");
    const categories = sortCategories(rawCategories).slice(0, 18).map(({ products, ...cat }) => {
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
      essentialProducts: dedupeVariants(essentialProducts).slice(0, PER_SECTION),
      // Fără produse reale la reducere, secțiunea Oferte nu se afișează (înainte apăreau produse demo cu linkuri 404).
      offerProducts: dedupeVariants(offerProducts).slice(0, PER_SECTION),
      newProducts: newToShow,
      recommendedProducts: recommendedToShow,
      banners,
      variantOptionsMap,
    };
  } catch {
    return {
      categories: fallbackCategories,
      essentialProducts: [],
      offerProducts: [],
      newProducts: [],
      recommendedProducts: [],
      banners: [],
      variantOptionsMap: new Map(),
    };
  }
}

export default async function HomePage() {
  const { categories, essentialProducts, offerProducts, newProducts, recommendedProducts, banners, variantOptionsMap } =
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
      {essentialProducts.length > 0 && (
        <ProductsSection
          products={essentialProducts}
          title="Hârtie igienică"
          highlighted="& prosoape de bucătărie"
          viewAllHref="/produse?division=uz-casnic"
          viewAllLabel="Vezi toate produsele"
          variantOptionsMap={variantOptionsMap}
        />
      )}
      {offerProducts.length > 0 && (
        <ProductsSection
          products={offerProducts}
          title="Oferte"
          highlighted="speciale"
          viewAllHref="/produse?division=uz-casnic&oferte=1"
          viewAllLabel="Vezi toate ofertele"
          variantOptionsMap={variantOptionsMap}
        />
      )}
      {newProducts.length > 0 && (
        <ProductsSection
          products={newProducts}
          title="Produse"
          highlighted="noi"
          viewAllHref="/produse?division=uz-casnic"
          viewAllLabel="Vezi toate produsele"
          variantOptionsMap={variantOptionsMap}
        />
      )}
      {recommendedProducts.length > 0 && (
        <ProductsSection
          products={recommendedProducts}
          title="Produse"
          highlighted="recomandate"
          viewAllHref="/produse?division=uz-casnic"
          viewAllLabel="Vezi toate produsele"
          variantOptionsMap={variantOptionsMap}
        />
      )}
      <AboutTeaser />
      <ReviewsSection />
    </main>
  );
}
