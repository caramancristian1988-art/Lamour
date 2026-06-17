import { cache } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import {
  fallbackCategories,
  fallbackProducts,
  fallbackPopularProducts,
  fallbackOfferProducts,
  fallbackDiscountProducts,
  fallbackReviews,
} from "@/lib/fallbackData";
import { localProductImages, localProductBadges, localProductNames } from "@/lib/productOverrides";
import { sortProducts, paginate, parseSort, parsePage } from "@/lib/productListing";
import ProductCard from "../../components/ProductCard";
import ProductSortSelect from "../../components/ProductSortSelect";
import ProductPagination from "../../components/ProductPagination";
import AddToCartButton from "../../components/AddToCartButton";

export const revalidate = 3600;

const allFallbackProducts = [
  ...fallbackProducts,
  ...fallbackPopularProducts,
  ...fallbackOfferProducts,
  ...fallbackDiscountProducts,
];

const getCategoryData = cache(async (slug: string) => {
  try {
    const category = await prisma.category.findUnique({ where: { slug } });
    if (!category) return null;
    const [products, allCategories] = await Promise.all([
      prisma.product.findMany({ where: { categoryId: category.id }, orderBy: { createdAt: "desc" } }),
      prisma.category.findMany({ orderBy: { createdAt: "asc" } }),
    ]);
    return { category, products, allCategories };
  } catch {
    const category = fallbackCategories.find((c) => c.slug === slug);
    if (!category) return null;
    const products = allFallbackProducts.filter((p) => p.categoryId === category.id);
    return { category, products, allCategories: fallbackCategories };
  }
});

const getProductData = cache(async (slug: string) => {
  try {
    const product = await prisma.product.findUnique({ where: { slug }, include: { category: true } });
    if (!product) return null;
    const [related, reviews] = await Promise.all([
      prisma.product.findMany({
        where: { categoryId: product.categoryId, NOT: { id: product.id } },
        take: 4,
      }),
      prisma.review.findMany({ where: { product: product.name } }),
    ]);
    return { product, category: product.category, related, reviews };
  } catch {
    const product = allFallbackProducts.find((p) => p.slug === slug);
    if (!product) return null;
    const category = fallbackCategories.find((c) => c.id === product.categoryId) ?? null;
    const related = allFallbackProducts
      .filter((p) => p.categoryId === product.categoryId && p.id !== product.id)
      .slice(0, 4);
    const reviews = fallbackReviews.filter((r) => r.product === product.name);
    return { product, category, related, reviews };
  }
});

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;

  const categoryData = await getCategoryData(slug);
  if (categoryData) {
    return {
      title: `${categoryData.category.name} | Climat Rapid`,
      description:
        categoryData.category.description ??
        `Descoperă gama de ${categoryData.category.name.toLowerCase()} disponibilă la Climat Rapid.`,
    };
  }

  const productData = await getProductData(slug);
  if (productData) {
    const name = localProductNames[productData.product.slug] ?? productData.product.name;
    return {
      title: `${name} | Climat Rapid`,
      description:
        productData.product.description ??
        `Cumpără ${name} la cel mai bun preț, cu instalare profesională și garanție.`,
    };
  }

  return { title: "Pagina nu a fost găsită | Climat Rapid" };
}

