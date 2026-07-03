"use client";

import { useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { SlidersHorizontal, X } from "lucide-react";
import { type SortKey } from "@/lib/productListing";
import ProductSortSelect from "./ProductSortSelect";
import PriceRangeSlider from "./PriceRangeSlider";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/app/components/ui/sheet";
import { Checkbox } from "@/app/components/ui/checkbox";
import { Button } from "@/app/components/ui/button";
import { Badge } from "@/app/components/ui/badge";

interface CategoryOption {
  id: string;
  slug: string;
  name: string;
  count: number;
}

interface EnergyOption {
  value: string;
  count: number;
}

interface TechnologyOption {
  value: string;
  count: number;
}

interface BrandOption {
  value: string;
  count: number;
}

interface PriceBounds {
  min: number;
  max: number;
}

interface Props {
  sort: SortKey;
  categories?: CategoryOption[];
  technologies: TechnologyOption[];
  energyClasses: EnergyOption[];
  brands: BrandOption[];
  priceBounds: PriceBounds;
  offersCount: number;
}

function FilterGroup({
  title,
  options,
  selected,
  paramKey,
  formatLabel,
  onToggle,
}: {
  title: string;
  options: { value: string; count: number }[];
  selected: string[];
  paramKey: string;
  formatLabel?: (value: string) => string;
  onToggle: (key: string, value: string) => void;
}) {
  if (options.length === 0) return null;
  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-wide text-primary mb-3">{title}</p>
      <div className="flex flex-col gap-3">
        {options.map((opt) => {
          const id = `${paramKey}-${opt.value}`;
          return (
            <label key={opt.value} htmlFor={id} className="flex items-center justify-between gap-2 text-sm text-foreground cursor-pointer hover:text-accent">
              <span className="flex items-center gap-2.5">
                <Checkbox id={id} checked={selected.includes(opt.value)} onCheckedChange={() => onToggle(paramKey, opt.value)} />
                {formatLabel ? formatLabel(opt.value) : opt.value}
              </span>
              <span className="text-xs text-muted-foreground">({opt.count})</span>
            </label>
          );
        })}
      </div>
    </div>
  );
}

