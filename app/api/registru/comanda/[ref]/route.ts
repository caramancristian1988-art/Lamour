import { NextRequest, NextResponse } from "next/server";
import { findRegistryOrder } from "@/lib/orderRegistry";
import { authorizeRegistryApi, ordersResponse, parseFormat } from "@/lib/registryApi";

// GET /api/registru/comanda/40?format=json|tsv|csv — o singură comandă (un rând pe produs). Doar citire.
export async function GET(request: NextRequest, { params }: { params: Promise<{ ref: string }> }) {
  const denied = authorizeRegistryApi(request);
  if (denied) return denied;

  const { ref } = await params;
  const order = await findRegistryOrder(decodeURIComponent(ref));
  if (!order) {
    return NextResponse.json({ error: `Comanda ${ref} nu a fost găsită.` }, { status: 404, headers: { "Cache-Control": "no-store" } });
  }
  return ordersResponse([order], parseFormat(request.nextUrl.searchParams.get("format")));
}
