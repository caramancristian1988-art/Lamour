import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getNomenclature } from "@/lib/evsExpress";

// Doar admin. /api/admin/evs-nomenclatura?type=localities|regions|services → câmpurile pe care le întoarce EVS + primele 5 înregistrări.
// Cu &all=1 întoarce lista întreagă (JSON brut). Servește la a vedea dacă EVS oferă și coduri poștale pe lângă numele localităților.
export async function GET(request: NextRequest) {
  const user = await getSession();
  if (!user || !user.isAdmin) return NextResponse.json({ error: "Neautorizat." }, { status: 403 });

  const raw = request.nextUrl.searchParams.get("type");
  const type = raw === "regions" || raw === "services" ? raw : "localities";
  const result = await getNomenclature(type);
  if (!result.ok) return NextResponse.json({ error: result.description }, { status: 502, headers: { "Cache-Control": "no-store" } });

  const data = Array.isArray(result.raw) ? result.raw : [];
  const fields = [...new Set(data.slice(0, 200).flatMap((d) => (d && typeof d === "object" ? Object.keys(d as object) : [])))];
  const body =
    request.nextUrl.searchParams.get("all") === "1"
      ? { type, count: data.length, fields, data }
      : { type, count: data.length, fields, sample: data.slice(0, 5) };
  return NextResponse.json(body, { headers: { "Cache-Control": "no-store" } });
}
