import { NextRequest } from "next/server";
import { auditWrite, authorizeCatalogApi, ok } from "@/lib/catalogApi";
import { requeueFailed, dispatchOutbox } from "@/lib/siteSyncDispatch";

export const maxDuration = 60;

// POST /api/catalog/sync/retry — repune în coadă evenimentele respinse ca invalide (după ce s-a reparat cauza) și pornește trimiterea.
export async function POST(request: NextRequest) {
  const denied = authorizeCatalogApi(request, "write");
  if (denied) return denied;
  const requeued = await requeueFailed();
  auditWrite(request, "reia evenimentele respinse", String(requeued));
  return ok({ ok: true, requeued, dispatch: await dispatchOutbox({ budgetMs: 45_000 }) });
}
