import { NextRequest } from "next/server";
import { auditWrite, authorizeCatalogApi, ok } from "@/lib/catalogApi";
import { enqueueFullResync } from "@/lib/siteSyncDispatch";

export const maxDuration = 120;

// POST /api/catalog/sync/resync — pune în coadă starea ACTUALĂ a tuturor produselor, a comenzilor din coș și a categoriilor, cu secvențe noi
// (inițializare după importul inițial din CRM, sau reconciliere dacă s-a pierdut ceva). Evenimentele pleacă apoi prin dispecerul obișnuit.
export async function POST(request: NextRequest) {
  const denied = authorizeCatalogApi(request, "write");
  if (denied) return denied;
  const counts = await enqueueFullResync();
  auditWrite(request, "resincronizare completă către CRM", JSON.stringify(counts));
  return ok({ ok: true, enqueued: counts });
}
