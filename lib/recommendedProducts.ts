import { prisma } from "./prisma";
import { onlyVisible } from "./productVisibility";
import { dedupeVariants } from "./productListing";
import { fallbackProducts } from "./fallbackData";

// Toate produsele bifate „Recomandat" în admin (ca pe prima pagină), fără limită; cât timp niciunul nu e bifat,
// se folosesc cele mai bine cotate (cel mult 15). Folosit în Contact și la finalul articolelor de blog.
export async function getRecommendedProducts() {
  try {
    const ticked = dedupeVariants(
      await prisma.product.findMany({ where: onlyVisible({ recommended: true }), orderBy: { createdAt: "desc" } })
    );
    if (ticked.length > 0) return ticked;
    const top = dedupeVariants(await prisma.product.findMany({ where: onlyVisible(), orderBy: { rating: "desc" }, take: 80 })).slice(0, 15);
    if (top.length === 0) throw new Error("empty");
    return top;
  } catch {
    return fallbackProducts.slice(0, 4);
  }
}
