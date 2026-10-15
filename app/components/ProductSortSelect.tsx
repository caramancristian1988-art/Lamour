"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useProductsNavigate } from "./ProductsNav";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/app/components/ui/select";

const options = [
  { value: "newest", label: "Cele mai noi" },
  { value: "price-asc", label: "Preț crescător" },
  { value: "price-desc", label: "Preț descrescător" },
  { value: "rating", label: "Cele mai populare" },
];

export default function ProductSortSelect({ defaultValue }: { defaultValue: string }) {
  const navigate = useProductsNavigate();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function handleChange(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("sort", value);
    params.delete("page");
    const qs = params.toString();
    navigate(qs ? `${pathname}?${qs}` : pathname);
  }

  return (
    <Select defaultValue={defaultValue} onValueChange={handleChange}>
      <SelectTrigger aria-label="Sortează produsele" className="h-10 text-sm">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {options.map((opt) => (
          <SelectItem key={opt.value} value={opt.value}>
            {opt.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
