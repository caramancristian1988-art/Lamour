import { NextRequest, NextResponse } from "next/server";
import { searchProducts } from "@/lib/searchProducts";

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q") ?? "";
  // `limit` (opțional, max. 12): panoul de căutare de pe telefon cere mai multe rezultate decât lista din antet.
  const limit = Math.min(Math.max(Number(request.nextUrl.searchParams.get("limit")) || 6, 1), 12);
  const results = await searchProducts(query, limit);
  // CDN: aceeași căutare (ex. „hârtie igienică”) vine de la mulți vizitatori — 5 minute proaspăt, apoi servit vechi cât se reîmprospătează.
  return NextResponse.json({ results }, { headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=3600" } });
}
