export type SortKey = "newest" | "price-asc" | "price-desc" | "rating";

interface SortableProduct {
  price: number;
  rating: number;
  reviewCount: number;
  createdAt: Date;
}

export function sortProducts<T extends SortableProduct>(products: T[], sort: SortKey): T[] {
  const sorted = [...products];
  switch (sort) {
    case "price-asc":
      return sorted.sort((a, b) => a.price - b.price);
    case "price-desc":
      return sorted.sort((a, b) => b.price - a.price);
    case "rating":
      return sorted.sort((a, b) => b.rating - a.rating || b.reviewCount - a.reviewCount);
    default:
      return sorted.sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
  }
}

export const PRODUCTS_PER_PAGE = 12;

export function paginate<T>(items: T[], page: number, perPage = PRODUCTS_PER_PAGE) {
  const totalPages = Math.max(1, Math.ceil(items.length / perPage));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const start = (safePage - 1) * perPage;
  return {
    items: items.slice(start, start + perPage),
    page: safePage,
    totalPages,
  };
}

export function parseSort(value: string | string[] | undefined): SortKey {
  const v = Array.isArray(value) ? value[0] : value;
  if (v === "price-asc" || v === "price-desc" || v === "rating") return v;
  return "newest";
}

export function parsePage(value: string | string[] | undefined): number {
  const v = Array.isArray(value) ? value[0] : value;
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : 1;
}
