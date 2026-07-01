"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { type SortKey } from "@/lib/productListing";
import ProductSortSelect from "./ProductSortSelect";
import PriceRangeSlider from "./PriceRangeSlider";

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

export default function ProductFilterSidebar({ sort, categories, technologies, energyClasses, brands, priceBounds, offersCount }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [drawerMounted, setDrawerMounted] = useState(false);

  function openDrawer() {
    setDrawerMounted(true);
    requestAnimationFrame(() => requestAnimationFrame(() => setMobileOpen(true)));
  }

  function closeDrawer() {
    setMobileOpen(false);
  }

  useEffect(() => {
    if (!mobileOpen && drawerMounted) {
      const timeout = setTimeout(() => setDrawerMounted(false), 300);
      return () => clearTimeout(timeout);
    }
  }, [mobileOpen, drawerMounted]);

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
        <p className="text-xs font-extrabold uppercase tracking-wide text-[#1d2353] mb-3">Sortează după</p>
        <ProductSortSelect defaultValue={sort} />
      </div>

      {priceBounds.max > priceBounds.min && (
        <div>
          <p className="text-xs font-extrabold uppercase tracking-wide text-[#1d2353] mb-3">Preț</p>
          <PriceRangeSlider
            min={priceBounds.min}
            max={priceBounds.max}
            selectedMin={priceMin}
            selectedMax={priceMax}
            onCommit={setPriceRange}
          />
        </div>
      )}

      {offersCount > 0 && (
        <div>
          <p className="text-xs font-extrabold uppercase tracking-wide text-[#1d2353] mb-3">Oferte</p>
          <label className="flex items-center justify-between gap-2 text-sm text-gray-600 cursor-pointer hover:text-[#1d2353]">
            <span className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={offersOnly}
                onChange={() => toggleBoolParam("oferte")}
                className="w-4 h-4 rounded border-gray-300 text-[#c7092b] focus:ring-[#c7092b] accent-[#c7092b]"
              />
              Oferte speciale
            </span>
            <span className="text-xs text-gray-400">({offersCount})</span>
          </label>
        </div>
      )}

      {hasActive && (
        <div>
          <p className="text-xs font-extrabold uppercase tracking-wide text-[#1d2353] mb-3">Filtre active</p>
          <div className="flex flex-col gap-2 mb-3">
            {activeChips.map((chip) => (
              <span
                key={chip.key}
                className="flex items-center justify-between gap-2 bg-[#f6f8fb] border border-gray-100 rounded-lg px-3 py-2 text-xs font-semibold text-[#1d2353]"
              >
                {chip.label}
                <button onClick={chip.onRemove} aria-label="Elimină filtrul" className="text-gray-400 hover:text-[#c7092b] transition-colors shrink-0">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </span>
            ))}
          </div>
          <button
            onClick={clearAll}
            className="w-full text-xs font-bold bg-[#1d2353] hover:bg-[#2a3470] text-white rounded-lg py-2.5 transition-colors uppercase tracking-wide"
          >
            Șterge tot
          </button>
        </div>
      )}

      {categories && categories.length > 0 && (
        <div>
          <p className="text-xs font-extrabold uppercase tracking-wide text-[#1d2353] mb-3">Categorie</p>
          <div className="flex flex-col gap-2.5">
            {categories.map((cat) => (
              <label key={cat.id} className="flex items-center justify-between gap-2 text-sm text-gray-600 cursor-pointer hover:text-[#1d2353]">
                <span className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={selectedCats.includes(cat.slug)}
                    onChange={() => toggleListParam("cat", cat.slug)}
                    className="w-4 h-4 rounded border-gray-300 text-[#c7092b] focus:ring-[#c7092b] accent-[#c7092b]"
                  />
                  {cat.name}
                </span>
                <span className="text-xs text-gray-400">({cat.count})</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {brands.length > 0 && (
        <div>
          <p className="text-xs font-extrabold uppercase tracking-wide text-[#1d2353] mb-3">Brand</p>
          <div className="flex flex-col gap-2.5">
            {brands.map((opt) => (
              <label key={opt.value} className="flex items-center justify-between gap-2 text-sm text-gray-600 cursor-pointer hover:text-[#1d2353]">
                <span className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={selectedBrands.includes(opt.value)}
                    onChange={() => toggleListParam("brand", opt.value)}
                    className="w-4 h-4 rounded border-gray-300 text-[#c7092b] focus:ring-[#c7092b] accent-[#c7092b]"
                  />
                  {opt.value}
                </span>
                <span className="text-xs text-gray-400">({opt.count})</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {technologies.length > 0 && (
        <div>
          <p className="text-xs font-extrabold uppercase tracking-wide text-[#1d2353] mb-3">Tehnologie</p>
          <div className="flex flex-col gap-2.5">
            {technologies.map((opt) => (
              <label key={opt.value} className="flex items-center justify-between gap-2 text-sm text-gray-600 cursor-pointer hover:text-[#1d2353]">
                <span className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={selectedTechnologies.includes(opt.value)}
                    onChange={() => toggleListParam("tehnologie", opt.value)}
                    className="w-4 h-4 rounded border-gray-300 text-[#c7092b] focus:ring-[#c7092b] accent-[#c7092b]"
                  />
                  {opt.value}
                </span>
                <span className="text-xs text-gray-400">({opt.count})</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {energyClasses.length > 0 && (
        <div>
          <p className="text-xs font-extrabold uppercase tracking-wide text-[#1d2353] mb-3">Clasă energetică</p>
          <div className="flex flex-col gap-2.5">
            {energyClasses.map((opt) => (
              <label key={opt.value} className="flex items-center justify-between gap-2 text-sm text-gray-600 cursor-pointer hover:text-[#1d2353]">
                <span className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={selectedEnergy.includes(opt.value)}
                    onChange={() => toggleListParam("energie", opt.value)}
                    className="w-4 h-4 rounded border-gray-300 text-[#c7092b] focus:ring-[#c7092b] accent-[#c7092b]"
                  />
                  Clasa {opt.value}
                </span>
                <span className="text-xs text-gray-400">({opt.count})</span>
              </label>
            ))}
          </div>
        </div>
      )}

    </div>
  );

  return (
    <>
      {/* Mobile trigger */}
      <div className="lg:hidden mb-3">
        <button
          onClick={openDrawer}
          className="flex items-center gap-2 text-xs font-bold border border-gray-200 rounded-full px-4 py-2.5 text-[#1d2353] transition-transform active:scale-95"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 4h18M6 12h12M10 20h4" />
          </svg>
          Filtre {hasActive && `(${activeChips.length})`}
        </button>
      </div>

      {/* Desktop sidebar */}
      <aside className="hidden lg:block w-64 shrink-0">{sidebarContent}</aside>

      {/* Mobile drawer */}
      {drawerMounted && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div
            className={`absolute inset-0 bg-white transition-transform duration-300 ease-out p-5 overflow-y-auto ${
              mobileOpen ? "translate-x-0" : "-translate-x-full"
            }`}
          >
            <div className="flex items-center justify-between mb-5">
              <p className="font-extrabold text-[#1d2353]">Filtre</p>
              <button
                onClick={closeDrawer}
                aria-label="Închide filtrele"
                className="group text-gray-400 hover:text-[#c7092b] transition-colors"
              >
                <svg
                  className="w-5 h-5 transition-transform duration-300 group-hover:rotate-90"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
