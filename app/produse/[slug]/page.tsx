import { cache } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArrowRight, MessageCircle, ShoppingCart, Truck, PackageCheck, ShieldCheck } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { StarRating } from "@/app/components/ui/star-rating";
import { Badge } from "@/app/components/ui/badge";
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
import ProductOfferBanner from "../../components/ProductOfferBanner";
import { getSectionFlags } from "@/lib/siteSettings";
import { getPopupCountdownMinutes } from "@/lib/popupProduct";

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
      title: `${categoryData.category.name} | Asociația Nevăzătorilor din Moldova`,
      description:
        categoryData.category.description ??
        `Descoperă gama de ${categoryData.category.name.toLowerCase()} disponibilă în magazinul asociației.`,
    };
  }

  const productData = await getProductData(slug);
  if (productData) {
    const name = localProductNames[productData.product.slug] ?? productData.product.name;
    const description =
      productData.product.description ??
      `Cumpără ${name} la cel mai bun preț.`;
    const image = productData.product.image;
    return {
      title: `${name} | Asociația Nevăzătorilor din Moldova`,
      description,
      openGraph: {
        title: `${name} | Asociația Nevăzătorilor din Moldova`,
        description,
        ...(image ? { images: [{ url: image, width: 800, height: 600, alt: name }] } : {}),
      },
      twitter: {
        card: "summary_large_image",
        title: `${name} | Asociația Nevăzătorilor din Moldova`,
        description,
        ...(image ? { images: [image] } : {}),
      },
    };
  }

  return { title: "Pagina nu a fost găsită | Asociația Nevăzătorilor din Moldova" };
}

function QuickSpecRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline gap-2 text-sm">
      <span className="text-muted-foreground shrink-0">{label}</span>
      <span className="flex-1 border-b border-dotted border-border translate-y-[-3px]" />
      <span className="font-bold text-primary text-right shrink-0">{value}</span>
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
  const { produseEnabled, ratesEnabled, installmentMonths } = await getSectionFlags();
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
        ratesEnabled={ratesEnabled}
        installmentMonths={installmentMonths}
      />
    );
  }

  const productData = await getProductData(slug);
  if (productData) {
    return <ProductView {...productData} ratesEnabled={ratesEnabled} installmentMonths={installmentMonths} />;
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
    brand: string | null;
    rating: number;
    reviewCount: number;
    badge: string | null;
    installmentsEnabled?: boolean;
    createdAt: Date;
  }>;
  sort: ReturnType<typeof parseSort>;
  page: number;
  filters: ReturnType<typeof parseFilters>;
  ratesEnabled: boolean;
  installmentMonths: number;
}

