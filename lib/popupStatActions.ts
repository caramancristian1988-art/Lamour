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
