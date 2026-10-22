import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { good, runRead } from "@/lib/catalogApi";

// GET /api/catalog — verifică cheia și arată pe scurt ce poți face + numărul de produse / categorii. Documentația completă: docs/catalog-api.md
export async function GET(request: NextRequest) {
  return runRead(request, async () => {
    const [produse, categorii] = await Promise.all([prisma.product.count(), prisma.category.count()]);
    return good({
      ok: true,
      produse,
      categorii,
      endpoints: [
        "GET/POST /api/catalog/produse",
        "GET/PATCH/DELETE /api/catalog/produse/{id|slug|cod}",
        "POST /api/catalog/produse/bulk",
        "GET/POST /api/catalog/categorii",
        "GET/PATCH/DELETE /api/catalog/categorii/{id|slug}",
        "GET/POST /api/catalog/oferte",
        "GET/POST /api/catalog/comenzi",
        "GET/PATCH/DELETE /api/catalog/comenzi/{număr|id}  (și POST ?_method=PATCH|DELETE)",
        "GET/PUT/DELETE /api/catalog/oferte/{id|slug|cod}",
        "GET /api/catalog/export",
      ],
    });
  });
}
