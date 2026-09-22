import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { listPendingOrders, ordersToCSV, ordersToXLSX, ordersToPDF } from "@/lib/orderExport";

export async function GET(request: NextRequest) {
  const user = await getSession();
  if (!user || !user.isAdmin) {
    return NextResponse.json({ error: "Neautorizat." }, { status: 403 });
  }

  const format = request.nextUrl.searchParams.get("format") ?? "xlsx";
  const orders = await listPendingOrders();
  const filename = `comenzi-nelivrate-${new Date().toISOString().slice(0, 10)}`;

  if (format === "csv") {
    return new NextResponse(ordersToCSV(orders), {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}.csv"`,
      },
    });
  }

  if (format === "pdf") {
    const buffer = await ordersToPDF(orders);
    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}.pdf"`,
      },
    });
  }

  const buffer = ordersToXLSX(orders);
  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${filename}.xlsx"`,
    },
  });
}
