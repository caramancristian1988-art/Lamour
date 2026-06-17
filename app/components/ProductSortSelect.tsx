"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";

const options = [
  { value: "newest", label: "Cele mai noi" },
  { value: "price-asc", label: "Preț crescător" },
  { value: "price-desc", label: "Preț descrescător" },
  { value: "rating", label: "Cele mai populare" },
];

export default function ProductSortSelect({ defaultValue }: { defaultValue: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("sort", e.target.value);
    params.delete("page");
    const qs = params.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
  }

  return (
    <select
      defaultValue={defaultValue}
      onChange={handleChange}
      className="w-full text-xs font-semibold text-gray-600 border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-[#1d2353] bg-white"
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}
