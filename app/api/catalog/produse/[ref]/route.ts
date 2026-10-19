import { NextRequest } from "next/server";
import { readJsonObject, runRead, runWrite } from "@/lib/catalogApi";
import { deleteProduct, getProduct, updateProduct } from "@/lib/catalogApiProducts";

export const maxDuration = 60;

type Ctx = { params: Promise<{ ref: string }> };

// GET /api/catalog/produse/<id | slug | cod> — un produs, cu categoria și variantele lui.
export async function GET(request: NextRequest, { params }: Ctx) {
  const { ref } = await params;
  return runRead(request, () => getProduct(ref));
}

// PATCH /api/catalog/produse/<ref> — modifică DOAR câmpurile trimise (restul rămân neschimbate). null șterge un câmp opțional.
export async function PATCH(request: NextRequest, { params }: Ctx) {
  const { ref } = await params;
  const read = await readJsonObject(request);
  if ("response" in read) return read.response;
  return runWrite(request, "modifică produs", ref, (refresh) => updateProduct(ref, read.body, refresh));
}

// DELETE /api/catalog/produse/<ref>[?cuVariante=1] — șterge produsul. Un produs cu variante nu se șterge decât cu cuVariante=1.
export async function DELETE(request: NextRequest, { params }: Ctx) {
  const { ref } = await params;
  const withVariants = request.nextUrl.searchParams.get("cuVariante") === "1";
  return runWrite(request, "șterge produs", `${ref}${withVariants ? " (cu variante)" : ""}`, (refresh) => deleteProduct(ref, { withVariants }, refresh));
}
