import { NextRequest } from "next/server";
import { readJsonObject, runRead, runWrite } from "@/lib/catalogApi";
import { deleteCategory, getCategory, updateCategory } from "@/lib/catalogApiCategories";

export const maxDuration = 60;

type Ctx = { params: Promise<{ ref: string }> };

// GET /api/catalog/categorii/<id | slug> — o categorie cu subcategoriile ei.
export async function GET(request: NextRequest, { params }: Ctx) {
  const { ref } = await params;
  return runRead(request, () => getCategory(ref));
}

// PATCH /api/catalog/categorii/<ref> — modifică doar câmpurile trimise (name, slug, description, image, parent, displayOrder).
export async function PATCH(request: NextRequest, { params }: Ctx) {
  const { ref } = await params;
  const read = await readJsonObject(request);
  if ("response" in read) return read.response;
  return runWrite(request, "modifică categorie", ref, (refresh) => updateCategory(ref, read.body, refresh));
}

// DELETE /api/catalog/categorii/<ref>[?moveTo=<categorie>][&cascade=1]
//   fără parametri: refuză (409) dacă are produse sau subcategorii · moveTo: le mută în altă categorie · cascade=1: șterge TOT.
export async function DELETE(request: NextRequest, { params }: Ctx) {
  const { ref } = await params;
  const sp = request.nextUrl.searchParams;
  const moveTo = sp.get("moveTo");
  const cascade = sp.get("cascade") === "1";
  return runWrite(request, "șterge categorie", `${ref}${moveTo ? ` → ${moveTo}` : ""}${cascade ? " (cascade)" : ""}`, (refresh) =>
    deleteCategory(ref, { moveTo, cascade }, refresh)
  );
}
