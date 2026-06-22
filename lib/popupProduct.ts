"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "./prisma";
import { requireAdmin } from "./adminAuth";
import { fallbackOfferProducts } from "./fallbackData";
import type { PopupProduct } from "@/app/components/DiscountPopup";

function randomFallback(): PopupProduct {
  const pick = fallbackOfferProducts[Math.floor(Math.random() * fallbackOfferProducts.length)];
  return {
    slug: pick.slug,
    name: pick.name,
    image: pick.image,
    price: pick.price,
    oldPrice: pick.oldPrice,
    rating: pick.rating,
    reviewCount: pick.reviewCount,
  };
}

// Picks a random product for the popup. Prefers products an admin explicitly
// curated (popupEnabled); falls back to anything discounted, then demo data.
export async function getPopupProduct(): Promise<PopupProduct | null> {
  try {
    let candidates = await prisma.product.findMany({ where: { popupEnabled: true } });
    if (candidates.length === 0) {
      candidates = await prisma.product.findMany({ where: { oldPrice: { not: null } } });
    }
    if (candidates.length === 0) return randomFallback();

    const pick = candidates[Math.floor(Math.random() * candidates.length)];
    return {
      slug: pick.slug,
      name: pick.name,
      image: pick.image,
      price: pick.price,
      oldPrice: pick.oldPrice,
      rating: pick.rating,
      reviewCount: pick.reviewCount,
    };
  } catch {
    return randomFallback();
  }
}

export async function getPopupEnabledProductIds(): Promise<Set<string>> {
  try {
    const products = await prisma.product.findMany({ where: { popupEnabled: true }, select: { id: true } });
    return new Set(products.map((p) => p.id));
  } catch {
    return new Set();
  }
}

export async function updatePopupProductsAction(formData: FormData) {
  await requireAdmin();

  const allIds = String(formData.get("allIds") ?? "").split(",").filter(Boolean);
  const selectedIds = new Set(formData.getAll("productIds").map(String));
  const toEnable = allIds.filter((id) => selectedIds.has(id));
  const toDisable = allIds.filter((id) => !selectedIds.has(id));

  await Promise.all([
    toEnable.length > 0
      ? prisma.product.updateMany({ where: { id: { in: toEnable } }, data: { popupEnabled: true } })
      : Promise.resolve(),
    toDisable.length > 0
      ? prisma.product.updateMany({ where: { id: { in: toDisable } }, data: { popupEnabled: false } })
      : Promise.resolve(),
  ]);

  revalidatePath("/admin/popup");
}
