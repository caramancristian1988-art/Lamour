import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { buildProductsWorkbook } from "@/lib/productExcel";

// Toate produsele, cu toate datele, într-un fișier Excel (același format se poate reimporta din Admin → Produse).
export async function GET() {
  const user = await getSession();
  if (!user || !user.isAdmin) {
    return NextResponse.json({ error: "Neautorizat." }, { status: 403 });
  }

  const buffer = await buildProductsWorkbook();
  const filename = `produse-${new Date().toISOString().slice(0, 10)}.xlsx`;
  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "private, no-store",
    },
  });
}
