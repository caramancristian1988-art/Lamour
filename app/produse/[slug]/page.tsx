import { cache } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArrowRight, Banknote, MessageCircle, Truck, PackageCheck, ShieldCheck, ChevronDown, FileText, ListChecks } from "lucide-react";
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
  dedupeVariants,
  buildVariantOptionsMap,
  variantSortValue,
  type VariantOption,
} from "@/lib/productListing";
import ProductsSection from "../../components/ProductsSection";
import ProductBuyBox from "../../components/ProductBuyBox";
import { normalizeTiers, type PriceTier } from "@/lib/pricing";
import ProductGallery from "../../components/ProductGallery";
import FavoriteButton from "../../components/FavoriteButton";
import ProductsCatalog from "../../components/ProductsCatalog";
import { toCatalogProduct, variantOptionsRecord, type CatalogProduct } from "@/lib/clientCatalog";
import { rootSlugById } from "@/lib/productHighlight";
import { getCatalog } from "@/lib/catalog";
import { onlyVisible } from "@/lib/productVisibility";
import ReviewsGrid from "../../components/ReviewsGrid";
import FaqAccordion from "../../components/FaqAccordion";
import ProductOfferBanner from "../../components/ProductOfferBanner";
import { getSectionFlags } from "@/lib/siteSettings";
import { getPopupCountdownMinutes } from "@/lib/popupProduct";
import JsonLd from "../../components/JsonLd";
import { breadcrumbList, collectionPage, productSchema } from "@/lib/structuredData";
import { absoluteUrl } from "@/lib/seo";

export const revalidate = 86400;

const allFallbackProducts = [
  ...fallbackProducts,
  ...fallbackPopularProducts,
  ...fallbackOfferProducts,
  ...fallbackDiscountProducts,
].map((p) => ({ ...p, images: [] as string[], brand: null as string | null, variantGroupId: null as string | null, variantLabel: null as string | null }));

const getCategoryData = cache(async (slug: string) => {
  try {
    // Din catalogul ținut în cache (același ca în /produse): fără 3 interogări la baza de date la fiecare filtrare, iar
    // pentru o pagină de produs (slug care nu e categorie) răspunsul "nu e categorie" vine fără niciun apel la bază.
    const { categories, products: catalogProducts } = await getCatalog();
    const category = categories.find((c) => c.slug === slug);
    if (!category) return null;
    const children = categories.filter((c) => c.parentId === category.id);

    // Categoria + toate subcategoriile ei; alegerea subcategoriilor (?subcat=a,b) se face în browser, în ProductsCatalog.
    const categoryIds = new Set([category.id, ...children.map((c) => c.id)]);

    const products = catalogProducts.filter((p) => categoryIds.has(p.categoryId));
    const rootSlugs = rootSlugById(categories);
    return {
      category,
      products: dedupeVariants(products).map((p) => toCatalogProduct(p, rootSlugs.get(p.categoryId))),
      variantOptions: variantOptionsRecord(products),
      children,
    };
  } catch {
    const category = fallbackCategories.find((c) => c.slug === slug);
    if (!category) return null;
    const products = allFallbackProducts.filter((p) => p.categoryId === category.id);
    return {
      category,
      products: dedupeVariants(products).map((p) => toCatalogProduct(p)),
      variantOptions: variantOptionsRecord(products),
      children: [] as { id: string; name: string; slug: string; parentId: string | null }[],
    };
  }
});

