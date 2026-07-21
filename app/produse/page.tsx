import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSectionFlags } from "@/lib/siteSettings";
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
import FurnitureCard from "../components/FurnitureCard";
import SpaceCard from "../components/SpaceCard";
import DivisionFilterSidebar from "../components/DivisionFilterSidebar";
import { getFurnitureListings } from "@/lib/mobilaData";
import { getSpaceListings } from "@/lib/spatiiComercialeData";
import {
  sortProducts,
  paginate,
  parseSort,
  parsePage,
  parseFilters,
  applyFilters,
} from "@/lib/productListing";
import { localProductImages, localProductBadges, localProductNames } from "@/lib/productOverrides";

export const metadata: Metadata = {
  title: "Produse | Asociația Nevăzătorilor din Moldova",
  description:
    "Descoperă gama completă de produse și accesorii disponibile în magazinul asociației.",
};

export const revalidate = 3600;

const KNOWN_BRANDS = [
  "Daikin", "Mitsubishi Electric", "Gree", "Midea", "Cooper&Hunter", "Electrolux",
  "LG", "Samsung", "Haier", "Panasonic", "Fujitsu", "Hitachi", "Carrier", "Trane",
  "Bosch", "Toshiba", "Ariston", "Hisense", "Whirlpool", "Sharp",
];

type Division = "uz-casnic" | "mobila" | "chirie";

const DIVISION_TABS: { label: string; value: Division }[] = [
  { label: "Produse de uz casnic", value: "uz-casnic" },
  { label: "Mobilă", value: "mobila" },
  { label: "Chirie", value: "chirie" },
];

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
  brand: string | null;
  rating: number;
  reviewCount: number;
  badge: string | null;
  availability: string;
  installmentsEnabled?: boolean;
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
      ].map((p) => ({ ...p, images: [] as string[], brand: null as string | null })),
    };
  }
}

function firstParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function selectedParams(value: string | string[] | undefined): string[] {
  return (firstParam(value) ?? "").split(",").filter(Boolean);
}

function materialFamily(material: string): string {
  if (material.includes("Lemn masiv")) return "Lemn masiv";
  if (material.includes("PAL")) return "PAL";
  if (material.includes("MDF")) return "MDF";
  return material;
}

type AreaBucket = "sub-70" | "70-150" | "peste-150";
const AREA_BUCKET_LABELS: Record<AreaBucket, string> = {
  "sub-70": "Sub 70 m²",
  "70-150": "70 - 150 m²",
  "peste-150": "Peste 150 m²",
};
function areaBucket(area: number): AreaBucket {
  if (area < 70) return "sub-70";
  if (area <= 150) return "70-150";
  return "peste-150";
}

function zoneLabel(location: string): string {
  const parts = location.split(",");
  return (parts[1] ?? parts[0]).trim();
}

function facetOptions<T>(items: T[], getValue: (item: T) => string, getLabel?: (value: string) => string): { value: string; label: string; count: number }[] {
  const counts = new Map<string, number>();
  items.forEach((item) => {
    const value = getValue(item);
    counts.set(value, (counts.get(value) ?? 0) + 1);
  });
  return Array.from(counts.entries())
    .map(([value, count]) => ({ value, label: getLabel ? getLabel(value) : value, count }))
    .sort((a, b) => a.label.localeCompare(b.label));
}

function DivisionTabs({ active }: { active: Division }) {
  return (
    <div className="flex items-center gap-2 sm:gap-3 flex-wrap mb-6">
      {DIVISION_TABS.map((tab) => (
        <Link
          key={tab.value}
          href={`/produse?division=${tab.value}`}
          className={`px-5 sm:px-6 py-2.5 sm:py-3 rounded-full text-sm sm:text-base font-bold transition-colors ${
            active === tab.value
              ? "bg-primary text-white shadow-sm"
              : "bg-card border-2 border-border text-foreground hover:border-accent hover:text-accent"
          }`}
        >
          {tab.label}
        </Link>
      ))}
    </div>
  );
}

function Breadcrumb() {
  return (
    <section className="bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-4 pb-1">
        <nav className="flex items-center gap-1.5 text-xs text-muted-foreground" aria-label="Fir de ariadnă">
          <Link href="/" className="hover:text-accent transition-colors">Acasă</Link>
          <span aria-hidden>›</span>
          <span className="text-foreground">Produse</span>
        </nav>
      </div>
    </section>
  );
}

