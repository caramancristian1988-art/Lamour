import { NextRequest, NextResponse } from "next/server";
import { lastClaimedOrder } from "@/lib/orderRegistry";
import { apiActor, authorizeRegistryApi, ordersResponse, parseFormat } from "@/lib/registryApi";

// GET /api/registru/ultima?format=... — ultima comandă oferită cheii tale prin /urmatoarea (o recitești, nu schimbă nimic).
export async function GET(request: NextRequest) {
  const denied = authorizeRegistryApi(request);
  if (denied) return denied;

  const order = await lastClaimedOrder(apiActor(request));
  if (!order) {
    return NextResponse.json({ error: "Cheia aceasta nu a primit încă nicio comandă." }, { status: 404, headers: { "Cache-Control": "no-store" } });
  }
  return ordersResponse([order], parseFormat(request.nextUrl.searchParams.get("format")));
}
