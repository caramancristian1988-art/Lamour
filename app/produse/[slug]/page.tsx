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
import ProductOfferModal from "../../components/ProductOfferModal";
import {
  sortProducts,
  paginate,
  parseSort,
  parsePage,
  parseFilters,
  applyFilters,
} from "@/lib/productListing";
import ProductCard from "../../components/ProductCard";
import LoadMoreButton from "../../components/LoadMoreButton";
import AddToCartButton from "../../components/AddToCartButton";
import ProductGallery from "../../components/ProductGallery";
import FavoriteButton from "../../components/FavoriteButton";
import ProductFilterSidebar from "../../components/ProductFilterSidebar";
import ReviewsGrid from "../../components/ReviewsGrid";
import FaqAccordion from "../../components/FaqAccordion";
import { getSectionFlags } from "@/lib/siteSettings";

export const revalidate = 3600;

const allFallbackProducts = [
  ...fallbackProducts,
  ...fallbackPopularProducts,
  ...fallbackOfferProducts,
  ...fallbackDiscountProducts,
].map((p) => ({ ...p, images: [] as string[], brand: null as string | null }));

const getCategoryData = cache(async (slug: string) => {
  try {
    const category = await prisma.category.findUnique({ where: { slug } });
    if (!category) return null;
    const products = await prisma.product.findMany({ where: { categoryId: category.id }, orderBy: { createdAt: "desc" } });
    return { category, products };
  } catch {
    const category = fallbackCategories.find((c) => c.slug === slug);
    if (!category) return null;
    const products = allFallbackProducts.filter((p) => p.categoryId === category.id);
    return { category, products };
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
      prisma.review.findMany({ where: { product: product.name, approved: true } }),
    ]);
    // Fetched separately so a hiccup here (e.g. a not-yet-migrated client)
    // can't take down the whole product page and fall back to demo data.
    let faqs: Awaited<ReturnType<typeof prisma.productFaq.findMany>> = [];
    try {
      faqs = await prisma.productFaq.findMany({ where: { productId: product.id }, orderBy: { order: "asc" } });
    } catch {
      faqs = [];
    }
    return { product, category: product.category, related, reviews, faqs };
  } catch {
    const product = allFallbackProducts.find((p) => p.slug === slug);
    if (!product) return null;
    const category = fallbackCategories.find((c) => c.id === product.categoryId) ?? null;
    const related = allFallbackProducts
      .filter((p) => p.categoryId === product.categoryId && p.id !== product.id)
      .slice(0, 4);
    const reviews = fallbackReviews.filter((r) => r.product === product.name);
    return { product, category, related, reviews, faqs: [] };
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

function QuickSpecRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline gap-2 text-sm">
      <span className="text-gray-500 shrink-0">{label}</span>
      <span className="flex-1 border-b border-dotted border-gray-300 translate-y-[-3px]" />
      <span className="font-bold text-[#1d2353] text-right shrink-0">{value}</span>
    </div>
  );
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

export default async function ProduseSlugPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { produseEnabled } = await getSectionFlags();
  if (!produseEnabled) notFound();

  const { slug } = await params;
  const query = await searchParams;

  const categoryData = await getCategoryData(slug);
  if (categoryData) {
    return (
      <CategoryView
        {...categoryData}
        sort={parseSort(query.sort)}
        page={parsePage(query.page)}
        filters={parseFilters(query)}
      />
    );
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
    technology: string;
    brand: string | null;
    energyClass: string | null;
    rating: number;
    reviewCount: number;
    badge: string | null;
    createdAt: Date;
  }>;
  sort: ReturnType<typeof parseSort>;
  page: number;
  filters: ReturnType<typeof parseFilters>;
}

