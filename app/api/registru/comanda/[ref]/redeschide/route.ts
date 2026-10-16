import { NextRequest, NextResponse } from "next/server";
import { reopenOrder } from "@/lib/orderRegistry";
import { apiActor, authorizeRegistryApi } from "@/lib/registryApi";

// POST /api/registru/comanda/40/redeschide — readuce o comandă extrasă la „neextrase” (ex. importul în Excel a eșuat),
// ca /urmatoarea să o ofere din nou. Nu merge pe comenzile extrase printr-un export Excel din Registru.
export async function POST(request: NextRequest, { params }: { params: Promise<{ ref: string }> }) {
  const denied = authorizeRegistryApi(request);
  if (denied) return denied;

  const { ref } = await params;
  const order = await reopenOrder(decodeURIComponent(ref), apiActor(request));
  if (!order) {
    return NextResponse.json(
      { error: `Comanda ${ref} nu există sau nu poate fi redeschisă (nu e extrasă, ori a fost extrasă printr-un export).` },
      { status: 409, headers: { "Cache-Control": "no-store" } }
    );
  }
  return NextResponse.json({ ok: true, comanda: order.ref, status: order.extractionLabel }, { headers: { "Cache-Control": "no-store" } });
}
