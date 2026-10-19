import { NextRequest } from "next/server";
import { csvResponse, fail, readJsonObject, runRead, runWrite } from "@/lib/catalogApi";
import { createProduct, listProducts } from "@/lib/catalogApiProducts";

export const maxDuration = 60;

// GET /api/catalog/produse?q=&categorie=<id|slug>&ascuns=da|nu&principale=1&disponibilitate=&sortare=nou|vechi|pret|pret-desc|nume
//                         &pagina=1&perPagina=100|toate&format=json|csv
// Lista de produse (inclusiv cele ascunse, dacă nu filtrezi cu ascuns=nu). `categorie` include și subcategoriile.
export async function GET(request: NextRequest) {
  const sp = request.nextUrl.searchParams;
  const csv = sp.get("format") === "csv";
  const response = await runRead(request, () =>
    listProducts({
      q: sp.get("q"),
      categorie: sp.get("categorie"),
      ascuns: sp.get("ascuns"),
      principale: sp.get("principale"),
      disponibilitate: sp.get("disponibilitate"),
      sortare: sp.get("sortare"),
      pagina: sp.get("pagina"),
      perPagina: sp.get("perPagina"),
    })
  );
  if (!csv || !response.ok) return response;

  const data = (await response.json()) as { produse: Record<string, unknown>[] };
  const columns = ["id", "code", "slug", "name", "category", "price", "oldPrice", "discountPercent", "availability", "hidden", "brand", "packageQuantity", "weightKg", "salesCount", "image"];
  const rows = data.produse.map((p) => ({ ...p, category: (p.category as { slug?: string } | null)?.slug ?? "" }));
  return csvResponse("produse.csv", columns, rows);
}

// POST /api/catalog/produse — creează un produs. Corp JSON: { name, price, category (id|slug), slug?, code?, oldPrice?, priceTiers?, … }
export async function POST(request: NextRequest) {
  const read = await readJsonObject(request);
  if ("response" in read) return read.response;
  if (typeof read.body.name !== "string") return fail(422, "„name” este obligatoriu.");
  return runWrite(request, "creează produs", read.body.name, (refresh) => createProduct(read.body, refresh), 201);
}
