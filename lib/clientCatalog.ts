import { localProductImages, localProductBadges, localProductNames } from "./productOverrides";
import { buildVariantOptionsMap, type VariantOption } from "./productListing";
import type { PriceTier } from "./pricing";
import { resolveHighlight, type HighlightKind } from "./productHighlight";

// Produsul "pe scurt": doar ce au nevoie cardul, filtrele și sortarea. Se trimite o singură dată către browser
// (în pagina statică), iar filtrarea / sortarea / „Încarcă mai multe" se fac apoi acolo, instant, fără apel la server.
// Lipsesc intenționat descrierea, specificațiile, galeria etc. — ar umfla pagina degeaba.
export interface CatalogProduct {
  id: string;
  slug: string;
  name: string;
  price: number;
  oldPrice: number | null;
  image: string | null;
  brand: string | null;
  rating: number;
  reviewCount: number;
  badge: string | null;
  installmentsEnabled: boolean;
  packageQuantity: string | null;
  priceTiers?: PriceTier[];
  bulkMinQty: number | null;
  bulkPrice: number | null;
  categoryId: string;
  /** Milisecunde (numărul se serializează mai ieftin decât un Date și se sortează direct). */
  createdAt: number;
  code: string | null;
  /** Eticheta specială de pe card (Best seller / Popular / Nou / De sezon / Foarte util), calculată pe server. */
  highlight: HighlightKind | null;
}

export interface CatalogCategory {
  id: string;
  slug: string;
  name: string;
  parentId: string | null;
}

interface SourceProduct {
  id: string;
  slug: string;
  name: string;
  price: number;
  oldPrice: number | null;
  image: string | null;
  images?: string[];
  brand: string | null;
  rating: number;
  reviewCount: number;
  badge: string | null;
  installmentsEnabled?: boolean;
  packageQuantity?: string | null;
  priceTiers?: PriceTier[];
  bulkMinQty?: number | null;
  bulkPrice?: number | null;
  categoryId: string;
  createdAt: Date | string | number;
  code?: string | null;
  variantGroupId?: string | null;
  variantLabel?: string | null;
  highlight?: string | null;
  isNewProduct?: boolean | null;
  salesCount?: number | null;
}

// Aceeași alegere pe care o făcea ProductCard: o poză-substituent (placehold.co) nu contează ca poză principală dacă
// există o poză reală în galerie.
function pickImage(image: string | null, images?: string[]): string | null {
  const isPlaceholder = image?.includes("placehold.co") ?? false;
  return (!isPlaceholder && image) || images?.[0] || image || null;
}

export function toCatalogProduct(p: SourceProduct, rootCategorySlug?: string | null): CatalogProduct {
  const name = localProductNames[p.slug] ?? p.name;
  const image = localProductImages[p.slug] ?? pickImage(p.image, p.images);
  return {
    id: p.id,
    slug: p.slug,
    name,
    price: p.price,
    oldPrice: p.oldPrice ?? null,
    image,
    brand: p.brand ?? null,
    rating: p.rating,
    reviewCount: p.reviewCount,
    badge: localProductBadges[p.slug] ?? p.badge ?? null,
    installmentsEnabled: p.installmentsEnabled !== false,
    packageQuantity: p.packageQuantity ?? null,
    priceTiers: p.priceTiers && p.priceTiers.length > 0 ? p.priceTiers : undefined,
    bulkMinQty: p.bulkMinQty ?? null,
    bulkPrice: p.bulkPrice ?? null,
    categoryId: p.categoryId,
    createdAt: +new Date(p.createdAt),
    code: p.code ?? null,
    highlight: resolveHighlight({
      name: p.name,
      highlight: p.highlight,
      isNewProduct: p.isNewProduct,
      salesCount: p.salesCount,
      createdAt: p.createdAt,
      rootCategorySlug,
    }),
  };
}

/** Variantele fiecărui produs principal (după id) — doar cele care chiar au de ales ceva (o singură variantă fără etichetă nu apare). */
export function variantOptionsRecord(all: SourceProduct[]): Record<string, VariantOption[]> {
  const out: Record<string, VariantOption[]> = {};
  for (const [id, options] of buildVariantOptionsMap(all)) {
    if (options.length === 1 && !options[0].variantLabel) continue;
    out[id] = options;
  }
  return out;
}
