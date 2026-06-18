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
  technologies: string[];
  energyClasses: string[];
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
    technologies: parseList(query.tehnologie),
    energyClasses: parseList(query.energie),
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
  technology: string;
  energyClass: string | null;
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
  conditoner: ["conditioner"],
  condiționer: ["conditioner"],
  kondiționer: ["conditioner"],
  klimatizor: ["conditioner", "climatizare"],
  climatizor: ["conditioner", "climatizare"],
  "aer conditionat": ["conditioner"],
  "aer condiționat": ["conditioner"],
  кондиционер: ["conditioner"],
  кондюк: ["conditioner"],
  сплит: ["split", "conditioner"],
  мультисплит: ["multisplit"],
  переносной: ["portabil"],
  портативный: ["portabil"],
  коммерческий: ["comercial"],
  жилой: ["rezidential"],
  инвертор: ["inverter"],
  kondicioner: ["conditioner"],
  kondisioner: ["conditioner"],
  kondicioneri: ["conditioner"],
  split: ["split"],
  "multi split": ["multisplit"],
  multisplit: ["multisplit"],
  portativ: ["portabil"],
  portativnii: ["portabil"],
  portabil: ["portabil"],
  komercheskii: ["comercial"],
  comercial: ["comercial"],
  rezidential: ["rezidential"],
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
  if (filters.technologies.length > 0) {
    result = result.filter((p) => filters.technologies.includes(p.technology));
  }
  if (filters.energyClasses.length > 0) {
    result = result.filter((p) => p.energyClass && filters.energyClasses.includes(p.energyClass));
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
    filters.technologies.length > 0 ||
    filters.energyClasses.length > 0 ||
    filters.brands.length > 0 ||
    filters.priceMin !== null ||
    filters.priceMax !== null ||
    filters.offersOnly ||
    filters.query.length > 0
  );
}