export default async function ProdusePage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { produseEnabled, ratesEnabled, installmentMonths } = await getSectionFlags();
  if (!produseEnabled) notFound();

  const query = await searchParams;
  const divisionParam = firstParam(query.division);
  const division: Division =
    divisionParam === "mobila" || divisionParam === "chirie" ? divisionParam : "uz-casnic";

  // ── MOBILĂ ──────────────────────────────────────────────────────────
  if (division === "mobila") {
    const allListings = await getFurnitureListings();

    const selectedTypes = selectedParams(query.tip);
    const selectedMaterials = selectedParams(query.material);
    const typeOptions = facetOptions(allListings, (l) => l.type.slug, (slug) => allListings.find((l) => l.type.slug === slug)?.type.name ?? slug);
    const materialOptions = facetOptions(allListings, (l) => materialFamily(l.material));

    const prices = allListings.map((l) => l.price).filter((p): p is number => p != null);
    const priceBounds = prices.reduce(
      (acc, p) => ({ min: Math.min(acc.min, p), max: Math.max(acc.max, p) }),
      { min: prices[0] ?? 0, max: prices[0] ?? 0 }
    );
    const priceMinParam = firstParam(query.pretMin);
    const priceMaxParam = firstParam(query.pretMax);
    const priceMin = Number(priceMinParam) || priceBounds.min;
    const priceMax = Number(priceMaxParam) || 100_000;
    const priceFilterActive = priceMinParam !== undefined || priceMaxParam !== undefined;

    const listings = allListings.filter((l) => {
      if (selectedTypes.length > 0 && !selectedTypes.includes(l.type.slug)) return false;
      if (selectedMaterials.length > 0 && !selectedMaterials.includes(materialFamily(l.material))) return false;
      if (priceFilterActive && (l.price == null || l.price < priceMin || l.price > priceMax)) return false;
      return true;
    });

    return (
      <main className="bg-background">
        <Breadcrumb />
        <section className="bg-background pt-2 pb-10 sm:py-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <DivisionTabs active={division} />

            <div className="flex flex-col lg:flex-row gap-8 items-start">
              <DivisionFilterSidebar
                groups={[
                  { title: "Tip", paramKey: "tip", options: typeOptions },
                  { title: "Material", paramKey: "material", options: materialOptions },
                ]}
                priceRange={
                  priceBounds.max > priceBounds.min
                    ? { title: "Preț", paramKeyMin: "pretMin", paramKeyMax: "pretMax", min: priceBounds.min, max: priceBounds.max, absoluteMax: 100_000 }
                    : undefined
                }
              />

              <div className="flex-1 min-w-0">
                {listings.length > 0 ? (
                  <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
                    {listings.map((listing) => (
                      <FurnitureCard key={listing.slug} listing={listing} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16 bg-card border border-border rounded-2xl">
                    <p className="text-muted-foreground">Momentan nu există lucrări disponibile în această categorie.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>
    );
  }

  // ── CHIRIE ──────────────────────────────────────────────────────────
  if (division === "chirie") {
    const allListings = await getSpaceListings();

    const selectedTypes = selectedParams(query.tip);
    const selectedZones = selectedParams(query.zona);
    const selectedAreas = selectedParams(query.suprafata) as AreaBucket[];
    const typeOptions = facetOptions(allListings, (l) => l.type.slug, (slug) => allListings.find((l) => l.type.slug === slug)?.type.name ?? slug);
    const zoneOptions = facetOptions(allListings, (l) => zoneLabel(l.location));
    const areaOptions = facetOptions(allListings, (l) => areaBucket(l.area), (v) => AREA_BUCKET_LABELS[v as AreaBucket]);

    const prices = allListings.map((l) => l.price).filter((p): p is number => p != null);
    const priceBounds = prices.reduce(
      (acc, p) => ({ min: Math.min(acc.min, p), max: Math.max(acc.max, p) }),
      { min: prices[0] ?? 0, max: prices[0] ?? 0 }
    );
    const priceMinParam = firstParam(query.pretMin);
    const priceMaxParam = firstParam(query.pretMax);
    const priceMin = Number(priceMinParam) || priceBounds.min;
    const priceMax = Number(priceMaxParam) || 100_000;
    const priceFilterActive = priceMinParam !== undefined || priceMaxParam !== undefined;

    const listings = allListings.filter((l) => {
      if (selectedTypes.length > 0 && !selectedTypes.includes(l.type.slug)) return false;
      if (selectedZones.length > 0 && !selectedZones.includes(zoneLabel(l.location))) return false;
      if (selectedAreas.length > 0 && !selectedAreas.includes(areaBucket(l.area))) return false;
      if (priceFilterActive && (l.price == null || l.price < priceMin || l.price > priceMax)) return false;
      return true;
    });

    return (
      <main className="bg-background">
        <Breadcrumb />
        <section className="bg-background pt-2 pb-10 sm:py-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <DivisionTabs active={division} />

            <div className="flex flex-col lg:flex-row gap-8 items-start">
              <DivisionFilterSidebar
                groups={[
                  { title: "Tip", paramKey: "tip", options: typeOptions },
                  { title: "Zonă", paramKey: "zona", options: zoneOptions },
                  { title: "Suprafață", paramKey: "suprafata", options: areaOptions },
                ]}
                priceRange={
                  priceBounds.max > priceBounds.min
                    ? { title: "Preț", paramKeyMin: "pretMin", paramKeyMax: "pretMax", min: priceBounds.min, max: priceBounds.max, unit: "€", absoluteMax: 5000 }
                    : undefined
                }
              />

              <div className="flex-1 min-w-0">
                {listings.length > 0 ? (
                  <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
                    {listings.map((listing) => (
                      <SpaceCard key={listing.slug} listing={listing} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16 bg-card border border-border rounded-2xl">
                    <p className="text-muted-foreground">Momentan nu există spații disponibile în această categorie.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>
    );
  }

  // ── PRODUSE DE UZ CASNIC (implicit) ──────────────────────────────────
  const sort = parseSort(query.sort);
  const page = parsePage(query.page);
  const filters = parseFilters(query);

  const { categories, products: baseProducts } = await getData();

  const categoryById = new Map(categories.map((c) => [c.id, c.slug]));
  const categoryNameById = new Map(categories.map((c) => [c.id, c.name]));
  const products = applyFilters(
    baseProducts,
    filters,
    (p) => categoryById.get(p.categoryId) ?? "",
    (p) => `${categoryNameById.get(p.categoryId) ?? ""} ${p.id} ${p.id.slice(-6)}`
  );

  const categoryOptions = categories.map((cat) => ({
    id: cat.id,
    slug: cat.slug,
    name: cat.name,
    count: baseProducts.filter((p) => p.categoryId === cat.id).length,
  }));

  const priceBounds = baseProducts.reduce(
    (acc, p) => ({ min: Math.min(acc.min, p.price), max: Math.max(acc.max, p.price) }),
    { min: baseProducts[0]?.price ?? 0, max: baseProducts[0]?.price ?? 0 }
  );

  // Brand counts are "optimistic": computed against every other active filter
  // except the brand filter itself, so picking one brand doesn't hide the rest.
  const productsForBrandFacet = applyFilters(
    baseProducts,
    { ...filters, brands: [] },
    (p) => categoryById.get(p.categoryId) ?? "",
    (p) => categoryNameById.get(p.categoryId) ?? ""
  );
  const brandOptions = Array.from(new Set(baseProducts.map((p) => p.brand).filter((v): v is string => Boolean(v))))
    .map((value) => ({ value, count: productsForBrandFacet.filter((p) => p.brand === value).length }))
    .filter((opt) => opt.count > 0)
    .sort((a, b) => {
      const aKnown = KNOWN_BRANDS.includes(a.value);
      const bKnown = KNOWN_BRANDS.includes(b.value);
      if (aKnown !== bKnown) return aKnown ? -1 : 1;
      return a.value.localeCompare(b.value);
    });

  const offersCount = baseProducts.filter((p) => p.oldPrice != null).length;

  const sorted = sortProducts(products, sort);
  const { items, page: currentPage, hasMore } = paginate(sorted, page);

  return (
    <main className="bg-background">
      <Breadcrumb />

      {/* ── PRODUCTS GRID ── */}
      <section className="bg-background pt-2 pb-10 sm:py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <DivisionTabs active={division} />
          <h1 className="text-2xl sm:text-3xl font-bold text-primary tracking-tight mb-4 sm:mb-6">Produse de uz casnic</h1>
          <div className="flex flex-col lg:flex-row gap-8 items-start">
            <ProductFilterSidebar
              sort={sort}
              categories={categoryOptions}
              brands={brandOptions}
              priceBounds={priceBounds}
              offersCount={offersCount}
            />

            <div className="flex-1 min-w-0">
              {filters.query ? (
                <p className="text-sm text-muted-foreground mb-3 sm:mb-6">
                  {products.length} rezultate pentru <span className="font-bold text-primary">&ldquo;{filters.query}&rdquo;</span>
                </p>
              ) : (
                <p className="text-sm text-muted-foreground mb-3 sm:mb-6">{products.length} produse găsite</p>
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
                      installmentsEnabled={ratesEnabled && product.installmentsEnabled !== false}
                      installmentMonths={installmentMonths}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 bg-card border border-border rounded-2xl">
                  <p className="text-muted-foreground">
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
