import { NextRequest } from "next/server";
import { good, runRead } from "@/lib/catalogApi";
import { getSyncStatus } from "@/lib/siteSyncDispatch";

// GET /api/catalog/sync — starea notificărilor către CRM: activ / pauzat, câte evenimente așteaptă, vechimea celui mai vechi, ultima trimitere
// reușită, ultima eroare și evenimentele respinse ca invalide. Pentru monitorizare (alertă dacă `oldestPending.ageSeconds` crește mult).
export async function GET(request: NextRequest) {
  return runRead(request, async () => good(await getSyncStatus()));
}
