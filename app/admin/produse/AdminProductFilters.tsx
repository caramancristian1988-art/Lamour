"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Search, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface CategoryOption {
  id: string;
  name: string;
}

const selectClassName =
  "appearance-none text-sm font-semibold text-muted-foreground border-2 border-input rounded-xl pl-3 pr-9 py-2 focus-visible:outline-none focus-visible:border-accent focus-visible:ring-3 focus-visible:ring-accent/20 bg-card transition-colors";

export default function AdminProductFilters({ categories }: { categories: CategoryOption[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("q") ?? "");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  }

  function onSearchChange(value: string) {
    setSearch(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => updateParam("q", value.trim()), 400);
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
        <label className="sr-only" htmlFor="product-search">
          Caută produse
        </label>
        <input
          id="product-search"
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Caută după nume, ID sau brand..."
          className="text-sm font-semibold text-foreground border-2 border-input rounded-xl pl-9 pr-3 py-2 focus-visible:outline-none focus-visible:border-accent focus-visible:ring-3 focus-visible:ring-accent/20 bg-card w-64 transition-colors"
        />
      </div>

      <div className="relative">
        <label className="sr-only" htmlFor="product-category-filter">
          Filtrează după categorie
        </label>
        <select
          id="product-category-filter"
          defaultValue={searchParams.get("cat") ?? ""}
          onChange={(e) => updateParam("cat", e.target.value)}
          className={cn(selectClassName)}
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

      <div className="relative">
        <label className="sr-only" htmlFor="product-sort">
          Sortează produsele
        </label>
        <select
          id="product-sort"
          defaultValue={searchParams.get("sort") ?? "newest"}
          onChange={(e) => updateParam("sort", e.target.value)}
          className={cn(selectClassName)}
        >
          <option value="newest">Cele mai noi</option>
          <option value="name-asc">Nume (A-Z)</option>
          <option value="price-asc">Preț crescător</option>
          <option value="price-desc">Preț descrescător</option>
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden />
      </div>
    </div>
  );
}
