import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { getSectionFlags } from "@/lib/siteSettings";
import FurnitureCard from "../components/FurnitureCard";
import SpaceCard from "../components/SpaceCard";
import DivisionFilterSidebar from "../components/DivisionFilterSidebar";
import { DivisionTabs, Breadcrumb, type Division } from "../components/CatalogTabs";
import { getFurnitureListings } from "@/lib/mobilaData";
import { getSpaceListings } from "@/lib/spatiiComercialeData";
import JsonLd from "../components/JsonLd";
import { breadcrumbList, collectionPage } from "@/lib/structuredData";
import { absoluteUrl } from "@/lib/seo";

// Galeriile „Mobilă" și „Spații comerciale" din Catalog. Adresa publică rămâne /produse?division=mobila (sau chirie) —
// next.config.ts o rescrie aici. Pagina de produse /produse nu mai citește searchParams, deci e statică (vezi app/produse/page.tsx).
export const metadata: Metadata = {
  title: { absolute: "Catalog | LuminTehnica" },
  alternates: { canonical: absoluteUrl("/produse") },
};

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

export default async function ProduseDiviziiPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { produseEnabled } = await getSectionFlags();
  if (!produseEnabled) notFound();

  const query = await searchParams;
  const divisionParam = firstParam(query.division);
  if (divisionParam !== "mobila" && divisionParam !== "chirie") redirect("/produse");
  const division: Division = divisionParam;

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
      <main className="page-motif">
        <JsonLd data={breadcrumbList([{ name: "Acasă", path: "/" }, { name: "Catalog", path: "/produse" }])} />
        <JsonLd
          data={collectionPage({
            name: "Mobilă la comandă",
            description: "Mobilier personalizat produs în fabrica proprie LuminTehnica.",
            url: "/produse?division=mobila",
            items: listings.map((l) => ({ name: l.title, url: `/mobila/${l.slug}`, image: l.image })),
          })}
        />
        <Breadcrumb />
        <section className="pt-2 pb-10 sm:py-10">
          <div className="max-w-[110rem] mx-auto px-4 sm:px-6">
            <DivisionTabs active={division} />
            <h1 className="sr-only">Mobilă la comandă</h1>

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
                  <div className="grid grid-cols-2 lg:grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-3 sm:gap-6">
                    {listings.map((listing) => (
                      <FurnitureCard key={listing.slug} listing={listing} sizes="(max-width: 1023px) 50vw, 300px" />
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
      <main className="page-motif">
        <JsonLd data={breadcrumbList([{ name: "Acasă", path: "/" }, { name: "Catalog", path: "/produse" }])} />
        <JsonLd
          data={collectionPage({
            name: "Spații disponibile spre închiriere",
            description: "Apartamente, birouri, spații comerciale și depozite oferite spre închiriere de LuminTehnica.",
            url: "/produse?division=chirie",
            items: listings.map((l) => ({ name: l.title, url: `/spatii-comerciale/${l.slug}`, image: l.image })),
          })}
        />
        <Breadcrumb />
        <section className="pt-2 pb-10 sm:py-10">
          <div className="max-w-[110rem] mx-auto px-4 sm:px-6">
            <DivisionTabs active={division} />
            <h1 className="sr-only">Spații disponibile spre închiriere</h1>

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
                  <div className="grid grid-cols-2 lg:grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-3 sm:gap-6">
                    {listings.map((listing) => (
                      <SpaceCard key={listing.slug} listing={listing} sizes="(max-width: 1023px) 50vw, 300px" />
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

  notFound();
}
