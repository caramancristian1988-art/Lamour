"use client";

import { useId, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { useProductsNavigate, usePendingHref } from "./ProductsNav";
import { SlidersHorizontal, X, Plus, Minus } from "lucide-react";
import { type SortKey } from "@/lib/productListing";
import ProductSortSelect from "./ProductSortSelect";
import PriceRangeSlider from "./PriceRangeSlider";
import { Sheet, SheetClose, SheetContent, SheetHeader, SheetTitle } from "@/app/components/ui/sheet";
import { Checkbox } from "@/app/components/ui/checkbox";
import { Button } from "@/app/components/ui/button";
import { Badge } from "@/app/components/ui/badge";

interface CategoryOption {
  id: string;
  slug: string;
  name: string;
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
  brands: BrandOption[];
  priceBounds: PriceBounds;
  offersCount: number;
}

// Grup de filtre pliabil (ca pe pet-house.md): titlu simplu + „−” (restrânge) / „+” (extinde) în dreapta.
// Când e restrâns, opțiunile dispar, dar bifele rămân active — de aceea titlul arată câte filtre sunt bifate.
function FilterSection({
  title,
  activeCount = 0,
  defaultOpen = true,
  children,
}: {
  title: string;
  activeCount?: number;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const panelId = useId();
  return (
    <section>
      <h3>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls={panelId}
          className="group flex w-full items-center justify-between gap-3 rounded-md py-1.5 text-left"
        >
          <span className="flex items-center gap-2 font-sans text-[15px] font-semibold text-foreground">
            {title}
            {!open && activeCount > 0 && (
              <span className="rounded-full bg-accent px-2 py-0.5 text-[11px] font-bold leading-none text-white">{activeCount}</span>
            )}
          </span>
          <span
            aria-hidden
            className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors group-hover:bg-muted group-hover:text-accent"
          >
            {open ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          </span>
          <span className="sr-only">{open ? "Restrânge" : "Extinde"}</span>
        </button>
      </h3>
      <div id={panelId} hidden={!open} className="pt-2">
        {children}
      </div>
    </section>
  );
}

// Listele lungi (categorii, branduri) rămân într-o zonă cu înălțime limitată și derulare proprie, în stilul site-ului,
// ca întreaga coloană de filtre să încapă pe un ecran.
function FilterOptions({
  options,
  selected,
  paramKey,
  formatLabel,
  onToggle,
}: {
  options: { value: string; count: number }[];
  selected: string[];
  paramKey: string;
  formatLabel?: (value: string) => string;
  onToggle: (key: string, value: string) => void;
}) {
  return (
    <div className="scrollbar-brand scroll-hint flex max-h-56 flex-col gap-2.5 overflow-y-auto py-1 pr-3">
      {options.map((opt) => {
        const id = `${paramKey}-${opt.value}`;
        return (
          <label key={opt.value} htmlFor={id} className="flex cursor-pointer items-center justify-between gap-2 text-sm text-foreground hover:text-accent">
            <span className="flex items-center gap-2.5">
              <Checkbox
                className="h-5 w-5 rounded-[5px] border-[1.5px]"
                id={id}
                checked={selected.includes(opt.value)}
                onCheckedChange={() => onToggle(paramKey, opt.value)}
              />
              {formatLabel ? formatLabel(opt.value) : opt.value}
            </span>
            <span className="text-xs text-muted-foreground">({opt.count})</span>
          </label>
        );
      })}
    </div>
  );
}

export default function ProductFilterSidebar({ sort, categories, brands, priceBounds, offersCount }: Props) {
  const navigate = useProductsNavigate();
  const pathname = usePathname();
  const urlParams = useSearchParams();
  const pendingHref = usePendingHref();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Optimist: cât timp se încarcă lista nouă, bifele/prețul/filtrele active se citesc din destinația aleasă, nu din URL-ul
  // vechi — altfel o bifă apăsată se "întorcea" până răspundea serverul, iar două apăsări rapide nu se cumulau.
  const searchParams = pendingHref ? new URLSearchParams(pendingHref.split("?")[1] ?? "") : urlParams;

  const selectedCats = searchParams.get("cat")?.split(",").filter(Boolean) ?? [];
  const selectedBrands = searchParams.get("brand")?.split(",").filter(Boolean) ?? [];
  const PRICE_ABSOLUTE_MAX = 10_000;
  const priceMin = Number(searchParams.get("pretMin")) || priceBounds.min;
  const priceMax = Number(searchParams.get("pretMax")) || PRICE_ABSOLUTE_MAX;
  const priceFilterActive = searchParams.has("pretMin") || searchParams.has("pretMax");
  const offersOnly = searchParams.get("oferte") === "1";

  function go(params: URLSearchParams) {
    params.delete("page");
    const qs = params.toString();
    navigate(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
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
    ["cat", "brand", "pretMin", "pretMax", "oferte"].forEach((k) => params.delete(k));
    go(params);
  }

  const activeChips: { key: string; label: string; onRemove: () => void }[] = [];
  if (categories) {
    selectedCats.forEach((slug) => {
      const cat = categories.find((c) => c.slug === slug);
      if (cat) activeChips.push({ key: `cat-${slug}`, label: cat.name, onRemove: () => removeListValue("cat", slug) });
    });
  }
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
    <div className="flex flex-col gap-5">
      {hasActive && (
        <FilterSection title="Filtre active">
          <div className="mb-3 flex flex-col gap-2">
            {activeChips.map((chip) => (
              <Badge key={chip.key} variant="outline" className="w-full justify-between normal-case font-semibold text-primary">
                {chip.label}
                <button onClick={chip.onRemove} aria-label={`Elimină filtrul ${chip.label}`} className="shrink-0 text-muted-foreground transition-colors hover:text-accent">
                  <X className="h-3.5 w-3.5" aria-hidden />
                </button>
              </Badge>
            ))}
          </div>
          <Button onClick={clearAll} variant="primary" size="sm" className="w-full">
            Șterge tot
          </Button>
        </FilterSection>
      )}

      <FilterSection title="Sortează după">
        <ProductSortSelect defaultValue={sort} />
      </FilterSection>

      {priceBounds.max > priceBounds.min && (
        <FilterSection title="Preț" activeCount={priceFilterActive ? 1 : 0}>
          <PriceRangeSlider min={priceBounds.min} max={priceBounds.max} selectedMin={priceMin} selectedMax={priceMax} onCommit={setPriceRange} />
        </FilterSection>
      )}

      {offersCount > 0 && (
        <FilterSection title="Oferte" activeCount={offersOnly ? 1 : 0}>
          <label htmlFor="filter-oferte" className="flex cursor-pointer items-center justify-between gap-2 text-sm text-foreground hover:text-accent">
            <span className="flex items-center gap-2.5">
              <Checkbox className="h-5 w-5 rounded-[5px] border-[1.5px]" id="filter-oferte" checked={offersOnly} onCheckedChange={() => toggleBoolParam("oferte")} />
              Oferte speciale
            </span>
            <span className="text-xs text-muted-foreground">({offersCount})</span>
          </label>
        </FilterSection>
      )}

      {categories && categories.length > 0 && (
        <FilterSection title="Categorie" activeCount={selectedCats.length}>
          <FilterOptions
            options={categories.map((c) => ({ value: c.slug, count: c.count }))}
            selected={selectedCats}
            paramKey="cat"
            formatLabel={(slug) => categories.find((c) => c.slug === slug)?.name ?? slug}
            onToggle={toggleListParam}
          />
        </FilterSection>
      )}

      {brands.length > 0 && (
        <FilterSection title="Brand" activeCount={selectedBrands.length}>
          <FilterOptions options={brands} selected={selectedBrands} paramKey="brand" onToggle={toggleListParam} />
        </FilterSection>
      )}
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

      {/* Coloana de filtre „merge după noi” la derulare (sticky) și are înălțimea limitată la ecran; dacă tot nu încape,
          se derulează în interior, cu bara de derulare în stilul site-ului. */}
      <aside
        aria-label="Filtre produse"
        className="scrollbar-brand sticky top-4 hidden max-h-[calc(100vh-2rem)] w-64 shrink-0 self-start overflow-y-auto pr-3 lg:block"
      >
        {sidebarContent}
      </aside>

      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        {/* Antet fix + zonă derulabilă separată: butonul X rămâne mereu vizibil (înainte era în zona care se derula și dispărea),
            iar jos rămâne un buton mare pentru a vedea rezultatele. */}
        <SheetContent
          side="left"
          className="lg:hidden gap-0 overflow-hidden p-0"
          closeClassName="right-3 top-3 flex h-11 w-11 items-center justify-center bg-primary text-primary-foreground shadow-md hover:bg-primary hover:text-primary-foreground [&>svg]:h-6 [&>svg]:w-6"
        >
          <SheetHeader className="shrink-0 border-b border-border bg-card px-6 py-4 pr-20">
            <SheetTitle>Filtre</SheetTitle>
          </SheetHeader>
          <div className="scrollbar-brand flex-1 overflow-y-auto px-6 py-5">{sidebarContent}</div>
          <div className="shrink-0 border-t border-border bg-card p-4">
            <SheetClose asChild>
              <Button variant="accent" size="lg" className="w-full">
                Vezi produsele
              </Button>
            </SheetClose>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