function CategoryView({ category, products: baseProducts, sort, page, filters }: CategoryViewProps) {
  const products = applyFilters(baseProducts, filters);

  const energyClassOptions = Array.from(new Set(baseProducts.map((p) => p.energyClass).filter((v): v is string => Boolean(v))))
    .sort()
    .reverse()
    .map((value) => ({ value, count: baseProducts.filter((p) => p.energyClass === value).length }));

  const priceBounds = baseProducts.reduce(
    (acc, p) => ({ min: Math.min(acc.min, p.price), max: Math.max(acc.max, p.price) }),
    { min: baseProducts[0]?.price ?? 0, max: baseProducts[0]?.price ?? 0 }
  );

  const technologyOptions = Array.from(new Set(baseProducts.map((p) => p.technology)))
    .sort()
    .map((value) => ({ value, count: baseProducts.filter((p) => p.technology === value).length }));

  const brandOptions = Array.from(new Set(baseProducts.map((p) => p.brand).filter((v): v is string => Boolean(v))))
    .sort()
    .map((value) => ({ value, count: baseProducts.filter((p) => p.brand === value).length }));

  const offersCount = baseProducts.filter((p) => p.oldPrice != null).length;

  const sorted = sortProducts(products, sort);
  const { items, page: currentPage, hasMore } = paginate(sorted, page);

  return (
    <main className="bg-white">

      {/* MOBILE hero */}
      <section className="sm:hidden relative h-[260px] overflow-hidden">
        <Image
          src="/IMG_2851.PNG"
          alt={category.name}
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

      {/* PRODUCTS GRID */}
      <section className="bg-white py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col lg:flex-row gap-8 items-start">
            <ProductFilterSidebar
              sort={sort}
              technologies={technologyOptions}
              energyClasses={energyClassOptions}
              brands={brandOptions}
              priceBounds={priceBounds}
              offersCount={offersCount}
            />

            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-400 mb-6">{products.length} produse găsite</p>

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
                  <p className="text-gray-500 mb-4">Niciun produs nu corespunde filtrelor selectate.</p>
                  <Link
                    href="/produse"
                    className="inline-flex items-center bg-[#1d2353] hover:bg-[#2a3470] text-white font-bold px-6 py-3 rounded-lg transition-colors text-sm uppercase tracking-wide"
                  >
                    Vezi toate produsele
                  </Link>
                </div>
              )}

              <LoadMoreButton
                basePath={`/produse/${category.slug}`}
                page={currentPage}
                sort={sort}
                hasMore={hasMore}
                extraParams={{
                  ...(filters.offersOnly ? { oferte: "1" } : {}),
                  ...(filters.technologies.length > 0 ? { tehnologie: filters.technologies.join(",") } : {}),
                  ...(filters.energyClasses.length > 0 ? { energie: filters.energyClasses.join(",") } : {}),
                  ...(filters.brands.length > 0 ? { brand: filters.brands.join(",") } : {}),
                  ...(filters.priceMin !== null ? { pretMin: String(filters.priceMin) } : {}),
                  ...(filters.priceMax !== null ? { pretMax: String(filters.priceMax) } : {}),
                }}
              />
            </div>
          </div>
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
    images?: string[];
    btu: number | null;
    technology: string;
    brand?: string | null;
    energyClass: string | null;
    rating: number;
    reviewCount: number;
    badge: string | null;
    availability: string;
    installmentsEnabled?: boolean;
    specifications?: { label: string; value: string }[];
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
    technology: string;
    energyClass: string | null;
    rating: number;
    reviewCount: number;
    badge: string | null;
  }>;
  reviews: Array<{
    id: string;
    name: string;
    rating: number;
    text: string;
    pros?: string | null;
    cons?: string | null;
    product: string | null;
  }>;
  faqs: Array<{
    id: string;
    question: string;
    answer: string;
  }>;
}

