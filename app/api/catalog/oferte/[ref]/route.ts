import { NextRequest } from "next/server";
import { methodOverride, readJsonObject, runRead, runWrite } from "@/lib/catalogApi";
import { applyOffer, getOffer } from "@/lib/catalogApiOffers";

type Ctx = { params: Promise<{ ref: string }> };

// GET /api/catalog/oferte/<id | slug | cod> — oferta unui produs (reducere + praguri de cantitate).
export async function GET(request: NextRequest, { params }: Ctx) {
  const { ref } = await params;
  return runRead(request, () => getOffer(ref));
}

// PUT /api/catalog/oferte/<ref> — setează oferta. Corp: { reducere?: {procent} | {pretNou} | {pretVechi, pretNou?} | null, cantitate?: [{minQty, price}] | null }
export async function PUT(request: NextRequest, { params }: Ctx) {
  const { ref } = await params;
  const read = await readJsonObject(request);
  if ("response" in read) return read.response;
  return runWrite(request, "setează ofertă", ref, (refresh) =>
    applyOffer(ref, { reducere: read.body.reducere, cantitate: read.body.cantitate, restabilestePretul: read.body.restabilestePretul === true }, refresh)
  );
}

// DELETE /api/catalog/oferte/<ref>[?tip=reducere|cantitate|toate][&restabilestePretul=1] — șterge oferta (reducerea: prețul vechi dispare;
// cu restabilestePretul=1 prețul curent revine la cel vechi).
export async function DELETE(request: NextRequest, { params }: Ctx) {
  const { ref } = await params;
  const sp = request.nextUrl.searchParams;
  const tip = sp.get("tip");
  return runWrite(request, "șterge ofertă", `${ref} (${tip ?? "toate"})`, (refresh) =>
    applyOffer(
      ref,
      {
        ...(tip !== "cantitate" ? { reducere: null } : {}),
        ...(tip !== "reducere" ? { cantitate: null } : {}),
        restabilestePretul: sp.get("restabilestePretul") === "1",
      },
      refresh
    )
  );
}

// POST /api/catalog/oferte/<ref>[?_method=DELETE] — pentru clienți care știu doar GET și POST: setează oferta (ca PUT) sau, cu ?_method=DELETE, o șterge.
export async function POST(request: NextRequest, ctx: Ctx) {
  return methodOverride(request, "PUT") === "DELETE" ? DELETE(request, ctx) : PUT(request, ctx);
}
