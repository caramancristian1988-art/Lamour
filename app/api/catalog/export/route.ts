import { NextRequest } from "next/server";
import { good, runRead } from "@/lib/catalogApi";
import { listCategories } from "@/lib/catalogApiCategories";
import { listProducts } from "@/lib/catalogApiProducts";

export const maxDuration = 60;

// GET /api/catalog/export — TOT catalogul într-o singură cerere: categoriile (arbore) + toate produsele (cu cele ascunse).
// Pentru copii de siguranță și sincronizări. Pentru un tabel, folosește /api/catalog/produse?perPagina=toate&format=csv.
export async function GET(request: NextRequest) {
  return runRead(request, async () => {
    const [cats, prods] = await Promise.all([listCategories({ tree: true }), listProducts({ perPagina: "toate", sortare: "vechi" })]);
    if (!cats.ok) return cats;
    if (!prods.ok) return prods;
    return good({ exportatLa: new Date().toISOString(), categorii: (cats.data as { categorii: unknown[] }).categorii, produse: prods.data.produse, totalProduse: prods.data.total });
  });
}
