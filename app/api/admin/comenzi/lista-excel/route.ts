import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { EXTRACTION, listRegistryAll, type RegistryFilter } from "@/lib/orderRegistry";
import { buildListWorkbook, listFilename } from "@/lib/orderRegistryExcel";

// Lista curentă din Registrul de comenzi (aceleași filtre ca pe pagină: status, căutare, arhivate) descărcată ca Excel.
// Este doar o COPIE a datelor — nu rezervă și nu marchează nimic ca extras (pentru asta există exportul din Registru).
export async function GET(request: NextRequest) {
  const user = await getSession();
  if (!user || !user.isAdmin) {
    return NextResponse.json({ error: "Neautorizat." }, { status: 403 });
  }

  const sp = request.nextUrl.searchParams;
  const raw = sp.get("status");
  const status: RegistryFilter =
    raw === "toate" || raw === EXTRACTION.DONE || raw === EXTRACTION.RESERVED ? (raw as RegistryFilter) : EXTRACTION.NEW;
  const orders = await listRegistryAll({
    status,
    q: sp.get("q") ?? undefined,
    includeArchived: sp.get("arhivate") === "1",
  });

  const buffer = buildListWorkbook(orders);
  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${listFilename(status)}"`,
      "Cache-Control": "no-store",
    },
  });
}
