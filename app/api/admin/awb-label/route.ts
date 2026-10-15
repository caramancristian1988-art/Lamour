import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getAwbLabel, type AwbLabelSize } from "@/lib/evsExpress";

// Eticheta AWB (PDF cu cod de bare) pentru o comandă din admin. Se cere după id-ul comenzii, nu după AWB brut,
// ca ruta să nu poată fi folosită pentru a descărca documente ale altor expediții din contul EVS.
export async function GET(request: NextRequest) {
  const user = await getSession();
  if (!user || !user.isAdmin) {
    return NextResponse.json({ error: "Neautorizat." }, { status: 403 });
  }

  const id = request.nextUrl.searchParams.get("id") ?? "";
  const size: AwbLabelSize = request.nextUrl.searchParams.get("size") === "100x100" ? "100x100" : "A4";
  if (!id) return NextResponse.json({ error: "Lipsește id-ul comenzii." }, { status: 400 });

  const order = await prisma.contactMessage.findUnique({ where: { id }, select: { awbCode: true } });
  if (!order?.awbCode) return NextResponse.json({ error: "Comanda nu are AWB." }, { status: 404 });

  const label = await getAwbLabel(order.awbCode, size);
  if (!label.ok) return NextResponse.json({ error: label.description }, { status: 502 });

  return new NextResponse(new Uint8Array(label.pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="AWB-${order.awbCode}-${size}.pdf"`,
      "Cache-Control": "private, no-store",
    },
  });
}
