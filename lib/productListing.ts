export type SortKey = "newest" | "price-asc" | "price-desc" | "rating";

// A product that has variant siblings already shows its size/quantity via
// the pill selector, so the raw trailing "1L" / "2 role" etc. baked into the
// name is redundant clutter on the title — strip it there, keep the full
// name everywhere else (cart, favorites, "Cod produs" etc. stay exact).
export function stripVariantSuffix(name: string, variantLabel: string | null): string {
  if (!variantLabel) return name;
  const trimmedLabel = variantLabel.trim();
  if (!trimmedLabel) return name;
  const idx = name.toLowerCase().lastIndexOf(trimmedLabel.toLowerCase());
  if (idx === -1 || idx + trimmedLabel.length !== name.length) return name;
  return name.slice(0, idx).replace(/[\s,;.-]+$/, "").trim() || name;
}

// Products that are just a size/quantity variant of another product
// (variantGroupId set) are hidden from grids/listings — only the primary
// variant shows as a card, with the rest reachable via its own selector.
export function dedupeVariants<T extends { variantGroupId?: string | null }>(products: T[]): T[] {
  return products.filter((p) => !p.variantGroupId);
}

// Maps a primary product's id to its full variant family (itself + siblings),
// so cards for that primary can show a compact size/quantity pill row.
export interface VariantOption {
  slug: string;
  variantLabel: string | null;
  price: number;
  oldPrice: number | null;
}

export function buildVariantOptionsMap<
  T extends {
    id: string;
    slug: string;
    variantGroupId?: string | null;
    variantLabel?: string | null;
    price: number;
    oldPrice?: number | null;
  }
>(products: T[]): Map<string, VariantOption[]> {
  const map = new Map<string, VariantOption[]>();
  for (const p of products) {
    const primaryId = p.variantGroupId ?? p.id;
    if (!map.has(primaryId)) map.set(primaryId, []);
    map.get(primaryId)!.push({
      slug: p.slug,
      variantLabel: p.variantLabel ?? null,
      price: p.price,
      oldPrice: p.oldPrice ?? null,
    });
  }
  return map;
}

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

export const PRODUCTS_PER_PAGE = 16;

export function paginate<T>(items: T[], page: number, perPage = PRODUCTS_PER_PAGE) {
  const totalPages = Math.max(1, Math.ceil(items.length / perPage));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const end = safePage * perPage;
  return {
    items: items.slice(0, end),
    page: safePage,
    totalPages,
    hasMore: end < items.length,
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

function parseList(value: string | string[] | undefined): string[] {
  const v = Array.isArray(value) ? value[0] : value;
  return v ? v.split(",").filter(Boolean) : [];
}

function parseNumber(value: string | string[] | undefined): number | null {
  const v = Array.isArray(value) ? value[0] : value;
  const n = Number(v);
  return v && Number.isFinite(n) ? n : null;
}

export interface ProductFilters {
  categorySlugs: string[];
  brands: string[];
  priceMin: number | null;
  priceMax: number | null;
  offersOnly: boolean;
  query: string;
}

export function parseFilters(query: { [key: string]: string | string[] | undefined }): ProductFilters {
  const q = Array.isArray(query.q) ? query.q[0] : query.q;
  return {
    categorySlugs: parseList(query.cat),
    brands: parseList(query.brand),
    priceMin: parseNumber(query.pretMin),
    priceMax: parseNumber(query.pretMax),
    offersOnly: query.oferte === "1",
    query: q?.trim() ?? "",
  };
}

interface FilterableProduct {
  name: string;
  price: number;
  oldPrice: number | null;
  brand?: string | null;
}

function normalizeSearchText(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim();
}

// Maps common Moldovan misspellings, colloquial terms, and Russian
// words/transliterations to the canonical (diacritic-stripped) terms
// that actually appear in our category names, so people searching in
// their own words still find matching products.
const SEARCH_SYNONYMS: Record<string, string[]> = {
  "hartie igienica": ["hartie igienica"],
  hirtie: ["hartie"],
  "туалетная бумага": ["hartie igienica"],
  туалетка: ["hartie igienica"],
  servetel: ["servetele"],
  салфетки: ["servetele"],
  "servetele umede": ["servetele umede"],
  "влажные салфетки": ["servetele umede"],
  prosop: ["prosoape"],
  prosoape: ["prosoape"],
  полотенца: ["prosoape"],
  chibrit: ["chibrite"],
  chibrituri: ["chibrite"],
  спички: ["chibrite"],
  mobila: ["mobila"],
  mobilier: ["mobila"],
  мебель: ["mobila"],
  chirie: ["chirie"],
  inchiriere: ["chirie"],
  închiriere: ["chirie"],
  аренда: ["chirie"],
};

function expandSearchTerms(query: string): string[] {
  const normalizedQuery = normalizeSearchText(query);
  const terms = new Set([normalizedQuery]);

  for (const [alias, canonicalTerms] of Object.entries(SEARCH_SYNONYMS)) {
    if (normalizedQuery.includes(alias) || alias.includes(normalizedQuery)) {
      canonicalTerms.forEach((term) => terms.add(term));
    }
  }

  return Array.from(terms);
}

export function applyFilters<T extends FilterableProduct>(
  products: T[],
  filters: ProductFilters,
  getCategorySlug?: (product: T) => string,
  getSearchText?: (product: T) => string
): T[] {
  let result = products;

  if (filters.query) {
    const terms = expandSearchTerms(filters.query);
    result = result.filter((p) => {
      const haystack = normalizeSearchText(`${p.name} ${getSearchText ? getSearchText(p) : ""}`);
      return terms.some((term) => haystack.includes(term));
    });
  }
  if (filters.categorySlugs.length > 0 && getCategorySlug) {
    result = result.filter((p) => filters.categorySlugs.includes(getCategorySlug(p)));
  }
  if (filters.brands.length > 0) {
    result = result.filter((p) => p.brand && filters.brands.includes(p.brand));
  }
  if (filters.priceMin !== null) {
    result = result.filter((p) => p.price >= filters.priceMin!);
  }
  if (filters.priceMax !== null) {
    result = result.filter((p) => p.price <= filters.priceMax!);
  }
  if (filters.offersOnly) {
    result = result.filter((p) => p.oldPrice != null);
  }

  return result;
}

export function hasActiveFilters(filters: ProductFilters): boolean {
  return (
    filters.categorySlugs.length > 0 ||
    filters.brands.length > 0 ||
    filters.priceMin !== null ||
    filters.priceMax !== null ||
    filters.offersOnly ||
    filters.query.length > 0
  );
}
