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
import ProductSortSelect from "../components/ProductSortSelect";
import ProductPagination from "../components/ProductPagination";
import { sortProducts, paginate, parseSort, parsePage } from "@/lib/productListing";
import { localProductImages, localProductBadges, localProductNames } from "@/lib/productOverrides";

export const metadata: Metadata = {
  title: "Produse | Climat Rapid — Aparate de aer condiționat și accesorii",
  description:
    "Descoperă gama completă de aparate de aer condiționat, sisteme multisplit, portabile și accesorii disponibile la Climat Rapid.",
};

export const revalidate = 3600;

async function getData() {
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
      ],
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
  const offersOnly = query.oferte === "1";

  const { categories, products: allProducts } = await getData();
  const products = offersOnly ? allProducts.filter((p) => p.oldPrice != null) : allProducts;

  const sorted = sortProducts(products, sort);
  const { items, page: currentPage, totalPages } = paginate(sorted, page);

  return (
    <main className="bg-white">

      {/* MOBILE hero */}
      <section className="sm:hidden relative h-[300px] overflow-hidden">
        <Image
          src="/IMG_2851.PNG"
          alt="Produse Climat Rapid"
          fill
          className="object-cover object-[center_20%]"
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

      {/* ── FILTER TABS ── */}
      <section className="border-y border-gray-100 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between gap-4 py-3">
            <div className="flex items-center gap-1 overflow-x-auto scroll-smooth" style={{ scrollbarWidth: "none" }}>
              <Link
                href="/produse"
                className={`shrink-0 text-xs font-bold px-4 py-2 rounded-full transition-all ${
                  !offersOnly ? "bg-[#1d2353] text-white" : "text-gray-500 hover:bg-gray-100"
                }`}
              >
                Toate produsele
              </Link>
              <Link
                href="/produse?oferte=1"
                className={`shrink-0 text-xs font-bold px-4 py-2 rounded-full transition-all ${
                  offersOnly ? "bg-[#c7092b] text-white" : "text-[#c7092b] hover:bg-gray-100"
                }`}
              >
                Oferte Speciale
              </Link>
              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/produse/${cat.slug}`}
                  className="shrink-0 text-xs font-bold px-4 py-2 rounded-full transition-all text-gray-500 hover:bg-gray-100"
                >
                  {cat.name}
                </Link>
              ))}
            </div>
            <div className="hidden sm:flex items-center shrink-0">
              <ProductSortSelect defaultValue={sort} />
            </div>
          </div>
        </div>
      </section>

      {/* ── PRODUCTS GRID ── */}
      <section className="bg-white py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <p className="text-sm text-gray-400 mb-6">{products.length} produse găsite</p>

          {items.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-5">
              {items.map((product) => (
                <ProductCard
                  key={product.id}
                  {...product}
                  name={localProductNames[product.slug] ?? product.name}
                  image={localProductImages[product.slug] ?? product.image}
                  badge={localProductBadges[product.slug] ?? product.badge}
                  showDiscount={offersOnly}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <p className="text-gray-500">
                {offersOnly ? "Momentan nu există oferte speciale active." : "Momentan nu există produse disponibile."}
              </p>
            </div>
          )}

          <ProductPagination
            basePath="/produse"
            page={currentPage}
            totalPages={totalPages}
            sort={sort}
            extraParams={offersOnly ? { oferte: "1" } : undefined}
          />
        </div>
      </section>

    </main>
  );
}