function ProductView({ product, category, related, reviews, faqs }: ProductViewProps) {
  const displayName = localProductNames[product.slug] ?? product.name;
  const displayImage = localProductImages[product.slug] ?? product.image;
  const discount = product.oldPrice ? Math.round((1 - product.price / product.oldPrice) * 100) : null;
  const displayBadge = localProductBadges[product.slug] ?? product.badge ?? (discount ? `-${discount}%` : null);

  const specs = [
    product.brand ? { label: "Brand", value: product.brand } : null,
    product.btu ? { label: "Capacitate", value: `${(product.btu / 1000).toFixed(0)}000 BTU` } : null,
    { label: "Tehnologie", value: product.technology },
    product.energyClass ? { label: "Clasă energetică", value: product.energyClass } : null,
    category ? { label: "Categorie", value: category.name } : null,
    { label: "Disponibilitate", value: product.availability },
    { label: "Garanție", value: "2 ani" },
    product.rating > 0 ? { label: "Rating", value: `${product.rating.toFixed(1)} (${product.reviewCount} recenzii)` } : null,
  ].filter(Boolean) as { label: string; value: string }[];

  const inStock = product.availability !== "Stoc epuizat";
  const highlightLabels = ["Capacitate", "Tehnologie", "Clasă energetică"];
  const highlightSpecs = specs.filter((s) => highlightLabels.includes(s.label));
  // Admin-entered specs are the most product-specific, so they lead the quick
  // panel; general fields fill the rest. Availability is excluded — it's
  // already shown as the colored badge next to the panel header.
  const topPanelSpecs = [...(product.specifications ?? []), ...specs.filter((s) => s.label !== "Disponibilitate")];
  const installmentsEnabled = product.installmentsEnabled !== false;
  const galleryImages = product.images && product.images.length > 0
    ? product.images
    : displayImage
    ? [displayImage]
    : [];

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

      {/* Title row */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 pb-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-[32px] font-extrabold text-[#1d2353] leading-tight mb-2">
              {displayName}
            </h1>
            {highlightSpecs.length > 0 && (
              <div className="flex items-center gap-2 flex-wrap">
                {highlightSpecs.map((spec) => (
                  <span
                    key={spec.label}
                    className="inline-flex items-center bg-[#f6f8fb] border border-gray-100 rounded-full px-3 py-1.5 text-xs font-bold text-[#1d2353]"
                  >
                    {spec.value}
                  </span>
                ))}
              </div>
            )}
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <div className="flex items-center gap-2">
              <StarRating rating={product.rating} />
              <span className="text-sm text-gray-500">
                {product.rating.toFixed(1)} ({product.reviewCount} recenzii)
              </span>
            </div>
            <FavoriteButton
              product={{
                slug: product.slug,
                name: displayName,
                price: product.price,
                oldPrice: product.oldPrice,
                image: displayImage,
                btu: product.btu,
                technology: product.technology,
                energyClass: product.energyClass,
                rating: product.rating,
                reviewCount: product.reviewCount,
                badge: displayBadge,
              }}
            />
          </div>
        </div>
      </section>

      {/* Top section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 pb-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">

          {/* Gallery */}
          <div>
            <ProductGallery images={galleryImages} alt={displayName} badge={displayBadge} />
          </div>

          {/* Right column: quick specs → price box → delivery info, stacked */}
          <div className="flex flex-col gap-6">
            <div>
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-extrabold uppercase tracking-wide text-[#1d2353]">Caracteristici tehnice</p>
                <span className={`text-xs font-bold flex items-center gap-1.5 ${inStock ? "text-green-600" : "text-gray-400"}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${inStock ? "bg-green-500" : "bg-gray-400"}`} />
                  {product.availability}
                </span>
              </div>
              <div className="flex flex-col gap-2.5">
                {topPanelSpecs.map((spec, i) => (
                  <QuickSpecRow key={`${spec.label}-${i}`} label={spec.label} value={spec.value} />
                ))}
              </div>
            </div>

            {product.description && (
              <p className="text-gray-600 text-[15px] leading-relaxed">
                {product.description}
              </p>
            )}

            <div className="border border-gray-100 rounded-2xl p-5">
              <div className="flex items-start justify-between gap-3 flex-wrap mb-1">
                <div>
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="text-2xl font-extrabold text-gray-900">
                      {product.price.toLocaleString("ro-MD")} MDL
                    </span>
                    {discount && (
                      <span className="inline-flex items-center bg-[#c7092b] text-white text-xs font-extrabold px-2.5 py-1 rounded-md">
                        -{discount}%
                      </span>
                    )}
                  </div>
                  {product.oldPrice && (
                    <p className="text-sm text-gray-400 line-through mt-1">
                      {product.oldPrice.toLocaleString("ro-MD")} MDL
                    </p>
                  )}
                </div>
                {installmentsEnabled && (
                  <div className="text-right">
                    <p className="text-[11px] text-gray-400">de la</p>
                    <p className="text-sm font-bold text-[#1d2353] whitespace-nowrap">
                      {Math.ceil(product.price / 12).toLocaleString("ro-MD")} lei/lună
                    </p>
                  </div>
                )}
              </div>
              {installmentsEnabled && <p className="text-[11px] text-gray-400 mb-4">*estimativ, în 12 rate</p>}

              <div className="flex items-stretch gap-3 mb-3">
                <AddToCartButton
                  slug={product.slug}
                  name={displayName}
                  price={product.price}
                  oldPrice={product.oldPrice}
                  image={displayImage}
                  inStock={inStock}
                  className={`${installmentsEnabled ? "flex-[3]" : "flex-1"} h-12 rounded-xl text-sm font-bold uppercase tracking-wide flex items-center justify-center gap-2 transition-colors ${
                    inStock
                      ? "bg-[#c7092b] hover:bg-[#a5071f] text-white"
                      : "bg-gray-100 text-gray-400 cursor-not-allowed"
                  }`}
                >
                  <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  {inStock ? "Adaugă în coș" : "Stoc epuizat"}
                </AddToCartButton>

                {installmentsEnabled && (
                  <ProductOfferModal
                    productId={product.id}
                    productName={displayName}
                    productImage={displayImage}
                    title="Cumpără în rate"
                    sourceLabel="Cerere achiziție în rate"
                    className="flex-[2] h-12 flex items-center justify-center border-2 border-[#1d2353] text-[#1d2353] hover:bg-[#1d2353] hover:text-white font-bold rounded-xl transition-all text-sm uppercase tracking-wide text-center"
                  >
                    Cumpără în rate
                  </ProductOfferModal>
                )}
              </div>

              <ProductOfferModal
                productId={product.id}
                productName={displayName}
                productImage={displayImage}
                className="w-full text-center text-gray-400 hover:text-[#c7092b] text-sm transition-colors"
              >
                Cere consultație
              </ProductOfferModal>
            </div>

            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="flex flex-col items-center gap-1.5">
                <svg className="w-6 h-6 text-[#c7092b]" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <path d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8l1.647 7.412A2 2 0 008.607 17h6.786a2 2 0 001.96-1.588L19 8M10 12h4" />
                </svg>
                <p className="text-[11px] text-gray-500 leading-snug">Livrare gratuită în Chișinău</p>
              </div>
              <div className="flex flex-col items-center gap-1.5">
                <svg className="w-6 h-6 text-[#c7092b]" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <path d="M3 13l1.5-5h11L17 13m-14 0v5a1 1 0 001 1h1m12-6v6m0 0a1 1 0 001-1v-5m-1 6h-1m-10 0a2 2 0 11-4 0 2 2 0 014 0zm10 0a2 2 0 11-4 0 2 2 0 014 0zM17 8h2l2 3v2h-4" />
                </svg>
                <p className="text-[11px] text-gray-500 leading-snug">Livrare în toată Moldova, 24h</p>
              </div>
              <div className="flex flex-col items-center gap-1.5">
                <svg className="w-6 h-6 text-[#c7092b]" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3z" />
                </svg>
                <p className="text-[11px] text-gray-500 leading-snug">Garanție 2 ani</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Full specs */}
      {(specs.length > 0 || (product.specifications && product.specifications.length > 0)) && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 pb-12">
          <h2 className="text-2xl font-extrabold text-[#1d2353] mb-6">Caracteristici</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="border border-gray-100 rounded-2xl overflow-hidden">
              <div className="bg-[#f6f8fb] px-5 py-3 text-sm font-extrabold text-[#1d2353]">Informații generale</div>
              {specs.map((spec, i) => (
                <div
                  key={`${spec.label}-${i}`}
                  className={`flex items-center justify-between px-5 py-3 border-t border-gray-100 ${i % 2 === 1 ? "bg-[#fafbfc]" : ""}`}
                >
                  <span className="text-sm text-gray-500">{spec.label}</span>
                  <span className="text-sm font-bold text-[#1d2353] text-right">{spec.value}</span>
                </div>
              ))}
            </div>

            {product.specifications && product.specifications.length > 0 && (
              <div className="border border-gray-100 rounded-2xl overflow-hidden">
                <div className="bg-[#f6f8fb] px-5 py-3 text-sm font-extrabold text-[#1d2353]">Specificații tehnice</div>
                {product.specifications.map((spec, i) => (
                  <div
                    key={`${spec.label}-${i}`}
                    className={`flex items-center justify-between px-5 py-3 border-t border-gray-100 ${i % 2 === 1 ? "bg-[#fafbfc]" : ""}`}
                  >
                    <span className="text-sm text-gray-500">{spec.label}</span>
                    <span className="text-sm font-bold text-[#1d2353] text-right">{spec.value}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* Reviews */}
      <section className="bg-[#f6f8fb] border-y border-gray-100 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
          <h2 className="text-2xl font-extrabold text-[#1d2353] mb-8">
            Recenzii clienți {reviews.length > 0 && <span className="text-gray-400 font-medium text-base">({reviews.length})</span>}
          </h2>

          <ReviewsGrid reviews={reviews} productSlug={product.slug} productName={product.name} />
        </div>
      </section>

      {/* Product FAQ — optional, only shown if an admin added questions */}
      {faqs.length > 0 && (
        <section className="bg-white py-12">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-12">
            <h2 className="text-2xl font-extrabold text-[#1d2353] mb-8">Întrebări frecvente</h2>
            <FaqAccordion faqs={faqs.map((f) => ({ question: f.question, answer: f.answer }))} />
          </div>
        </section>
      )}

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
