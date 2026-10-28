import { NextRequest } from "next/server";
import { authorizeSyncDispatch, ok } from "@/lib/catalogApi";
import { dispatchOutbox } from "@/lib/siteSyncDispatch";

export const maxDuration = 60;

// (buget 25 s: încape în timeout-ul de 30 s al serviciilor de ping gen cron-job.org) GET|POST /api/catalog/sync/dispatch — trimite la CRM evenimentele din coadă (în ordine, cu reîncercări). Se apelează periodic (ex. în fiecare minut)
// cu `Authorization: Bearer $CRON_SECRET` (Vercel Cron) sau cu cheia completă a catalogului; e sigur de apelat oricând (un singur dispecer o dată).
async function run(request: NextRequest) {
  const denied = authorizeSyncDispatch(request);
  if (denied) return denied;
  return ok(await dispatchOutbox({ budgetMs: 25_000 }));
}

export const GET = run;
export const POST = run;