export default function ProductFilterSidebar({ sort, categories, technologies, energyClasses, brands, priceBounds, offersCount }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [mobileOpen, setMobileOpen] = useState(false);

  const selectedCats = searchParams.get("cat")?.split(",").filter(Boolean) ?? [];
  const selectedTechnologies = searchParams.get("tehnologie")?.split(",").filter(Boolean) ?? [];
  const selectedEnergy = searchParams.get("energie")?.split(",").filter(Boolean) ?? [];
  const selectedBrands = searchParams.get("brand")?.split(",").filter(Boolean) ?? [];
  const PRICE_ABSOLUTE_MAX = 200_000;
  const priceMin = Number(searchParams.get("pretMin")) || priceBounds.min;
  const priceMax = Number(searchParams.get("pretMax")) || PRICE_ABSOLUTE_MAX;
  const priceFilterActive = searchParams.has("pretMin") || searchParams.has("pretMax");
  const offersOnly = searchParams.get("oferte") === "1";

  function go(params: URLSearchParams) {
    params.delete("page");
    const qs = params.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }

  function toggleListParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    const current = params.get(key)?.split(",").filter(Boolean) ?? [];
    const next = current.includes(value) ? current.filter((v) => v !== value) : [...current, value];
    if (next.length > 0) params.set(key, next.join(",")); else params.delete(key);
    go(params);
  }

  function toggleBoolParam(key: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (params.get(key) === "1") params.delete(key); else params.set(key, "1");
    go(params);
  }

  function setPriceRange(min: number, max: number) {
    const params = new URLSearchParams(searchParams.toString());
    if (min <= priceBounds.min) params.delete("pretMin"); else params.set("pretMin", String(Math.round(min)));
    if (max >= PRICE_ABSOLUTE_MAX) params.delete("pretMax"); else params.set("pretMax", String(Math.round(max)));
    go(params);
  }

  function removeListValue(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    const current = params.get(key)?.split(",").filter(Boolean) ?? [];
    const next = current.filter((v) => v !== value);
    if (next.length > 0) params.set(key, next.join(",")); else params.delete(key);
    go(params);
  }

  function removeParam(key: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.delete(key);
    go(params);
  }

  function clearAll() {
    const params = new URLSearchParams(searchParams.toString());
    ["cat", "tehnologie", "energie", "brand", "pretMin", "pretMax", "oferte"].forEach((k) => params.delete(k));
    go(params);
  }

  const activeChips: { key: string; label: string; onRemove: () => void }[] = [];
  if (categories) {
    selectedCats.forEach((slug) => {
      const cat = categories.find((c) => c.slug === slug);
      if (cat) activeChips.push({ key: `cat-${slug}`, label: cat.name, onRemove: () => removeListValue("cat", slug) });
    });
  }
  selectedTechnologies.forEach((val) =>
    activeChips.push({ key: `tehnologie-${val}`, label: val, onRemove: () => removeListValue("tehnologie", val) })
  );
  selectedEnergy.forEach((val) =>
    activeChips.push({ key: `energie-${val}`, label: `Clasa ${val}`, onRemove: () => removeListValue("energie", val) })
  );
  selectedBrands.forEach((val) =>
    activeChips.push({ key: `brand-${val}`, label: val, onRemove: () => removeListValue("brand", val) })
  );
  if (priceFilterActive) {
    activeChips.push({
      key: "pret",
      label: `${Math.round(priceMin).toLocaleString("ro-MD")} - ${Math.round(priceMax).toLocaleString("ro-MD")} MDL`,
      onRemove: () => {
        const params = new URLSearchParams(searchParams.toString());
        params.delete("pretMin");
        params.delete("pretMax");
        go(params);
      },
    });
  }
  if (offersOnly) activeChips.push({ key: "oferte", label: "Oferte speciale", onRemove: () => removeParam("oferte") });

  const hasActive = activeChips.length > 0;

  const sidebarContent = (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-xs font-bold uppercase tracking-wide text-primary mb-3">Sortează după</p>
        <ProductSortSelect defaultValue={sort} />
      </div>

      {priceBounds.max > priceBounds.min && (
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-primary mb-3">Preț</p>
          <PriceRangeSlider min={priceBounds.min} max={priceBounds.max} selectedMin={priceMin} selectedMax={priceMax} onCommit={setPriceRange} />
        </div>
      )}

      {offersCount > 0 && (
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-primary mb-3">Oferte</p>
          <label htmlFor="filter-oferte" className="flex items-center justify-between gap-2 text-sm text-foreground cursor-pointer hover:text-accent">
            <span className="flex items-center gap-2.5">
              <Checkbox id="filter-oferte" checked={offersOnly} onCheckedChange={() => toggleBoolParam("oferte")} />
              Oferte speciale
            </span>
            <span className="text-xs text-muted-foreground">({offersCount})</span>
          </label>
        </div>
      )}

      {hasActive && (
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-primary mb-3">Filtre active</p>
          <div className="flex flex-col gap-2 mb-3">
            {activeChips.map((chip) => (
              <Badge key={chip.key} variant="outline" className="w-full justify-between normal-case font-semibold text-primary">
                {chip.label}
                <button onClick={chip.onRemove} aria-label={`Elimină filtrul ${chip.label}`} className="text-muted-foreground hover:text-accent transition-colors shrink-0">
                  <X className="w-3.5 h-3.5" aria-hidden />
                </button>
              </Badge>
            ))}
          </div>
          <Button onClick={clearAll} variant="primary" size="sm" className="w-full">
            Șterge tot
          </Button>
        </div>
      )}

      {categories && categories.length > 0 && (
        <FilterGroup
          title="Categorie"
          options={categories.map((c) => ({ value: c.slug, count: c.count }))}
          selected={selectedCats}
          paramKey="cat"
          formatLabel={(slug) => categories.find((c) => c.slug === slug)?.name ?? slug}
          onToggle={toggleListParam}
        />
      )}
      <FilterGroup title="Brand" options={brands} selected={selectedBrands} paramKey="brand" onToggle={toggleListParam} />
      <FilterGroup title="Tehnologie" options={technologies} selected={selectedTechnologies} paramKey="tehnologie" onToggle={toggleListParam} />
      <FilterGroup title="Clasă energetică" options={energyClasses} selected={selectedEnergy} paramKey="energie" formatLabel={(v) => `Clasa ${v}`} onToggle={toggleListParam} />
    </div>
  );

  return (
    <>
      <div className="lg:hidden mb-3">
        <Button onClick={() => setMobileOpen(true)} variant="outline" size="sm" className="gap-2">
          <SlidersHorizontal className="w-4 h-4" aria-hidden />
          Filtre {hasActive && `(${activeChips.length})`}
        </Button>
      </div>

      <aside className="hidden lg:block w-64 shrink-0">{sidebarContent}</aside>

      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="lg:hidden overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Filtre</SheetTitle>
          </SheetHeader>
          {sidebarContent}
        </SheetContent>
      </Sheet>
    </>
  );
}
