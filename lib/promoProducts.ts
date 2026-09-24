import { prisma } from "./prisma";

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

    return products;
  } catch {
    return [];
  }
}