function StarRating({ rating, size = "w-5 h-5" }: { rating: number; size?: string }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          className={`${size} ${star <= Math.round(rating) ? "text-amber-400" : "text-gray-200"}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

function getInitials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}

export default async function ProduseSlugPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { slug } = await params;
  const query = await searchParams;

  const categoryData = await getCategoryData(slug);
  if (categoryData) {
    return <CategoryView {...categoryData} sort={parseSort(query.sort)} page={parsePage(query.page)} />;
  }

  const productData = await getProductData(slug);
  if (productData) {
    return <ProductView {...productData} />;
  }

  notFound();
}

/* ───────────────────────── CATEGORY VIEW ───────────────────────── */

interface CategoryViewProps {
  category: { id: string; name: string; slug: string; description: string | null };
  products: Array<{
    id: string;
    name: string;
    slug: string;
    price: number;
    oldPrice: number | null;
    image: string | null;
    btu: number | null;
    inverter: boolean;
    energyClass: string | null;
    rating: number;
    reviewCount: number;
    badge: string | null;
    createdAt: Date;
  }>;
  allCategories: Array<{ id: string; name: string; slug: string }>;
  sort: ReturnType<typeof parseSort>;
  page: number;
}

function CategoryView({ category, products, allCategories, sort, page }: CategoryViewProps) {
  const sorted = sortProducts(products, sort);
  const { items, page: currentPage, totalPages } = paginate(sorted, page);

  return (
    <main className="bg-white">

      {/* MOBILE hero */}
      <section className="sm:hidden relative h-[260px] overflow-hidden">
        <Image
          src="/IMG_2851.PNG"
          alt={category.name}
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
            <Link href="/produse" className="hover:text-[#c7092b] transition-colors">Produse</Link>
            <span>›</span>
            <span className="text-gray-700">{category.name}</span>
          </nav>
          <h1 className="text-xl font-extrabold text-[#1d2353] mb-2 max-w-[220px]">{category.name}</h1>
          {category.description && (
            <p className="text-gray-700 text-xs max-w-[200px] leading-relaxed">{category.description}</p>
          )}
        </div>
      </section>

      {/* DESKTOP hero */}
      <section className="hidden sm:block relative bg-white overflow-hidden h-[300px] lg:h-[340px]">
        <div className="absolute inset-0 flex justify-end">
          <div className="w-[65%] h-full relative">
            <Image src="/IMG_2848.PNG" alt={category.name} fill className="object-cover object-center" priority sizes="65vw" />
          </div>
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-white from-25% via-white/60 via-40% to-transparent to-65% pointer-events-none" />
        <div className="absolute inset-0 flex flex-col justify-start pt-3 px-8 lg:px-12">
          <nav className="flex items-center gap-1.5 text-xs text-gray-400 mb-4">
            <Link href="/" className="hover:text-[#c7092b] transition-colors">Acasă</Link>
            <span>›</span>
            <Link href="/produse" className="hover:text-[#c7092b] transition-colors">Produse</Link>
            <span>›</span>
            <span className="text-gray-600">{category.name}</span>
          </nav>
          <h1 className="text-3xl lg:text-4xl font-extrabold text-[#1d2353] mb-4 max-w-md">{category.name}</h1>
          {category.description && (
            <p className="text-gray-700 text-sm lg:text-[17px] max-w-xs lg:max-w-sm leading-relaxed">
              {category.description}
            </p>
          )}
        </div>
      </section>

      {/* FILTER TABS */}
      <section className="border-y border-gray-100 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between gap-4 py-3">
            <div className="flex items-center gap-1 overflow-x-auto scroll-smooth" style={{ scrollbarWidth: "none" }}>
              <Link href="/produse" className="shrink-0 text-xs font-bold px-4 py-2 rounded-full transition-all text-gray-500 hover:bg-gray-100">
                Toate produsele
              </Link>
              <Link href="/produse?oferte=1" className="shrink-0 text-xs font-bold px-4 py-2 rounded-full transition-all text-[#c7092b] hover:bg-gray-100">
                Oferte Speciale
              </Link>
              {allCategories.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/produse/${cat.slug}`}
                  className={`shrink-0 text-xs font-bold px-4 py-2 rounded-full transition-all ${
                    cat.slug === category.slug ? "bg-[#1d2353] text-white" : "text-gray-500 hover:bg-gray-100"
                  }`}
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

      {/* PRODUCTS GRID */}
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
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <p className="text-gray-500 mb-4">Momentan nu există produse în această categorie.</p>
              <Link
                href="/produse"
                className="inline-flex items-center bg-[#1d2353] hover:bg-[#2a3470] text-white font-bold px-6 py-3 rounded-lg transition-colors text-sm uppercase tracking-wide"
              >
                Vezi toate produsele
              </Link>
            </div>
          )}

          <ProductPagination basePath={`/produse/${category.slug}`} page={currentPage} totalPages={totalPages} sort={sort} />
        </div>
      </section>

    </main>
  );
}

/* ───────────────────────── PRODUCT VIEW ───────────────────────── */

interface ProductViewProps {
  product: {
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
  };
  category: { id: string; name: string; slug: string } | null;
  related: Array<{
    id: string;
    name: string;
    slug: string;
    price: number;
    oldPrice: number | null;
    image: string | null;
    btu: number | null;
    inverter: boolean;
    energyClass: string | null;
    rating: number;
    reviewCount: number;
    badge: string | null;
  }>;
  reviews: Array<{ id: string; name: string; rating: number; text: string; product: string | null }>;
}

