import { NextRequest } from "next/server";
import { readJsonObject, runRead, runWrite } from "@/lib/catalogApi";
import { applyOffersBulk, listOffers } from "@/lib/catalogApiOffers";

export const maxDuration = 120;

// GET /api/catalog/oferte[?tip=reducere|cantitate|toate][&categorie=<id|slug>] — produsele cu reducere și / sau ofertă la cantitate.
export async function GET(request: NextRequest) {
  const sp = request.nextUrl.searchParams;
  return runRead(request, () => listOffers({ tip: sp.get("tip"), categorie: sp.get("categorie") }));
}

// POST /api/catalog/oferte — oferte în masă, pentru o listă de produse și / sau o categorie întreagă (cu subcategoriile).
//   { "categorie": "greble", "procent": 15 }                         → −15% la toată categoria (idempotent: repetat nu scade din nou)
//   { "produse": ["a", "b"], "cantitate": [{ "minQty": 10, "price": 11.5 }] }
//   { "categorie": "greble", "anuleaza": true, "tip": "reducere", "restabilestePretul": true }
export async function POST(request: NextRequest) {
  const read = await readJsonObject(request);
  if ("response" in read) return read.response;
  const target = JSON.stringify({ categorie: read.body.categorie, produse: Array.isArray(read.body.produse) ? read.body.produse.length : undefined });
  return runWrite(request, "oferte în masă", target, (refresh) => applyOffersBulk(read.body, refresh));
}
