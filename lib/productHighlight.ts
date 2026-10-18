// Etichetele „speciale" de pe cardurile de produs (Best seller, Popular, Nou, De sezon, Foarte util).
// Alegerea ține de admin (câmpul „Etichetă specială" din produs); cât timp e pe „Automat", se aplică doar reguli bazate pe date REALE:
//  - Best seller: cel puțin 10 vânzări confirmate (același prag de la care numărul de vânzări devine vizibil pe site);
//  - Nou: bifat „Produs nou" în admin, sau adăugat în ultimele 30 de zile;
//  - Popular: cel puțin 3 vânzări confirmate;
//  - Toamnă (eticheta „De sezon"): produsele din categoriile de sezon de mai jos (greble, borcane și capace pentru conserve, mături, lădițe, găleți).
// „Foarte util" se pune doar manual. Nu se inventează „best seller" fără vânzări.

export type HighlightKind = "bestseller" | "popular" | "nou" | "sezon" | "util";

export const HIGHLIGHT_LABELS: Record<HighlightKind, string> = {
  bestseller: "Best seller",
  popular: "Popular",
  nou: "Nou",
  sezon: "Toamnă",
  util: "Foarte util",
};

/** Valorile din câmpul „Etichetă specială" a produsului (gol = automat, „none" = fără etichetă). */
export const HIGHLIGHT_OPTIONS: { value: string; label: string }[] = [
  { value: "", label: "Automat (după vânzări, dată și categorie)" },
  { value: "none", label: "Fără etichetă" },
  { value: "bestseller", label: "Best seller" },
  { value: "popular", label: "Popular" },
  { value: "nou", label: "Nou" },
  { value: "sezon", label: "Toamnă (frunză de stejar)" },
  { value: "util", label: "Foarte util" },
];

export const SEASONAL_CATEGORY_SLUGS = ["greble", "capace-de-conservat-metal-plastic", "borcane-din-plastic", "maturi", "ladite", "galeti"];

const SEASONAL_NAME_PATTERN = /conserv|twist[\s\-–]*of/i;

const BESTSELLER_MIN_SALES = 10;
const POPULAR_MIN_SALES = 3;
const NEW_DAYS = 30;

export function isHighlightKind(value: string | null | undefined): value is HighlightKind {
  return value === "bestseller" || value === "popular" || value === "nou" || value === "sezon" || value === "util";
}

export function resolveHighlight(
  p: {
    name?: string | null;
    highlight?: string | null;
    isNewProduct?: boolean | null;
    salesCount?: number | null;
    createdAt?: Date | string | number | null;
    /** Slug-ul categoriei de la rădăcină (părintele, dacă produsul e într-o subcategorie). */
    rootCategorySlug?: string | null;
  },
  now: number = Date.now()
): HighlightKind | null {
  if (p.highlight === "none") return null;
  if (isHighlightKind(p.highlight)) return p.highlight;

  const sales = p.salesCount ?? 0;
  if (sales >= BESTSELLER_MIN_SALES) return "bestseller";
  const created = p.createdAt ? +new Date(p.createdAt) : null;
  if (p.isNewProduct === true || (created !== null && now - created < NEW_DAYS * 86_400_000)) return "nou";
  if (sales >= POPULAR_MIN_SALES) return "popular";
  if (p.rootCategorySlug && SEASONAL_CATEGORY_SLUGS.includes(p.rootCategorySlug)) return "sezon";
  // și după nume: capacele / borcanele pentru conserve sunt de toamnă chiar dacă produsul stă în altă categorie (ex. „Alte produse")
  if (p.name && SEASONAL_NAME_PATTERN.test(p.name)) return "sezon";
  return null;
}

/** id categorie -> slug-ul categoriei de la rădăcină (un produs din „Hârtie igienică în 3 straturi" se numără la „Hârtie igienică"). */
export function rootSlugById(categories: { id: string; slug: string; parentId: string | null }[]): Map<string, string> {
  const byId = new Map(categories.map((c) => [c.id, c]));
  const out = new Map<string, string>();
  for (const c of categories) {
    let cur = c;
    for (let i = 0; i < 5 && cur.parentId && byId.get(cur.parentId); i++) cur = byId.get(cur.parentId)!;
    out.set(c.id, cur.slug);
  }
  return out;
}
