import { NextRequest } from "next/server";
import { readJsonObject, runRead, runWrite } from "@/lib/catalogApi";
import { createCategory, listCategories } from "@/lib/catalogApiCategories";

// GET /api/catalog/categorii[?tree=1][&parent=<id|slug|radacina>] — categoriile și subcategoriile, cu numărul de produse.
//   tree=1 → arbore (fiecare categorie cu subcategoriile în „children”); altfel listă plată (în ordinea de pe site).
export async function GET(request: NextRequest) {
  const sp = request.nextUrl.searchParams;
  return runRead(request, () => listCategories({ tree: sp.get("tree") === "1", parent: sp.get("parent") }));
}

// POST /api/catalog/categorii — creează o categorie sau o subcategorie (cu „parent”: id | slug).
// Corp: { name, slug?, description?, image?, parent?, displayOrder? }
export async function POST(request: NextRequest) {
  const read = await readJsonObject(request);
  if ("response" in read) return read.response;
  return runWrite(request, "creează categorie", String(read.body.name ?? ""), (refresh) => createCategory(read.body, refresh), 201);
}
