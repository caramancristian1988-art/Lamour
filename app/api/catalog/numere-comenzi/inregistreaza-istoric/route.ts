import { NextRequest } from "next/server";
import { auditWrite, authorizeCatalogApi, fail, ok, readJsonObject } from "@/lib/catalogApi";
import { isValidOrderNumber, REGISTRY_NAMESPACE, registerCrmHistory } from "@/lib/orderNumberRegistry";

export const maxDuration = 120;

// POST /api/catalog/numere-comenzi/inregistreaza-istoric — înregistrează numerele istorice ale CRM-ului ca OCUPATE în registrul comun.
// Antete: X-API-Key · Content-Type: application/json · Idempotency-Key: crm-history-<sha256 al listei JSON>
// Corp: { "source": "crm", "numbers": ["1000", "1001", "LT-00001002"] }  (max. 1.000 de numere; lista goală e permisă)
// Idempotent. Nu modifică numerele existente și nu creează comenzi. La prima folosire, numerele comenzilor DEJA existente pe site
// se înregistrează automat (o singură dată) și seria numerică trece peste cel mai mare număr din ambele istorice.
// Răspuns: { ok: true, namespace: "shared-v1", registered, alreadyRegistered, ambiguous: [{ number, occupiedBy }] }
// „ambiguous” = numere istorice care existau deja în ALT sistem (ex. același „1000" și pe site): rămân ocupate, se raportează pentru reconciliere.
export async function POST(request: NextRequest) {
  const denied = authorizeCatalogApi(request, "write");
  if (denied) return denied;

  const read = await readJsonObject(request);
  if ("response" in read) return read.response;
  const { source, numbers } = read.body;
  if (source !== "crm") return fail(422, "„source” trebuie să fie „crm”.");
  if (!Array.isArray(numbers)) return fail(422, "„numbers” trebuie să fie o listă de numere (text).");
  if (numbers.length > 1000) return fail(422, `Maximum 1.000 de numere într-un lot (ai trimis ${numbers.length}).`);
  const invalid = numbers.map((n, i) => (isValidOrderNumber(n) ? null : `numbers[${i}]`)).filter((x): x is string => x !== null);
  if (invalid.length > 0) {
    return fail(422, "Numerele trebuie să fie text de 1–100 de caractere, fără spații la capete sau caractere de control.", { details: invalid.slice(0, 20) });
  }
  const key = request.headers.get("idempotency-key");
  if (key !== null && !key.startsWith("crm-history-")) return fail(422, "Idempotency-Key trebuie să înceapă cu crm-history-.");

  try {
    const result = await registerCrmHistory(numbers as string[]);
    if (result.registered > 0) auditWrite(request, "înregistrează numere istorice", `${result.registered} noi, ${result.ambiguous.length} ambigue`);
    return ok({ ok: true, namespace: REGISTRY_NAMESPACE, ...result });
  } catch (err) {
    console.error("[catalog-api] înregistrarea istoricului a eșuat:", err);
    return fail(500, "Înregistrarea nu a putut fi salvată durabil. Reîncearcă lotul (operația e idempotentă).");
  }
}
