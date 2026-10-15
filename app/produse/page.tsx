import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getSectionFlags } from "@/lib/siteSettings";
import {
  fallbackCategories,
  fallbackProducts,
  fallbackPopularProducts,
  fallbackOfferProducts,
  fallbackDiscountProducts,
} from "@/lib/fallbackData";
import { getCatalog } from "@/lib/catalog";
import ProductsCatalog from "../components/ProductsCatalog";
import { DivisionTabs, Breadcrumb } from "../components/CatalogTabs";
import { sortProducts, paginate, dedupeVariants } from "@/lib/productListing";
import { toCatalogProduct, variantOptionsRecord } from "@/lib/clientCatalog";
import JsonLd from "../components/JsonLd";
import { breadcrumbList, collectionPage } from "@/lib/structuredData";
import { absoluteUrl } from "@/lib/seo";

const PRODUSE_TITLE = "Produse din hârtie și uz casnic | LuminTehnica";
const PRODUSE_DESCRIPTION =
  "Descoperă produsele LuminTehnica: hârtie igienică, șervețele, prosoape de hârtie, șervețele umede, chibrite, detergenți și alte produse de uz casnic.";

export const metadata: Metadata = {
  title: { absolute: PRODUSE_TITLE },
  description: PRODUSE_DESCRIPTION,
  keywords: [
    "hârtie igienică Moldova",
    "șervețele",
    "prosoape de hârtie",
    "șervețele umede",
    "chibrite",
    "detergenți",
    "produse de uz casnic",
    "LuminTehnica",
    "cumpără online Chișinău",
  ],
  alternates: { canonical: absoluteUrl("/produse") },
  openGraph: {
    title: PRODUSE_TITLE,
    description: PRODUSE_DESCRIPTION,
    url: absoluteUrl("/produse"),
  },
  twitter: {
    title: PRODUSE_TITLE,
    description: PRODUSE_DESCRIPTION,
  },
};


// Pagină STATICĂ: nu citește searchParams. Produsele (în formă compactă) sunt trimise o singură dată, iar filtrarea,
// căutarea, sortarea și „Încarcă mai multe" rulează în browser (ProductsCatalog) — fără cereri la server la fiecare filtru.
// Se reface la cel mult o oră sau imediat când adminul modifică produse/categorii (updateTag + revalidatePath).
export const revalidate = 3600;

interface CategoryRow {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  parentId: string | null;
  createdAt: Date;
}

interface ProductRow {
  id: string;
  name: string;
  slug: string;
  code?: string | null;
  description: string | null;
  price: number;
  oldPrice: number | null;
  image: string | null;
  images?: string[];
  brand: string | null;
  rating: number;
  reviewCount: number;
  badge: string | null;
  availability: string;
  installmentsEnabled?: boolean;
  categoryId: string;
  createdAt: Date;
  variantGroupId: string | null;
  variantLabel: string | null;
}

async function getData(): Promise<{ categories: CategoryRow[]; products: ProductRow[] }> {
  try {
    const { categories, products } = await getCatalog();
    if (categories.length === 0 || products.length === 0) throw new Error("empty");
    return { categories, products };
  } catch {
    return {
      categories: fallbackCategories,
      products: [
        ...fallbackProducts,
        ...fallbackPopularProducts,
        ...fallbackOfferProducts,
        ...fallbackDiscountProducts,
      ].map((p) => ({
        ...p,
        images: [] as string[],
        brand: null as string | null,
        variantGroupId: null as string | null,
        variantLabel: null as string | null,
      })),
    };
  }
}

export default async function ProdusePage() {
  const { produseEnabled, ratesEnabled, installmentMonths } = await getSectionFlags();
  if (!produseEnabled) notFound();

  const { categories, products: allProducts } = await getData();
  const products = dedupeVariants(allProducts).map(toCatalogProduct);
  const variantOptions = variantOptionsRecord(allProducts);
  const catalogCategories = categories.map((c) => ({ id: c.id, slug: c.slug, name: c.name, parentId: c.parentId }));

  // Pentru datele structurate: primele produse în ordinea implicită (cele mai noi), ca înainte.
  const firstItems = paginate(sortProducts(products, "newest"), 1).items;

  return (
    <main className="page-motif">
      <JsonLd data={breadcrumbList([{ name: "Acasă", path: "/" }, { name: "Catalog", path: "/produse" }])} />
      <JsonLd
        data={collectionPage({
          name: PRODUSE_TITLE,
          description: PRODUSE_DESCRIPTION,
          url: "/produse",
          items: firstItems.map((p) => ({ name: p.name, url: `/produse/${p.slug}`, image: p.image })),
        })}
      />
      <Breadcrumb />

      <section className="pt-2 pb-10 sm:py-10">
        <div className="max-w-[110rem] mx-auto px-4 sm:px-6">
          <DivisionTabs active="uz-casnic" />
          <h1 className="text-2xl sm:text-3xl font-bold text-primary tracking-tight mb-4 sm:mb-6">Produse de uz casnic</h1>

          <ProductsCatalog
            mode="catalog"
            products={products}
            variantOptions={variantOptions}
            categories={catalogCategories}
            ratesEnabled={ratesEnabled}
            installmentMonths={installmentMonths}
          />
        </div>
      </section>
    </main>
  );
}