function CategoryView({ category, products: baseProducts, sort, page, filters, ratesEnabled, installmentMonths }: CategoryViewProps) {
  const products = applyFilters(baseProducts, filters);

  const priceBounds = baseProducts.reduce(
    (acc, p) => ({ min: Math.min(acc.min, p.price), max: Math.max(acc.max, p.price) }),
    { min: baseProducts[0]?.price ?? 0, max: baseProducts[0]?.price ?? 0 }
  );

  const brandOptions = Array.from(new Set(baseProducts.map((p) => p.brand).filter((v): v is string => Boolean(v))))
    .sort()
    .map((value) => ({ value, count: baseProducts.filter((p) => p.brand === value).length }));

  const offersCount = baseProducts.filter((p) => p.oldPrice != null).length;

  const sorted = sortProducts(products, sort);
  const { items, page: currentPage, hasMore } = paginate(sorted, page);

  return (
    <main className="bg-background">

      {/* MOBILE hero */}
      <section className="sm:hidden relative h-[260px] overflow-hidden">
        {/* Placeholder — swap for a real category/product photo. */}
        <Image
          src="https://placehold.co/800x600/D8B2B1/652F37?text=LuminTehnica+Cu+Dragoste"
          alt=""
          fill
          className="object-cover object-bottom"
          priority
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background/90 from-10% via-background/55 via-40% to-transparent to-70% pointer-events-none" />
        <div className="absolute top-0 left-0 z-10 flex flex-col justify-start px-4 pt-4">
          <nav className="flex items-center gap-1 text-[10px] text-muted-foreground mb-3" aria-label="Fir de ariadnă">
            <Link href="/" className="hover:text-accent transition-colors">Acasă</Link>
            <span aria-hidden>›</span>
            <Link href="/produse" className="hover:text-accent transition-colors">Produse</Link>
            <span aria-hidden>›</span>
            <span className="text-foreground">{category.name}</span>
          </nav>
          <h1 className="text-xl font-extrabold text-primary mb-2 max-w-[220px]">{category.name}</h1>
          {category.description && (
            <p className="text-foreground/80 text-xs max-w-[200px] leading-relaxed">{category.description}</p>
          )}
        </div>
      </section>

      {/* DESKTOP hero */}
      <section className="hidden sm:block relative bg-background overflow-hidden h-[300px] lg:h-[340px]">
        <div className="absolute inset-0 flex justify-end">
          <div className="w-[65%] h-full relative">
            {/* Placeholder — swap for a real category/product photo. */}
            <Image src="https://placehold.co/1200x600/D8B2B1/652F37?text=LuminTehnica+Cu+Dragoste" alt="" fill className="object-cover object-center" priority sizes="65vw" />
          </div>
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-background from-25% via-background/60 via-40% to-transparent to-65% pointer-events-none" />
        <div className="absolute inset-0 flex flex-col justify-start pt-3 px-8 lg:px-12">
          <nav className="flex items-center gap-1.5 text-xs text-muted-foreground mb-4" aria-label="Fir de ariadnă">
            <Link href="/" className="hover:text-accent transition-colors">Acasă</Link>
            <span aria-hidden>›</span>
            <Link href="/produse" className="hover:text-accent transition-colors">Produse</Link>
            <span aria-hidden>›</span>
            <span className="text-foreground">{category.name}</span>
          </nav>
          <h1 className="text-3xl lg:text-4xl font-extrabold text-primary mb-4 max-w-md">{category.name}</h1>
          {category.description && (
            <p className="text-foreground/80 text-sm lg:text-[17px] max-w-xs lg:max-w-sm leading-relaxed">
              {category.description}
            </p>
          )}
        </div>
      </section>

      {/* PRODUCTS GRID */}
      <section className="bg-background py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col lg:flex-row gap-8 items-start">
            <ProductFilterSidebar
              sort={sort}
              brands={brandOptions}
              priceBounds={priceBounds}
              offersCount={offersCount}
            />

            <div className="flex-1 min-w-0">
              <p className="text-sm text-muted-foreground mb-6">{products.length} produse găsite</p>

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
                      installmentsEnabled={ratesEnabled && product.installmentsEnabled !== false}
                      installmentMonths={installmentMonths}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 bg-card border border-border rounded-2xl">
                  <p className="text-muted-foreground mb-4">Niciun produs nu corespunde filtrelor selectate.</p>
                  <Link
                    href="/produse"
                    className="inline-flex items-center bg-primary hover:bg-brand-maroon-dark text-primary-foreground font-bold px-6 py-3 rounded-lg transition-colors text-sm uppercase tracking-wide"
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
    packageQuantity?: string | null;
    brand?: string | null;
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
    rating: number;
    reviewCount: number;
    badge: string | null;
    installmentsEnabled?: boolean;
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
  ratesEnabled: boolean;
  installmentMonths: number;
}

async function ProductView({ product, category, related, reviews, faqs, ratesEnabled, installmentMonths }: ProductViewProps) {
  const displayName = localProductNames[product.slug] ?? product.name;
  const displayImage = localProductImages[product.slug] ?? product.image;
  const discount = product.oldPrice ? Math.round((1 - product.price / product.oldPrice) * 100) : null;
  const discountAmount = product.oldPrice ? Math.round(product.oldPrice - product.price) : null;
  const displayBadge = localProductBadges[product.slug] ?? product.badge ?? (discount ? `-${discount}%` : null);
  const productCode = product.id.slice(-6).toUpperCase();
  const countdownMinutes = discount ? await getPopupCountdownMinutes() : 0;

  const specs = [
    product.packageQuantity ? { label: "Cantitate", value: product.packageQuantity } : null,
    product.brand ? { label: "Brand", value: product.brand } : null,
    category ? { label: "Categorie", value: category.name } : null,
    { label: "Disponibilitate", value: product.availability },
    product.rating > 0 ? { label: "Rating", value: `${product.rating.toFixed(1)} (${product.reviewCount} recenzii)` } : null,
  ].filter(Boolean) as { label: string; value: string }[];

  const inStock = product.availability !== "Stoc epuizat";
  const highlightLabels = ["Cantitate"];
  const highlightSpecs = specs.filter((s) => highlightLabels.includes(s.label));
  // The quick panel leads with the handful of specs that matter for a fast
  // scan, then tops up from the admin-entered specifications (if any) so
  // every product shows at least MIN_TOP_SPECS rows when the data exists.
  // Everything still shows in full further down in "Caracteristici".
  const MIN_TOP_SPECS = 5;
  const topPanelLabels = ["Cantitate", "Brand"];
  const essentialTopSpecs = specs.filter((s) => topPanelLabels.includes(s.label));
  const extraTopSpecsNeeded = Math.max(0, MIN_TOP_SPECS - essentialTopSpecs.length);
  const topPanelSpecs = [
    ...essentialTopSpecs,
    ...(product.specifications ?? []).slice(0, extraTopSpecsNeeded),
  ];
  const installmentsEnabled = ratesEnabled && product.installmentsEnabled !== false;
  const galleryImages = product.images && product.images.length > 0
    ? product.images
    : displayImage
    ? [displayImage]
    : [];

  return (
    <main className="bg-background">

      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 pt-5 pb-2">
        <nav className="flex items-center gap-1.5 text-xs text-muted-foreground flex-wrap" aria-label="Fir de ariadnă">
          <Link href="/" className="hover:text-accent transition-colors">Acasă</Link>
          <span aria-hidden>›</span>
          <Link href="/produse" className="hover:text-accent transition-colors">Produse</Link>
          {category && (
            <>
              <span aria-hidden>›</span>
              <Link href={`/produse/${category.slug}`} className="hover:text-accent transition-colors">{category.name}</Link>
            </>
          )}
          <span aria-hidden>›</span>
          <span className="text-foreground truncate max-w-[200px]">{displayName}</span>
        </nav>
      </div>

      {/* Title row */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 pb-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-[32px] font-extrabold text-primary leading-tight mb-2">
              {displayName}
            </h1>
            {highlightSpecs.length > 0 && (
              <div className="flex items-center gap-2 flex-wrap">
                {highlightSpecs.map((spec) => (
                  <span
                    key={spec.label}
                    className="inline-flex items-center bg-muted border border-border rounded-full px-3 py-1.5 text-xs font-bold text-primary"
                  >
                    {spec.value}
                  </span>
                ))}
              </div>
            )}
          </div>
          <div className="flex items-center gap-3 flex-wrap shrink-0">
            <div className="flex items-center gap-2">
              <StarRating rating={product.rating} size={20} />
              <span className="text-sm text-muted-foreground">
                {product.rating.toFixed(1)} ({product.reviewCount} recenzii)
              </span>
            </div>
            <span className="text-xs text-muted-foreground">Cod produs: {productCode}</span>
            <FavoriteButton
              product={{
                slug: product.slug,
                name: displayName,
                price: product.price,
                oldPrice: product.oldPrice,
                image: displayImage,
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
                <p className="text-xs font-extrabold uppercase tracking-wide text-primary">Caracteristici</p>
                <span className={`text-xs font-bold flex items-center gap-1.5 ${inStock ? "text-success" : "text-muted-foreground"}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${inStock ? "bg-success" : "bg-muted-foreground"}`} aria-hidden />
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
              <p className="text-foreground/80 text-[15px] leading-relaxed">
                {product.description}
              </p>
            )}

            {discount && countdownMinutes > 0 && (
              <ProductOfferBanner discount={discount} countdownMinutes={countdownMinutes} />
            )}

            <div className="border border-border rounded-2xl p-5 bg-card">
              <div className="mb-1">
                {product.oldPrice && discount && (
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span className="text-sm text-muted-foreground line-through">
                      {product.oldPrice.toLocaleString("ro-MD")} MDL
                    </span>
                    <Badge variant="accent" className="normal-case px-2.5 py-1">
                      -{discountAmount?.toLocaleString("ro-MD")} MDL
                    </Badge>
                    <Badge variant="secondary" className="normal-case px-2.5 py-1">
                      -{discount}%
                    </Badge>
                  </div>
                )}
                <span className="text-2xl font-extrabold text-foreground">
                  {product.price.toLocaleString("ro-MD")} MDL
                </span>
              </div>

              {installmentsEnabled && (
                <div className="inline-flex items-center gap-2 bg-secondary/40 rounded-lg px-3 py-2 mb-4">
                  <span className="bg-primary text-primary-foreground text-[10px] font-extrabold px-2 py-1 rounded uppercase tracking-wide">
                    Rate
                  </span>
                  <span className="text-xs font-bold text-primary">
                    în {installmentMonths} luni, de la {Math.ceil(product.price / installmentMonths).toLocaleString("ro-MD")} lei/lună
                  </span>
                </div>
              )}

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
                      ? "bg-accent hover:bg-brand-red-dark text-accent-foreground"
                      : "bg-muted text-muted-foreground cursor-not-allowed"
                  }`}
                >
                  <ShoppingCart className="w-4 h-4 shrink-0" aria-hidden />
                  {inStock ? "Adaugă în coș" : "Stoc epuizat"}
                </AddToCartButton>

                {installmentsEnabled && (
                  <ProductOfferModal
                    productId={product.id}
                    productName={displayName}
                    productImage={displayImage}
                    title="Cumpără în rate"
                    sourceLabel="Cerere achiziție în rate"
                    className="flex-[2] h-12 flex items-center justify-center border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground font-bold rounded-xl transition-all duration-300 text-sm uppercase tracking-wide text-center hover:-translate-y-0.5 hover:shadow-md active:scale-95 active:translate-y-0"
                  >
                    Cumpără în rate
                  </ProductOfferModal>
                )}
              </div>

              <ProductOfferModal
                productId={product.id}
                productName={displayName}
                productImage={displayImage}
                className="group w-full flex items-center justify-center gap-1.5 text-muted-foreground hover:text-accent text-sm transition-colors active:scale-95"
              >
                <MessageCircle className="w-4 h-4 shrink-0 transition-transform duration-300 group-hover:rotate-12 group-hover:scale-110" aria-hidden />
                <span className="relative">
                  Cere consultație
                  <span className="absolute left-0 -bottom-0.5 w-0 h-px bg-accent transition-all duration-300 group-hover:w-full" />
                </span>
              </ProductOfferModal>
            </div>

            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="flex flex-col items-center gap-1.5">
                <Truck className="w-6 h-6 text-accent" strokeWidth={1.8} aria-hidden />
                <p className="text-[11px] text-muted-foreground leading-snug">Livrare gratuită în Chișinău</p>
              </div>
              <div className="flex flex-col items-center gap-1.5">
                <PackageCheck className="w-6 h-6 text-accent" strokeWidth={1.8} aria-hidden />
                <p className="text-[11px] text-muted-foreground leading-snug">Livrare în toată Moldova, 24h</p>
              </div>
              <div className="flex flex-col items-center gap-1.5">
                <ShieldCheck className="w-6 h-6 text-accent" strokeWidth={1.8} aria-hidden />
                <p className="text-[11px] text-muted-foreground leading-snug">Garanție 2 ani</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Full specs */}
      {(specs.length > 0 || (product.specifications && product.specifications.length > 0)) && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 pb-12">
          <h2 className="text-2xl font-extrabold text-primary mb-6">Caracteristici</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="border border-border rounded-2xl overflow-hidden bg-card">
              <div className="bg-muted px-5 py-3 text-sm font-extrabold text-primary">Informații generale</div>
              {specs.map((spec, i) => (
                <div
                  key={`${spec.label}-${i}`}
                  className={`flex items-center justify-between px-5 py-3 border-t border-border ${i % 2 === 1 ? "bg-muted/40" : ""}`}
                >
                  <span className="text-sm text-muted-foreground">{spec.label}</span>
                  <span className="text-sm font-bold text-primary text-right">{spec.value}</span>
                </div>
              ))}
            </div>

            {product.specifications && product.specifications.length > 0 && (
              <div className="border border-border rounded-2xl overflow-hidden bg-card">
                <div className="bg-muted px-5 py-3 text-sm font-extrabold text-primary">Specificații suplimentare</div>
                {product.specifications.map((spec, i) => (
                  <div
                    key={`${spec.label}-${i}`}
                    className={`flex items-center justify-between px-5 py-3 border-t border-border ${i % 2 === 1 ? "bg-muted/40" : ""}`}
                  >
                    <span className="text-sm text-muted-foreground">{spec.label}</span>
                    <span className="text-sm font-bold text-primary text-right">{spec.value}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* Reviews */}
      <section className="bg-muted border-y border-border py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
          <h2 className="text-2xl font-extrabold text-primary mb-8">
            Recenzii {reviews.length > 0 && <span className="text-muted-foreground font-medium text-base">({reviews.length})</span>}
          </h2>

          <ReviewsGrid reviews={reviews} productSlug={product.slug} productName={product.name} />
        </div>
      </section>

      {/* Product FAQ — optional, only shown if an admin added questions */}
      {faqs.length > 0 && (
        <section className="bg-background py-12">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-12">
            <h2 className="text-2xl font-extrabold text-primary mb-8">Întrebări frecvente</h2>
            <FaqAccordion faqs={faqs.map((f) => ({ question: f.question, answer: f.answer }))} />
          </div>
        </section>
      )}

      {/* Related products */}
      {related.length > 0 && (
        <section className="bg-background py-14">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
            <h2 className="text-2xl font-extrabold text-foreground uppercase tracking-wide mb-8">
              Produse <span className="text-accent">similare</span>
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
              {related.map((p) => (
                <ProductCard
                  key={p.id}
                  {...p}
                  name={localProductNames[p.slug] ?? p.name}
                  image={localProductImages[p.slug] ?? p.image}
                  badge={localProductBadges[p.slug] ?? p.badge}
                  installmentsEnabled={ratesEnabled && p.installmentsEnabled !== false}
                  installmentMonths={installmentMonths}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="bg-background px-4 sm:px-6 lg:px-12 pb-10">
        <div className="max-w-7xl mx-auto bg-primary rounded-2xl py-10 lg:py-12 px-8 lg:px-12">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-primary-foreground leading-tight mb-2">
                Ai nevoie de ajutor pentru a alege?
              </h2>
              <p className="text-primary-foreground/70 text-sm max-w-md">
                Echipa noastră îți răspunde cu drag la orice întrebare despre produsele din magazin.
              </p>
            </div>
            <div className="shrink-0">
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 bg-accent hover:bg-brand-red-dark text-accent-foreground font-extrabold text-sm px-8 py-4 rounded-xl transition-all duration-300 uppercase tracking-wide shadow-lg hover:-translate-y-0.5"
              >
                Contactează-ne
                <ArrowRight className="w-4 h-4" aria-hidden />
              </Link>
            </div>
          </div>
        </div>
      </section>

    </main>
  );
}