const getProductData = cache(async (slug: string) => {
  try {
    const product = await prisma.product.findUnique({ where: { slug }, include: { category: true } });
    // Produs dezactivat din admin: pe site se comportă ca și cum nu ar exista (404).
    if (!product || product.hidden === true) return null;
    const familyId = product.variantGroupId ?? product.id;
    const [relatedRaw, reviews] = await Promise.all([
      prisma.product.findMany({
        where: onlyVisible({
          categoryId: product.categoryId,
          NOT: [{ id: product.id }, { variantGroupId: familyId }, { id: familyId }],
        }),
        take: 40,
      }),
      prisma.review.findMany({ where: { product: product.name, approved: true } }),
    ]);
    const related = dedupeVariants(relatedRaw).slice(0, 12);
    const relatedVariantOptionsMap = buildVariantOptionsMap(relatedRaw);
    // Fetched separately so a hiccup here (e.g. a not-yet-migrated client)
    // can't take down the whole product page and fall back to demo data.
    let faqs: Awaited<ReturnType<typeof prisma.productFaq.findMany>> = [];
    try {
      faqs = await prisma.productFaq.findMany({ where: { productId: product.id }, orderBy: { order: "asc" } });
    } catch {
      faqs = [];
    }

    // Variant family: the primary product (variantGroupId null) plus every
    // sibling — resolved regardless of which variant's page we're on.
    let variants: {
      id: string;
      slug: string;
      variantLabel: string | null;
      price: number;
      oldPrice: number | null;
      priceTiers?: PriceTier[];
    }[] = [];
    try {
      const primaryId = product.variantGroupId ?? product.id;
      variants = await prisma.product.findMany({
        where: onlyVisible({ OR: [{ id: primaryId }, { variantGroupId: primaryId }] }),
        // priceTiers: fiecare variantă are pragurile ei, iar popup-ul de adăugare
        // în coș trebuie să le poată arăta pentru varianta aleasă.
        select: { id: true, slug: true, variantLabel: true, price: true, oldPrice: true, priceTiers: true },
      });
    } catch {
      variants = [];
    }

    return { product, category: product.category, related, relatedVariantOptionsMap, reviews, faqs, variants };
  } catch {
    const product = allFallbackProducts.find((p) => p.slug === slug);
    if (!product) return null;
    const category = fallbackCategories.find((c) => c.id === product.categoryId) ?? null;
    const related = allFallbackProducts
      .filter((p) => p.categoryId === product.categoryId && p.id !== product.id)
      .slice(0, 4);
    const reviews = fallbackReviews.filter((r) => r.product === product.name);
    return { product, category, related, relatedVariantOptionsMap: new Map(), reviews, faqs: [], variants: [] };
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
    const catName = categoryData.category.name;
    const count = categoryData.products.length;
    const title = `${catName} – preț bun, livrare în Moldova | LuminTehnica`;
    const description =
      categoryData.category.description ??
      `${catName} LuminTehnica${count > 0 ? ` — ${count} produse` : ""}: calitate garantată, fabricate în Moldova. Comandă online, livrare rapidă în Chișinău și în toată țara.`;
    const canonical = absoluteUrl(`/produse/${slug}`);
    const keywords = Array.from(
      new Set([
        catName,
        catName.toLowerCase(),
        ...categoryData.children.map((c) => c.name),
        "LuminTehnica",
        "produse Moldova",
        "cumpără online",
        "Chișinău",
      ])
    );
    return {
      title: { absolute: title },
      description,
      keywords,
      alternates: { canonical },
      openGraph: { title, description, url: canonical },
      twitter: { title, description },
    };
  }

  const productData = await getProductData(slug);
  if (productData) {
    const { product, category } = productData;
    const name = localProductNames[product.slug] ?? product.name;
    const catName = category?.name ?? null;
    const description =
      product.description ??
      [
        `${name}${product.packageQuantity ? `, ${product.packageQuantity}` : ""} — ${product.price.toLocaleString("ro-MD")} MDL.`,
        `Produs LuminTehnica${product.brand ? ` de la ${product.brand}` : ""}${catName ? `, din categoria ${catName.toLowerCase()}` : ""}, fabricat în Moldova.`,
        "Comandă online, livrare rapidă în Chișinău și în toată țara.",
      ].join(" ");
    const image = product.image;
    const title = `${name}${catName ? ` – ${catName}` : ""} | LuminTehnica`;
    const canonical = absoluteUrl(`/produse/${slug}`);
    const keywords = Array.from(
      new Set(
        [name, catName, product.brand, "LuminTehnica", "cumpără online", "preț", "Moldova", "Chișinău"].filter(
          (k): k is string => Boolean(k)
        )
      )
    );
    return {
      title: { absolute: title },
      description,
      keywords,
      alternates: { canonical },
      openGraph: {
        title,
        description,
        url: canonical,
        ...(image ? { images: [{ url: image, width: 800, height: 600, alt: name }] } : {}),
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        ...(image ? { images: [image] } : {}),
      },
    };
  }

  return { title: "Pagina nu a fost găsită", robots: { index: false, follow: true } };
}

// Pagină statică (fără searchParams): filtrele categoriei rulează în browser. Se reface la cel mult o oră sau imediat
// când adminul modifică produse/categorii (revalidatePath + updateTag).
export async function generateStaticParams() {
  try {
    const { categories, products } = await getCatalog();
    return [...categories.map((c) => ({ slug: c.slug })), ...products.map((p) => ({ slug: p.slug }))];
  } catch {
    return [];
  }
}

export default async function ProduseSlugPage({ params }: { params: Promise<{ slug: string }> }) {
  const { produseEnabled, ratesEnabled, installmentMonths } = await getSectionFlags();
  if (!produseEnabled) notFound();

  const { slug } = await params;

  const categoryData = await getCategoryData(slug);
  if (categoryData) {
    return <CategoryView {...categoryData} ratesEnabled={ratesEnabled} installmentMonths={installmentMonths} />;
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
  children: Array<{ id: string; name: string; slug: string; parentId?: string | null }>;
  products: CatalogProduct[];
  variantOptions: Record<string, VariantOption[]>;
  ratesEnabled: boolean;
  installmentMonths: number;
}

function CategoryView({ category, children, products, variantOptions, ratesEnabled, installmentMonths }: CategoryViewProps) {
  // Pentru datele structurate: primele produse în ordinea implicită (cele mai noi).
  const items = paginate(sortProducts(products, "newest"), 1).items;
  const childCategories = children.map((c) => ({ id: c.id, slug: c.slug, name: c.name, parentId: c.parentId ?? category.id }));

  return (
    <main className="page-motif">
      <JsonLd
        data={breadcrumbList([
          { name: "Acasă", path: "/" },
          { name: "Catalog", path: "/produse" },
          { name: category.name, path: `/produse/${category.slug}` },
        ])}
      />
      <JsonLd
        data={collectionPage({
          name: category.name,
          description: category.description ?? undefined,
          url: `/produse/${category.slug}`,
          items: items.map((p) => ({ name: p.name, url: `/produse/${p.slug}`, image: p.image })),
        })}
      />

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
            <Link href="/produse" className="hover:text-accent transition-colors">Catalog</Link>
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
            <Link href="/produse" className="hover:text-accent transition-colors">Catalog</Link>
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

      {/* Chip-uri de subcategorii, filtre și listă: toate rulează în browser (ProductsCatalog). */}
      <section className="py-10">
        <div className="max-w-[110rem] mx-auto px-4 sm:px-6">
          <ProductsCatalog
            mode="category"
            products={products}
            variantOptions={variantOptions}
            categories={childCategories}
            ratesEnabled={ratesEnabled}
            installmentMonths={installmentMonths}
          />
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
    bulkMinQty?: number | null;
    bulkPrice?: number | null;
    priceTiers?: PriceTier[];
    image: string | null;
    images?: string[];
    packageQuantity?: string | null;
    brand?: string | null;
    rating: number;
    reviewCount: number;
    badge: string | null;
    availability: string;
    installmentsEnabled?: boolean;
    warrantyEnabled?: boolean | null;
    code?: string | null;
    specifications?: { label: string; value: string }[];
    salesCount?: number;
    variantLabel?: string | null;
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
  relatedVariantOptionsMap: Map<string, VariantOption[]>;
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
  variants: Array<{
    id: string;
    slug: string;
    variantLabel: string | null;
    price: number;
    oldPrice: number | null;
    priceTiers?: PriceTier[];
  }>;
  ratesEnabled: boolean;
  installmentMonths: number;
}

async function ProductView({ product, category, related, relatedVariantOptionsMap, reviews, faqs, variants, ratesEnabled, installmentMonths }: ProductViewProps) {
  const displayName = localProductNames[product.slug] ?? product.name;
  const displayImage = localProductImages[product.slug] ?? product.image;
  const discount = product.oldPrice ? Math.round((1 - product.price / product.oldPrice) * 100) : null;
  const discountAmount = product.oldPrice ? Math.round(product.oldPrice - product.price) : null;
  const displayBadge = localProductBadges[product.slug] ?? product.badge ?? (discount ? `-${discount}%` : null);
  const productCode = product.code ?? product.id.slice(-6).toUpperCase();
  const countdownMinutes = discount ? await getPopupCountdownMinutes() : 0;

  const findSpec = (labelMatch: string) =>
    product.specifications?.find((s) => s.label.toLowerCase().includes(labelMatch))?.value ?? null;
  const materialSpec = findSpec("material") ?? findSpec("compozi");
  const countryOfOriginSpec = findSpec("fabrica") ?? findSpec("origine");

  const specs = [
    product.packageQuantity ? { label: "Cantitate", value: product.packageQuantity } : null,
    product.brand ? { label: "Brand", value: product.brand } : null,
    category ? { label: "Categorie", value: category.name } : null,
    { label: "Disponibilitate", value: product.availability },
  ].filter(Boolean) as { label: string; value: string }[];
  const allSpecs = [...specs, ...(product.specifications ?? [])];

  const inStock = product.availability !== "Stoc epuizat";
  const tiers = normalizeTiers(product);
  const installmentsEnabled = ratesEnabled && product.installmentsEnabled !== false;
  // Imaginea principală plus galeria, fără duplicate — altfel, când galeria
  // avea poze, imaginea principală era pur și simplu aruncată.
  const galleryImages = Array.from(
    new Set([displayImage, ...(product.images ?? [])].filter(Boolean) as string[])
  );

  return (
    <main className="page-motif">
      <JsonLd
        data={breadcrumbList([
          { name: "Acasă", path: "/" },
          { name: "Catalog", path: "/produse" },
          ...(category ? [{ name: category.name, path: `/produse/${category.slug}` }] : []),
          { name: displayName, path: `/produse/${product.slug}` },
        ])}
      />
      <JsonLd
        data={productSchema({
          name: displayName,
          description: product.description,
          image: displayImage,
          images: product.images,
          url: `/produse/${product.slug}`,
          categoryName: category?.name ?? null,
          price: product.price,
          availability: product.availability,
          material: materialSpec,
          countryOfOrigin: countryOfOriginSpec,
          ratingValue: product.rating > 0 ? product.rating : null,
          reviewCount: product.reviewCount > 0 ? product.reviewCount : null,
          reviews: reviews.slice(0, 10).map((r) => ({ author: r.name, reviewBody: r.text, ratingValue: r.rating })),
        })}
      />

      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 pt-5 pb-2">
        <nav className="flex items-center gap-1.5 text-xs text-muted-foreground flex-wrap" aria-label="Fir de ariadnă">
          <Link href="/" className="hover:text-accent transition-colors">Acasă</Link>
          <span aria-hidden>›</span>
          <Link href="/produse" className="hover:text-accent transition-colors">Catalog</Link>
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

      {/* Top section: photo, then name → cod → preț → reducere → acțiuni, în ordinea asta pentru citire liniară (NVDA/mobil) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 pb-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">

          {/* Gallery */}
          <div>
            <ProductGallery images={galleryImages} alt={displayName} badge={displayBadge} />
          </div>

          {/* Info column: denumire → cod → preț/reducere → acțiuni → livrare → caracteristici (ascunse) */}
          <div className="flex flex-col gap-5">
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-[32px] font-extrabold text-primary leading-tight mb-2">
                {displayName}
              </h1>
              <div className="flex items-center gap-3 flex-wrap">
                <span className="text-sm text-muted-foreground">Cod produs: {productCode}</span>
                <div className="flex items-center gap-2">
                  <StarRating rating={product.rating} size={18} />
                  <span className="text-sm text-muted-foreground">
                    {product.rating.toFixed(1)} ({product.reviewCount} recenzii)
                  </span>
                </div>
                {(product.salesCount ?? 0) >= 10 && (
                  <Badge variant="success" className="normal-case">
                    {product.salesCount} vândute
                  </Badge>
                )}
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

            {discount && countdownMinutes > 0 && (
              <ProductOfferBanner discount={discount} countdownMinutes={countdownMinutes} />
            )}

            {variants.length > 1 && (
              <div className="border border-border rounded-2xl p-5 bg-card">
                <p className="text-xs font-extrabold uppercase tracking-wide text-primary mb-3">
                  Selectează capacitatea
                </p>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
                  {[...variants]
                    .sort((a, b) => variantSortValue(a.variantLabel) - variantSortValue(b.variantLabel))
                    .map((v) => {
                      const active = v.id === product.id;
                      return (
                        <Link
                          key={v.id}
                          href={`/produse/${v.slug}`}
                          aria-current={active ? "true" : undefined}
                          className={`flex flex-col items-center justify-center gap-0.5 rounded-xl border-2 px-2 py-2.5 text-center transition-all active:scale-90 ${
                            active
                              ? "border-accent bg-accent/5 shadow-sm animate-pop"
                              : "border-border hover:border-accent/50 hover:shadow-sm"
                          }`}
                        >
                          <span className={`text-sm font-bold ${active ? "text-accent" : "text-foreground"}`}>
                            {v.variantLabel ?? "—"}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {v.price.toLocaleString("ro-MD")} MDL
                          </span>
                        </Link>
                      );
                    })}
                </div>
              </div>
            )}

            <div key={product.id} className="border border-border rounded-2xl p-5 bg-card animate-pop">
              <div className="mb-1">
                <span className="text-2xl font-extrabold text-foreground">
                  {product.price.toLocaleString("ro-MD")} MDL
                </span>

                {product.oldPrice && discount && (
                  <div className="mt-2">
                    <p className="text-xs font-extrabold uppercase tracking-wide text-accent mb-1.5">Reducere</p>
                    <div className="flex items-center gap-2 flex-wrap">
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
                  </div>
                )}

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

              <div className="mb-3">
                <ProductBuyBox
                  slug={product.slug}
                  name={displayName}
                  price={product.price}
                  oldPrice={product.oldPrice}
                  image={displayImage}
                  inStock={inStock}
                  tiers={tiers}
                  variantOptions={variants.length > 1 ? variants : undefined}
                  variantLabel={product.variantLabel}
                >
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
                </ProductBuyBox>
              </div>

              <ProductOfferModal
                productId={product.id}
                productName={displayName}
                productImage={displayImage}
                className="group flex w-full items-center gap-3 rounded-2xl border-2 border-accent/40 bg-accent/10 px-4 py-3 text-left transition-all duration-300 hover:-translate-y-0.5 hover:border-accent hover:bg-accent hover:shadow-md active:translate-y-0 active:scale-[0.98]"
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-accent text-white transition-colors group-hover:bg-white group-hover:text-accent" aria-hidden>
                  <MessageCircle className="h-5 w-5 transition-transform duration-300 group-hover:rotate-12 group-hover:scale-110" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-extrabold leading-tight text-primary transition-colors group-hover:text-white">Cere consultație</span>
                  <span className="block text-xs leading-snug text-muted-foreground transition-colors group-hover:text-white/85">
                    Întreabă-ne orice despre acest produs
                  </span>
                </span>
                <ArrowRight className="h-5 w-5 shrink-0 text-accent transition-all duration-300 group-hover:translate-x-1 group-hover:text-white" aria-hidden />
              </ProductOfferModal>
            </div>

            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="flex flex-col items-center gap-1.5">
                <Truck className="w-6 h-6 text-accent" strokeWidth={1.8} aria-hidden />
                <p className="text-[11px] text-muted-foreground leading-snug">Livrare gratuită în Chișinău</p>
              </div>
              <div className="flex flex-col items-center gap-1.5">
                <PackageCheck className="w-6 h-6 text-accent" strokeWidth={1.8} aria-hidden />
                <p className="text-[11px] text-muted-foreground leading-snug">Livrare în toată Moldova, 1-7 zile</p>
              </div>
              {/* Produsele fără garanție (consumabile) primesc alt avantaj în același loc, ca rândul să rămână plin. */}
              {product.warrantyEnabled !== false ? (
                <div className="flex flex-col items-center gap-1.5">
                  <ShieldCheck className="w-6 h-6 text-accent" strokeWidth={1.8} aria-hidden />
                  <p className="text-[11px] text-muted-foreground leading-snug">Garanție 2 ani</p>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-1.5">
                  <Banknote className="w-6 h-6 text-accent" strokeWidth={1.8} aria-hidden />
                  <p className="text-[11px] text-muted-foreground leading-snug">Plată la primire</p>
                </div>
              )}
            </div>

            {product.description && (
              <details className="group overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all duration-200 hover:border-accent/50 open:border-accent/50 open:shadow-md">
                <summary className="flex cursor-pointer list-none items-center gap-3 px-4 py-3.5 select-none [&::-webkit-details-marker]:hidden">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent/10 text-accent transition-colors group-open:bg-accent group-open:text-white" aria-hidden>
                    <FileText className="h-5 w-5" strokeWidth={1.9} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-extrabold leading-tight text-primary">Vezi descrierea</span>
                    <span className="block text-xs text-muted-foreground">Despre acest produs</span>
                  </span>
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-primary transition-colors group-open:bg-primary group-open:text-white" aria-hidden>
                    <ChevronDown className="h-4 w-4 transition-transform duration-300 group-open:rotate-180" />
                  </span>
                </summary>
                <div className="animate-slide-up border-t border-border/70 bg-muted/30 px-5 py-4 sm:px-6">
                  <div className="space-y-3 text-[15px] leading-relaxed text-foreground/85">
                    {product.description
                      .split(/\n{2,}/)
                      .filter((p) => p.trim())
                      .map((p, i) => (
                        <p key={i} className="whitespace-pre-line">
                          {p.trim()}
                        </p>
                      ))}
                  </div>
                </div>
              </details>
            )}

            {allSpecs.length > 0 && (
              <details className="group overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all duration-200 hover:border-accent/50 open:border-accent/50 open:shadow-md">
                <summary className="flex cursor-pointer list-none items-center gap-3 px-4 py-3.5 select-none [&::-webkit-details-marker]:hidden">
                  <span
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors ${inStock ? "bg-success/10 text-success group-open:bg-success group-open:text-white" : "bg-muted text-muted-foreground group-open:bg-primary group-open:text-white"}`}
                    aria-hidden
                  >
                    <ListChecks className="h-5 w-5" strokeWidth={1.9} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-extrabold leading-tight text-primary">Vezi caracteristici</span>
                    <span className="block text-xs text-muted-foreground">
                      {allSpecs.length} {allSpecs.length === 1 ? "caracteristică" : "caracteristici"}
                    </span>
                  </span>
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-primary transition-colors group-open:bg-primary group-open:text-white" aria-hidden>
                    <ChevronDown className="h-4 w-4 transition-transform duration-300 group-open:rotate-180" />
                  </span>
                </summary>
                <dl className="animate-slide-up border-t border-border/70">
                  {allSpecs.map((spec, i) => (
                    <div
                      key={`${spec.label}-${i}`}
                      className={`flex items-baseline justify-between gap-4 px-5 py-3 sm:px-6 ${i % 2 === 0 ? "bg-muted/40" : ""}`}
                    >
                      <dt className="text-sm text-muted-foreground">{spec.label}</dt>
                      <dd className="text-right text-sm font-bold text-primary">{spec.value}</dd>
                    </div>
                  ))}
                </dl>
              </details>
            )}
          </div>
        </div>
      </section>

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
        <section className="py-12">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-12">
            <h2 className="text-2xl font-extrabold text-primary mb-8">Întrebări frecvente</h2>
            <FaqAccordion faqs={faqs.map((f) => ({ question: f.question, answer: f.answer }))} />
          </div>
        </section>
      )}

      {/* Produse similare: carusel cu butoane stânga / dreapta (pe telefon se glisează cu degetul) */}
      {related.length > 0 && (
        <ProductsSection
          products={related}
          title="Produse"
          highlighted="similare"
          viewAllHref={category ? `/produse?cat=${category.slug}` : "/produse"}
          viewAllLabel="Vezi toată categoria"
          variantOptionsMap={relatedVariantOptionsMap}
        />
      )}

      {/* CTA */}
      <section className="px-4 sm:px-6 lg:px-12 pb-10">
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
