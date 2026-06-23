"use server";

import { prisma } from "./prisma";

export type PopupEventType = "click" | "close";

export async function logPopupEvent(productSlug: string, event: PopupEventType) {
  try {
    await prisma.popupEvent.create({ data: { productSlug, event } });
  } catch {
    // Best-effort analytics — never block the user's navigation on this.
  }
}

export async function getPopupStats(): Promise<{ clicks: number; closes: number }> {
  try {
    const [clicks, closes] = await Promise.all([
      prisma.popupEvent.count({ where: { event: "click" } }),
      prisma.popupEvent.count({ where: { event: "close" } }),
    ]);
    return { clicks, closes };
  } catch {
    return { clicks: 0, closes: 0 };
  }
}

export interface PopupProductStat {
  slug: string;
  name: string;
  image: string | null;
  categoryId: string | null;
  categoryName: string | null;
  clicks: number;
  closes: number;
}

// Per-product breakdown so an admin can see which offers actually get
// engagement (clicks toward the product) versus get dismissed (closes).
// Optionally scoped to a single category and/or filtered by name.
export async function getPopupStatsByProduct(categoryId?: string, search?: string): Promise<PopupProductStat[]> {
  try {
    const grouped = await prisma.popupEvent.groupBy({
      by: ["productSlug", "event"],
      _count: { _all: true },
    });

    const bySlug = new Map<string, { clicks: number; closes: number }>();
    for (const row of grouped) {
      const entry = bySlug.get(row.productSlug) ?? { clicks: 0, closes: 0 };
      if (row.event === "click") entry.clicks = row._count._all;
      else entry.closes = row._count._all;
      bySlug.set(row.productSlug, entry);
    }

    const slugs = Array.from(bySlug.keys());
    if (slugs.length === 0) return [];

    const products = await prisma.product.findMany({ where: { slug: { in: slugs } }, include: { category: true } });
    const productBySlug = new Map(products.map((p) => [p.slug, p]));

    return slugs
      .map((slug) => {
        const counts = bySlug.get(slug)!;
        const product = productBySlug.get(slug);
        return {
          slug,
          name: product?.name ?? slug,
          image: product?.image ?? null,
          categoryId: product?.categoryId ?? null,
          categoryName: product?.category?.name ?? null,
          clicks: counts.clicks,
          closes: counts.closes,
        };
      })
      .filter((stat) => !categoryId || stat.categoryId === categoryId)
      .filter((stat) => !search || stat.name.toLowerCase().includes(search.toLowerCase()))
      .sort((a, b) => b.clicks - a.clicks);
  } catch {
    return [];
  }
}
