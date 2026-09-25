import { unstable_cache } from "next/cache";
import { prisma } from "./prisma";

// Catalogul întreg (categorii + produse), folosit de lista /produse și de căutarea din antet. Înainte, FIECARE apăsare
// pe un filtru și fiecare căutare aducea din baza de date toate cele ~300 de produse (~300 KiB, 130–900 ms) — de-aici
// senzația de "se încarcă greu". Acum rezultatul e ținut în cache; se împrospătează singur la 5 minute și imediat
// când adminul modifică un produs sau o categorie (vezi updateTag(CATALOG_TAG) în adminProductActions/adminCategoryActions).
export const CATALOG_TAG = "catalog";

const loadCatalog = unstable_cache(
  async () => {
    const [categories, products] = await Promise.all([
      prisma.category.findMany({ orderBy: { createdAt: "asc" } }),
      prisma.product.findMany({ orderBy: { createdAt: "desc" } }),
    ]);
    return { categories, products };
  },
  ["catalog-v1"],
  { revalidate: 300, tags: [CATALOG_TAG] }
);

export async function getCatalog() {
  const raw = await loadCatalog();
  // Cache-ul serializează în JSON, deci datele calendaristice revin ca text — le readucem la Date.
  return {
    categories: raw.categories.map((c) => ({ ...c, createdAt: new Date(c.createdAt) })),
    products: raw.products.map((p) => ({ ...p, createdAt: new Date(p.createdAt) })),
  };
}
