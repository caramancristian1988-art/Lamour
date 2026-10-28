import { NextRequest } from "next/server";
import { auditWrite, authorizeCatalogApi, fail, ok, readJsonObject } from "@/lib/catalogApi";
import { isValidRequestId, reserveForCrm } from "@/lib/orderNumberRegistry";

export const maxDuration = 30;

// POST /api/catalog/numere-comenzi/rezerva — rezervă un număr de comandă pentru CRM, în registrul comun cu site-ul.
// Antete: X-API-Key (cheia existentă) · Content-Type: application/json · Idempotency-Key: crm-order-<requestId>
// Corp: { "source": "crm", "requestId": "<uuid>" }  →  200 (reluare) / 201 (nou): { requestId, number (TEXT), reservationId }
// Aceeași identitate (source + requestId) primește mereu aceeași rezervare; identități diferite, numere diferite.
// Nu creează nicio comandă, nu face AWB și nu trimite notificări. Fără cache.
export async function POST(request: NextRequest) {
  const denied = authorizeCatalogApi(request, "write");
  if (denied) return denied;

  const read = await readJsonObject(request);
  if ("response" in read) return read.response;
  const { source, requestId } = read.body;
  if (source !== "crm") return fail(422, "„source” trebuie să fie „crm”.");
  if (!isValidRequestId(requestId)) return fail(422, "„requestId” trebuie să aibă 1–100 de caractere: litere, cifre, _ sau -.");
  const key = request.headers.get("idempotency-key");
  if (key !== null && key !== `crm-order-${requestId}`) return fail(422, "Idempotency-Key trebuie să fie crm-order-<requestId>.");

  try {
    const r = await reserveForCrm(requestId);
    if (!r.replay) auditWrite(request, "rezervă număr de comandă", `${r.number} (${requestId})`);
    return ok({ requestId: r.requestId, number: r.number, reservationId: r.reservationId }, r.replay ? 200 : 201);
  } catch (err) {
    console.error("[catalog-api] rezervarea numărului a eșuat:", err);
    return fail(500, "Rezervarea nu a putut fi salvată. Reîncearcă cu aceeași identitate (nu se alocă un al doilea număr).");
  }
}