function ProductView({ product, category, related, reviews }: ProductViewProps) {
  const displayName = localProductNames[product.slug] ?? product.name;
  const displayImage = localProductImages[product.slug] ?? product.image;
  const discount = product.oldPrice ? Math.round((1 - product.price / product.oldPrice) * 100) : null;
  const displayBadge = localProductBadges[product.slug] ?? product.badge ?? (discount ? `Reducere -${discount}%` : null);

  const specs = [
    product.btu ? { label: "Capacitate", value: `${(product.btu / 1000).toFixed(0)}000 BTU` } : null,
    { label: "Tehnologie", value: product.inverter ? "Inverter" : "On/Off" },
    product.energyClass ? { label: "Clasă energetică", value: product.energyClass } : null,
    { label: "Disponibilitate", value: product.inStock ? "În stoc" : "Stoc epuizat" },
  ].filter(Boolean) as { label: string; value: string }[];

  return (
    <main className="bg-white">

      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 pt-5 pb-2">
        <nav className="flex items-center gap-1.5 text-xs text-gray-400 flex-wrap">
          <Link href="/" className="hover:text-[#c7092b] transition-colors">Acasă</Link>
          <span>›</span>
          <Link href="/produse" className="hover:text-[#c7092b] transition-colors">Produse</Link>
          {category && (
            <>
              <span>›</span>
              <Link href={`/produse/${category.slug}`} className="hover:text-[#c7092b] transition-colors">{category.name}</Link>
            </>
          )}
          <span>›</span>
          <span className="text-gray-600 truncate max-w-[200px]">{displayName}</span>
        </nav>
      </div>

      {/* Top section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 pb-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-14">

          {/* LEFT: image */}
          <div className="relative">
            <div className="relative h-[280px] sm:h-[380px] lg:h-[440px] rounded-2xl border border-gray-100 bg-white overflow-hidden flex items-center justify-center">
              {displayImage ? (
                <Image
                  src={displayImage}
                  alt={displayName}
                  fill
                  className="object-contain p-6"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  priority
                />
              ) : (
                <svg className="w-32 h-32 text-gray-200" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20 8H4a2 2 0 00-2 2v8a2 2 0 002 2h16a2 2 0 002-2v-8a2 2 0 00-2-2zM4 6h16V4H4v2z" />
                </svg>
              )}
              {displayBadge && (
                <span className="absolute top-5 left-5 bg-[#c7092b] text-white text-xs font-bold rounded-md px-3 py-1 uppercase tracking-wide">
                  {displayBadge}
                </span>
              )}
            </div>
          </div>

          {/* RIGHT: details */}
          <div className="flex flex-col">
            <h1 className="text-2xl sm:text-3xl lg:text-[34px] font-extrabold text-[#1d2353] leading-tight mb-3">
              {displayName}
            </h1>

            <div className="flex items-center gap-2 mb-5">
              <StarRating rating={product.rating} />
              <span className="text-sm text-gray-500">
                {product.rating.toFixed(1)} ({product.reviewCount} recenzii)
              </span>
            </div>

            <div className="flex items-center gap-3 flex-wrap mb-6">
              <span className="text-3xl font-extrabold text-gray-900">
                {product.price.toLocaleString("ro-MD")} MDL
              </span>
              {product.oldPrice && (
                <span className="text-base text-gray-400 line-through">
                  {product.oldPrice.toLocaleString("ro-MD")} MDL
                </span>
              )}
              {discount && (
                <span className="inline-flex items-center bg-[#c7092b] text-white text-xs font-extrabold px-2.5 py-1 rounded-md">
                  -{discount}%
                </span>
              )}
            </div>

            {product.description && (
              <p className="text-gray-600 text-[15px] leading-relaxed mb-6 max-w-lg">
                {product.description}
              </p>
            )}

            {/* Specs */}
            <div className="grid grid-cols-2 gap-3 mb-7 max-w-lg">
              {specs.map((spec) => (
                <div key={spec.label} className="bg-[#f6f8fb] border border-gray-100 rounded-xl px-4 py-3">
                  <p className="text-[11px] text-gray-400 uppercase tracking-wide mb-1">{spec.label}</p>
                  <p className="text-sm font-bold text-[#1d2353]">{spec.value}</p>
                </div>
              ))}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 mb-7">
              <AddToCartButton
                slug={product.slug}
                name={displayName}
                price={product.price}
                image={displayImage}
                inStock={product.inStock}
                className={`flex-1 sm:flex-none sm:px-10 h-12 rounded-xl text-sm font-bold uppercase tracking-wide flex items-center justify-center gap-2 transition-colors ${
                  product.inStock
                    ? "bg-[#c7092b] hover:bg-[#a5071f] text-white"
                    : "bg-gray-100 text-gray-400 cursor-not-allowed"
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                {product.inStock ? "Adaugă în coș" : "Stoc epuizat"}
              </AddToCartButton>
              <Link
                href="/contact"
                className="h-12 px-6 flex items-center justify-center border-2 border-[#1d2353] text-[#1d2353] hover:bg-[#1d2353] hover:text-white font-bold rounded-xl transition-all text-sm uppercase tracking-wide"
              >
                Cere ofertă
              </Link>
            </div>

            {/* Trust row */}
            <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-xs text-gray-500 border-t border-gray-100 pt-5">
              <span className="flex items-center gap-1.5">
                <svg className="w-4 h-4 text-[#c7092b]" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <path d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8l1.647 7.412A2 2 0 008.607 17h6.786a2 2 0 001.96-1.588L19 8M10 12h4" />
                </svg>
                Livrare rapidă
              </span>
              <span className="flex items-center gap-1.5">
                <svg className="w-4 h-4 text-[#c7092b]" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3z" />
                </svg>
                Garanție inclusă
              </span>
              <span className="flex items-center gap-1.5">
                <svg className="w-4 h-4 text-[#c7092b]" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <path d="M14.7 6.3a1 1 0 000-1.4l-2.6-2.6a1 1 0 00-1.4 0L9.3 3.7l4 4 1.4-1.4zM7.9 5.1L2 11v4h4l5.9-5.9-4-4z" />
                </svg>
                Instalare profesională
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Reviews */}
      <section className="bg-[#f6f8fb] border-y border-gray-100 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
          <h2 className="text-2xl font-extrabold text-[#1d2353] mb-8">
            Recenzii clienți {reviews.length > 0 && <span className="text-gray-400 font-medium text-base">({reviews.length})</span>}
          </h2>

          {reviews.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {reviews.map((review) => (
                <div key={review.id} className="bg-white border border-gray-100 rounded-2xl p-6 flex flex-col">
                  <StarRating rating={review.rating} size="w-4 h-4" />
                  <p className="text-sm text-gray-600 mt-3 flex-1 leading-relaxed">&ldquo;{review.text}&rdquo;</p>
                  <div className="flex items-center gap-3 mt-4 pt-4 border-t border-gray-100">
                    <div className="w-9 h-9 bg-[#1d2353] rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0">
                      {getInitials(review.name)}
                    </div>
                    <div className="text-sm font-bold text-[#111827]">{review.name}</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">Nu există încă recenzii pentru acest produs.</p>
          )}
        </div>
      </section>

      {/* Related products */}
      {related.length > 0 && (
        <section className="bg-white py-14">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
            <h2 className="text-2xl font-extrabold text-[#111827] uppercase tracking-wide mb-8">
              Produse <span className="text-[#c7092b]">similare</span>
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
              {related.map((p) => (
                <ProductCard
                  key={p.id}
                  {...p}
                  name={localProductNames[p.slug] ?? p.name}
                  image={localProductImages[p.slug] ?? p.image}
                  badge={localProductBadges[p.slug] ?? p.badge}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="bg-white px-4 sm:px-6 lg:px-12 pb-10">
        <div className="max-w-7xl mx-auto bg-[#1d2353] rounded-2xl py-10 lg:py-12 px-8 lg:px-12">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight mb-2">
                Ai nevoie de instalare profesională?
              </h2>
              <p className="text-white/60 text-sm max-w-md">
                Echipa noastră se ocupă de instalare rapidă și mentenanță, oriunde în Moldova.
              </p>
            </div>
            <div className="shrink-0">
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 bg-[#c7092b] hover:bg-[#a5071f] text-white font-extrabold text-sm px-8 py-4 rounded-xl transition-all duration-300 uppercase tracking-wide shadow-lg hover:-translate-y-0.5"
              >
                Contactează-ne
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </section>

    </main>
  );
}
