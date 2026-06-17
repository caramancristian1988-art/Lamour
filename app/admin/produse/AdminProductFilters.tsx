"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";

interface CategoryOption {
  id: string;
  name: string;
}

export default function AdminProductFilters({ categories }: { categories: CategoryOption[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="flex items-center gap-3 mb-4 flex-wrap">
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
