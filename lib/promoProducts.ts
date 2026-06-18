import { prisma } from "./prisma";
import { fallbackOfferProducts } from "./fallbackData";

export async function getPromoProducts(categorySlug?: string, take = 4) {
  try {
    const category = categorySlug
      ? await prisma.category.findUnique({ where: { slug: categorySlug } })
      : null;
    const where = category ? { categoryId: category.id } : {};

    let products = await prisma.product.findMany({
      where: { ...where, oldPrice: { not: null } },
      orderBy: { reviewCount: "desc" },
      take,
    });

    if (products.length < take) {
      products = await prisma.product.findMany({
        where,
        orderBy: { reviewCount: "desc" },
        take,
      });
    }

    return products.length > 0 ? products : fallbackOfferProducts.slice(0, take);
  } catch {
    return fallbackOfferProducts.slice(0, take);
  }
}
