"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";

interface CategoryOption {
  id: string;
  name: string;
}

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
    router.push(`${pathname}?${params.toString()}`);
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
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 10.5a6.5 6.5 0 11-13 0 6.5 6.5 0 0113 0z" />
        </svg>
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Caută după nume, ID sau brand..."
          className="text-xs font-semibold text-gray-600 border border-gray-200 rounded-lg pl-9 pr-3 py-2 focus:outline-none focus:border-[#1d2353] bg-white w-64"
        />
      </div>

      <select
        defaultValue={searchParams.get("cat") ?? ""}
        onChange={(e) => updateParam("cat", e.target.value)}
        className="text-xs font-semibold text-gray-600 border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-[#1d2353] bg-white"
      >
        <option value="">Toate categoriile</option>
        {categories.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </select>

      <select
        defaultValue={searchParams.get("sort") ?? "newest"}
        onChange={(e) => updateParam("sort", e.target.value)}
        className="text-xs font-semibold text-gray-600 border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-[#1d2353] bg-white"
      >
        <option value="newest">Cele mai noi</option>
        <option value="name-asc">Nume (A-Z)</option>
        <option value="price-asc">Preț crescător</option>
        <option value="price-desc">Preț descrescător</option>
      </select>
    </div>
  );
}
