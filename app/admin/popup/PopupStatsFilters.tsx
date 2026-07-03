"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Search, ChevronDown } from "lucide-react";

interface CategoryOption {
  id: string;
  name: string;
}

export default function PopupStatsFilters({ categories }: { categories: CategoryOption[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("statQ") ?? "");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    params.delete("statPage");
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  }

  function onSearchChange(value: string) {
    setSearch(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => updateParam("statQ", value.trim()), 400);
  }

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  return (
    <div className="flex items-center gap-3 mb-4 flex-wrap">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden />
        <label className="sr-only" htmlFor="popup-stat-search">
          Caută după nume produs
        </label>
        <input
          id="popup-stat-search"
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Caută după nume produs..."
          className="text-sm font-semibold text-foreground border-2 border-input rounded-xl pl-9 pr-3 py-2 focus-visible:outline-none focus-visible:border-accent focus-visible:ring-3 focus-visible:ring-accent/20 bg-card w-64 transition-colors"
        />
      </div>

      <div className="relative">
        <label className="sr-only" htmlFor="popup-stat-category">
          Filtrează după categorie
        </label>
        <select
          id="popup-stat-category"
          defaultValue={searchParams.get("statCat") ?? ""}
          onChange={(e) => updateParam("statCat", e.target.value)}
          className="appearance-none text-sm font-semibold text-muted-foreground border-2 border-input rounded-xl pl-3 pr-9 py-2 focus-visible:outline-none focus-visible:border-accent focus-visible:ring-3 focus-visible:ring-accent/20 bg-card transition-colors"
        >
          <option value="">Toate categoriile</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden />
      </div>
    </div>
  );
}
