import { NextRequest, NextResponse } from "next/server";
import { claimNextOrder } from "@/lib/orderRegistry";
import { apiActor, authorizeRegistryApi, ordersResponse, parseFormat } from "@/lib/registryApi";

// POST /api/registru/urmatoarea?format=json|tsv|csv — oferă cea mai veche comandă NEEXTRASĂ și o trece la „extrase”,
// deci următorul apel oferă următoarea. Nu trebuie introdus niciun număr. Antet X-Comenzi-Ramase = câte au mai rămas.
// Dacă fișierul nu a ajuns: GET /api/registru/ultima o reciteste, iar POST /api/registru/comanda/<nr>/redeschide o readuce la neextrase.
// Este POST (nu GET) pentru că MODIFICĂ starea comenzii — un link deschis din greșeală nu trebuie să „consume” comenzi.
export async function POST(request: NextRequest) {
  const denied = authorizeRegistryApi(request);
  if (denied) return denied;

  const claimed = await claimNextOrder(apiActor(request));
  if (!claimed) {
    return NextResponse.json(
      { error: "Nu mai sunt comenzi neextrase.", code: "nu_mai_sunt" },
      { status: 404, headers: { "Cache-Control": "no-store", "X-Comenzi-Ramase": "0" } }
    );
  }
  return ordersResponse([claimed.order], parseFormat(request.nextUrl.searchParams.get("format")), {
    "X-Comenzi-Ramase": String(claimed.remaining),
  });
}
