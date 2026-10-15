"use server";

import { prisma } from "./prisma";
import { normalizeTiers, type PriceTier } from "./pricing";

export interface CatalogEntry {
  slug: string;
  name: string;
  price: number;
  oldPrice: number | null;
  image: string | null;
  tiers: PriceTier[];
}

const MAX_SLUGS = 100;

// Starea reală a produselor din coș. Coșul stă în localStorage, deci prețurile,
// prețul vechi (care declanșează "Economisește") și pragurile pot fi rămase de
// la o vizită veche — CartProvider le reîmprospătează de aici. Un slug care nu
// apare în răspuns nu mai există în catalog.
export async function getCatalogEntries(slugs: string[]): Promise<CatalogEntry[]> {
  const unique = [...new Set(slugs.filter((s) => typeof s === "string" && s))].slice(0, MAX_SLUGS);
  if (unique.length === 0) return [];

  const products = await prisma.product.findMany({ where: { slug: { in: unique } } });
  return products.map((p) => ({
    slug: p.slug,
    name: p.name,
    price: p.price,
    oldPrice: p.oldPrice,
    image: p.image,
    tiers: normalizeTiers(p),
  }));
}
