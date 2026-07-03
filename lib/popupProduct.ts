"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "./prisma";
import { requireAdmin } from "./adminAuth";
import { fallbackOfferProducts } from "./fallbackData";
import type { PopupProduct } from "@/app/components/DiscountPopup";

const FALLBACK_REVIEW = {
  name: "Client Climat Rapid",
  text: "Livrare rapidă, montaj curat și aparatul funcționează perfect. Recomand cu toată încrederea!",
  rating: 5,
};

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
    review: FALLBACK_REVIEW,
    btu: null,
    technology: null,
    energyClass: null,
    installmentsEnabled: true,
  };
}

async function findBestReview(productName: string) {
  const productReview = await prisma.review.findFirst({
    where: { product: productName, approved: true },
    orderBy: { rating: "desc" },
  });
  if (productReview) return { name: productReview.name, text: productReview.text, rating: productReview.rating };

  const anyGreatReview = await prisma.review.findFirst({
    where: { approved: true, rating: { gte: 4 } },
    orderBy: { createdAt: "desc" },
  });
  if (anyGreatReview) return { name: anyGreatReview.name, text: anyGreatReview.text, rating: anyGreatReview.rating };

  return FALLBACK_REVIEW;
}

// Picks a random discounted product for the popup, so there's always a real
// price comparison to show. Prefers products an admin explicitly curated
// (popupEnabled); falls back to anything discounted, then demo data.
export async function getPopupProduct(): Promise<PopupProduct | null> {
  try {
    let candidates = await prisma.product.findMany({ where: { popupEnabled: true, oldPrice: { not: null } } });
    if (candidates.length === 0) {
      candidates = await prisma.product.findMany({ where: { oldPrice: { not: null } } });
    }
    if (candidates.length === 0) return randomFallback();

    const pick = candidates[Math.floor(Math.random() * candidates.length)];
    const review = await findBestReview(pick.name);

    return {
      slug: pick.slug,
      name: pick.name,
      image: pick.image,
      price: pick.price,
      oldPrice: pick.oldPrice,
      rating: pick.rating,
      reviewCount: pick.reviewCount,
      review,
      btu: pick.btu,
      technology: pick.technology,
      energyClass: pick.energyClass,
      installmentsEnabled: pick.installmentsEnabled,
    };
  } catch {
    return randomFallback();
  }
}

// Picks up to `count` distinct discounted products for the popup's story
// carousel. Same candidate pool/priority as getPopupProduct, just sampled
// without replacement instead of a single pick.
export async function getPopupProducts(count: number): Promise<PopupProduct[]> {
  try {
    let candidates = await prisma.product.findMany({ where: { popupEnabled: true, oldPrice: { not: null } } });
    if (candidates.length === 0) {
      candidates = await prisma.product.findMany({ where: { oldPrice: { not: null } } });
    }
    if (candidates.length === 0) {
      const shuffled = [...fallbackOfferProducts].sort(() => Math.random() - 0.5).slice(0, count);
      return shuffled.map((pick) => ({
        slug: pick.slug,
        name: pick.name,
        image: pick.image,
        price: pick.price,
        oldPrice: pick.oldPrice,
        rating: pick.rating,
        reviewCount: pick.reviewCount,
        review: FALLBACK_REVIEW,
        btu: null,
        technology: null,
        energyClass: null,
        installmentsEnabled: true,
      }));
    }

    const shuffled = [...candidates].sort(() => Math.random() - 0.5).slice(0, count);
    return await Promise.all(
      shuffled.map(async (pick) => {
        const review = await findBestReview(pick.name);
        return {
          slug: pick.slug,
          name: pick.name,
          image: pick.image,
          price: pick.price,
          oldPrice: pick.oldPrice,
          rating: pick.rating,
          reviewCount: pick.reviewCount,
          review,
          btu: pick.btu,
          technology: pick.technology,
          energyClass: pick.energyClass,
          installmentsEnabled: pick.installmentsEnabled,
        };
      })
    );
  } catch {
    return [randomFallback()];
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

const DEFAULT_COUNTDOWN_MINUTES = 10;

// Settings.popupCountdownMinutes was added before the Prisma client could be
// regenerated locally, so it's read/written via raw commands for now — safe
// to switch to the typed prisma.settings API once a generate succeeds.
export async function getPopupCountdownMinutes(): Promise<number> {
  try {
    const result = (await prisma.$runCommandRaw({ find: "Settings", filter: {}, limit: 1 })) as {
      cursor?: { firstBatch?: { popupCountdownMinutes?: number }[] };
    };
    return result.cursor?.firstBatch?.[0]?.popupCountdownMinutes ?? DEFAULT_COUNTDOWN_MINUTES;
  } catch {
    return DEFAULT_COUNTDOWN_MINUTES;
  }
}

export async function updatePopupTimerAction(formData: FormData) {
  await requireAdmin();

  const raw = Number(formData.get("countdownMinutes"));
  const minutes = Math.max(1, Math.min(180, Number.isFinite(raw) && raw > 0 ? raw : DEFAULT_COUNTDOWN_MINUTES));

  const result = (await prisma.$runCommandRaw({ find: "Settings", filter: {}, limit: 1 })) as {
    cursor?: { firstBatch?: { _id: { $oid: string } }[] };
  };
  const existing = result.cursor?.firstBatch?.[0];

  if (existing) {
    await prisma.$runCommandRaw({
      update: "Settings",
      updates: [{ q: { _id: { $oid: existing._id.$oid } }, u: { $set: { popupCountdownMinutes: minutes } } }],
    });
  } else {
    await prisma.$runCommandRaw({
      insert: "Settings",
      documents: [
        {
          popupCountdownMinutes: minutes,
          produseEnabled: true,
          serviciiEnabled: true,
          proiecteEnabled: false,
          despreEnabled: true,
          blogEnabled: true,
          contactEnabled: true,
        },
      ],
    });
  }

  revalidatePath("/admin/popup");
}
