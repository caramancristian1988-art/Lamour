import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth";
import { invalidateCatalog } from "@/lib/catalog";
import { analyzeProductsFile, applyProductsFile, ProductsFileError, MAX_IMPORT_BYTES } from "@/lib/productExcel";

// Un import mare scrie sute de produse una câte una.
export const maxDuration = 60;

// mode=analyze: doar raportează (nou / identic / diferit / eroare), fără să scrie nimic.
// mode=apply:   adaugă produsele noi, sare peste cele identice; le actualizează pe cele diferite doar cu updateExisting=1.
export async function POST(request: NextRequest) {
  const user = await getSession();
  if (!user || !user.isAdmin) {
    return NextResponse.json({ error: "Neautorizat." }, { status: 403 });
  }
  // Cookie-ul de sesiune e SameSite=Lax; verificăm și originea, ca o pagină străină să nu poată porni un import.
  const origin = request.headers.get("origin");
  if (origin) {
    let sameHost = false;
    try {
      sameHost = new URL(origin).host === request.headers.get("host");
    } catch {
      sameHost = false;
    }
    if (!sameHost) return NextResponse.json({ error: "Cerere refuzată." }, { status: 403 });
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ error: "Cerere invalidă." }, { status: 400 });
  }
  const file = form.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json({ error: "Alege un fișier Excel (.xlsx) sau CSV." }, { status: 400 });
  }
  if (file.size > MAX_IMPORT_BYTES) {
    return NextResponse.json({ error: "Fișierul e prea mare (maxim 5 MB)." }, { status: 400 });
  }
  const buffer = Buffer.from(await file.arrayBuffer());

  try {
    if (form.get("mode") === "apply") {
      const result = await applyProductsFile(buffer, { updateExisting: form.get("updateExisting") === "1" });
      if (result.created > 0 || result.updated > 0) {
        invalidateCatalog();
        revalidatePath("/produse", "layout");
        revalidatePath("/");
        revalidatePath("/admin/produse");
      }
      return NextResponse.json({ ok: true, result });
    }
    return NextResponse.json({ ok: true, analysis: await analyzeProductsFile(buffer) });
  } catch (err) {
    if (err instanceof ProductsFileError) return NextResponse.json({ error: err.message }, { status: 400 });
    console.error("import produse eșuat:", err);
    return NextResponse.json({ error: "Importul a eșuat. Încearcă din nou sau verifică fișierul." }, { status: 500 });
  }
}
