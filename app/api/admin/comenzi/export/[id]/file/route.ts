import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getExportSummary, getExportOrders, logExportAudit } from "@/lib/orderRegistry";
import { buildExportWorkbook, exportFilename } from "@/lib/orderRegistryExcel";

// Fișierul se (re)generează din lista FIXĂ de comenzi a exportului — descărcarea poate fi repetată oricând
// (conexiune pierdută, pagină închisă) și produce același conținut, fără a crea un export nou.
export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSession();
  if (!user || !user.isAdmin) {
    return NextResponse.json({ error: "Neautorizat." }, { status: 403 });
  }

  const { id } = await params;
  const exp = await getExportSummary(id);
  if (!exp) return NextResponse.json({ error: "Exportul nu a fost găsit." }, { status: 404 });
  if (exp.status === "anulat" || exp.status === "expirat") {
    return NextResponse.json({ error: `Exportul nu mai este activ (${exp.statusLabel.toLowerCase()}).` }, { status: 409 });
  }

  const orders = await getExportOrders(id);
  const buffer = buildExportWorkbook(exp, orders);
  await logExportAudit("fisier_descarcat", { channel: "site", id: user.id, name: user.name || user.email }, id, { comenzi: orders.length });

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${exportFilename(exp)}"`,
      "Cache-Control": "no-store",
    },
  });
}
