import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import {
  fallbackCategories,
  fallbackProducts,
  fallbackPopularProducts,
  fallbackOfferProducts,
  fallbackDiscountProducts,
} from "@/lib/fallbackData";
import ProductCard from "../components/ProductCard";
import LoadMoreButton from "../components/LoadMoreButton";
import ProductFilterSidebar from "../components/ProductFilterSidebar";
import {
  sortProducts,
  paginate,
  parseSort,
  parsePage,
  parseFilters,
  applyFilters,
  PRICE_BRACKETS,
} from "@/lib/productListing";
import { localProductImages, localProductBadges, localProductNames } from "@/lib/productOverrides";

export const metadata: Metadata = {
  title: "Produse | Climat Rapid — Aparate de aer condiționat și accesorii",
  description:
    "Descoperă gama completă de aparate de aer condiționat, sisteme multisplit, portabile și accesorii disponibile la Climat Rapid.",
};

export const revalidate = 3600;

interface CategoryRow {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  createdAt: Date;
}

interface ProductRow {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  oldPrice: number | null;
  image: string | null;
  btu: number | null;
  inverter: boolean;
  energyClass: string | null;
  rating: number;
  reviewCount: number;
  badge: string | null;
  inStock: boolean;
  categoryId: string;
  createdAt: Date;
}

async function getData(): Promise<{ categories: CategoryRow[]; products: ProductRow[] }> {
  try {
    const [categories, products] = await Promise.all([
      prisma.category.findMany({ orderBy: { createdAt: "asc" } }),
      prisma.product.findMany({ orderBy: { createdAt: "desc" } }),
    ]);
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
      ].map((p) => ({ ...p, images: [] as string[] })),
    };
  }
}

export default async function ProdusePage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const query = await searchParams;
  const sort = parseSort(query.sort);
  const page = parsePage(query.page);
  const filters = parseFilters(query);

  const { categories, products: baseProducts } = await getData();

  const categoryById = new Map(categories.map((c) => [c.id, c.slug]));
  const products = applyFilters(baseProducts, filters, (p) => categoryById.get(p.categoryId) ?? "");

  const categoryOptions = categories.map((cat) => ({
    id: cat.id,
    slug: cat.slug,
    name: cat.name,
    count: baseProducts.filter((p) => p.categoryId === cat.id).length,
  }));

  const energyClassOptions = Array.from(new Set(baseProducts.map((p) => p.energyClass).filter((v): v is string => Boolean(v))))
    .sort()
    .reverse()
    .map((value) => ({ value, count: baseProducts.filter((p) => p.energyClass === value).length }));

  const priceBracketOptions = PRICE_BRACKETS.map((b) => ({
    key: b.key,
    label: b.label,
    count: baseProducts.filter((p) => p.price >= b.min && p.price < b.max).length,
  })).filter((b) => b.count > 0);

  const inverterCount = baseProducts.filter((p) => p.inverter).length;
  const offersCount = baseProducts.filter((p) => p.oldPrice != null).length;

  const sorted = sortProducts(products, sort);
  const { items, page: currentPage, hasMore } = paginate(sorted, page);

  return (
    <main className="bg-white">

      {/* MOBILE hero */}
      <section className="sm:hidden relative h-[300px] overflow-hidden">
        <Image
          src="/IMG_2851.PNG"
          alt="Produse Climat Rapid"
          fill
          className="object-cover object-bottom"
          priority
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-white/85 from-10% via-white/50 via-40% to-transparent to-70% pointer-events-none" />
        <div className="absolute top-0 left-0 z-10 flex flex-col justify-start px-4 pt-4">
          <nav className="flex items-center gap-1 text-[10px] text-gray-500 mb-3">
            <Link href="/" className="hover:text-[#c7092b] transition-colors">Acasă</Link>
            <span>›</span>
            <span className="text-gray-700">Produse</span>
          </nav>
          <h1 className="text-2xl font-extrabold text-[#1d2353] mb-2">Produse</h1>
          <p className="text-gray-700 text-xs max-w-[200px] leading-relaxed">
            Aparate de aer condiționat, sisteme multisplit și accesorii pentru orice nevoie.
          </p>
        </div>
      </section>

      {/* DESKTOP hero */}
      <section className="hidden sm:block relative bg-white overflow-hidden h-[340px] lg:h-[380px]">
        <div className="absolute inset-0 flex justify-end">
          <div className="w-[65%] h-full relative">
            <Image
              src="/IMG_2848.PNG"
              alt="Produse Climat Rapid"
              fill
              className="object-cover object-center"
              priority
              sizes="65vw"
            />
          </div>
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-white from-25% via-white/60 via-40% to-transparent to-65% pointer-events-none" />
        <div className="absolute inset-0 flex flex-col justify-start pt-3 px-8 lg:px-12">
          <nav className="flex items-center gap-1.5 text-xs text-gray-400 mb-4">
            <Link href="/" className="hover:text-[#c7092b] transition-colors">Acasă</Link>
            <span>›</span>
            <span className="text-gray-600">Produse</span>
          </nav>
          <h1 className="text-4xl lg:text-5xl font-extrabold text-[#1d2353] mb-4">Produse</h1>
          <p className="text-gray-700 text-sm lg:text-[17px] max-w-xs lg:max-w-sm leading-relaxed">
            Aparate de aer condiționat, sisteme multisplit, portabile și accesorii — toate într-un singur loc.
          </p>
        </div>
      </section>

      {/* ── PRODUCTS GRID ── */}
      <section className="bg-white py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col lg:flex-row gap-8 items-start">
            <ProductFilterSidebar
              sort={sort}
              categories={categoryOptions}
              energyClasses={energyClassOptions}
              priceBrackets={priceBracketOptions}
              inverterCount={inverterCount}
              offersCount={offersCount}
            />

            <div className="flex-1 min-w-0">
              {filters.query ? (
                <p className="text-sm text-gray-500 mb-6">
                  {products.length} rezultate pentru <span className="font-bold text-[#1d2353]">&ldquo;{filters.query}&rdquo;</span>
                </p>
              ) : (
                <p className="text-sm text-gray-400 mb-6">{products.length} produse găsite</p>
              )}

              {items.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-3 sm:gap-5">
                  {items.map((product) => (
                    <ProductCard
                      key={product.id}
                      {...product}
                      name={localProductNames[product.slug] ?? product.name}
                      image={localProductImages[product.slug] ?? product.image}
                      badge={localProductBadges[product.slug] ?? product.badge}
                      showDiscount={filters.offersOnly}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <p className="text-gray-500">
                    {filters.query
                      ? `Niciun produs nu corespunde căutării "${filters.query}".`
                      : filters.offersOnly
                      ? "Momentan nu există oferte speciale active."
                      : "Niciun produs nu corespunde filtrelor selectate."}
                  </p>
                </div>
              )}

              <LoadMoreButton
                basePath="/produse"
                page={currentPage}
                sort={sort}
                hasMore={hasMore}
                extraParams={{
                  ...(filters.query ? { q: filters.query } : {}),
                  ...(filters.offersOnly ? { oferte: "1" } : {}),
                  ...(filters.categorySlugs.length > 0 ? { cat: filters.categorySlugs.join(",") } : {}),
                  ...(filters.inverterOnly ? { inverter: "1" } : {}),
                  ...(filters.energyClasses.length > 0 ? { energie: filters.energyClasses.join(",") } : {}),
                  ...(filters.priceBracket ? { pret: filters.priceBracket } : {}),
                }}
              />
            </div>
          </div>
        </div>
      </section>

    </main>
  );
}
