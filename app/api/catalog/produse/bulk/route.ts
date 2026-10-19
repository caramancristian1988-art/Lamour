import { NextRequest } from "next/server";
import { auditWrite, authorizeCatalogApi, fail, flushRefresh, newRefresh, ok, readJsonObject, type ApiResult } from "@/lib/catalogApi";
import { createProduct, deleteProduct, updateProduct } from "@/lib/catalogApiProducts";

export const maxDuration = 120;

// POST /api/catalog/produse/bulk — mai multe operații într-o singură cerere (max. 200), executate pe rând, FĂRĂ tranzacție:
// fiecare reușește sau eșuează separat, iar răspunsul spune pentru fiecare ce s-a întâmplat. Site-ul se reîmprospătează o singură dată, la final.
// Corp: { "ops": [ { "op": "create", "data": {…} }, { "op": "update", "ref": "slug", "data": {…} }, { "op": "delete", "ref": "slug", "cuVariante": true } ] }
export async function POST(request: NextRequest) {
  const denied = authorizeCatalogApi(request, "write");
  if (denied) return denied;
  const read = await readJsonObject(request);
  if ("response" in read) return read.response;

  const ops = read.body.ops;
  if (!Array.isArray(ops) || ops.length === 0) return fail(422, "Trimite „ops”: o listă nevidă de operații.");
  if (ops.length > 200) return fail(422, `Maximum 200 de operații într-o cerere (ai trimis ${ops.length}).`);

  const refresh = newRefresh();
  const results: { index: number; op: string; ref?: string; ok: boolean; status: number; error?: string; details?: string[]; data?: unknown }[] = [];

  for (let i = 0; i < ops.length; i++) {
    const item = (ops[i] ?? {}) as Record<string, unknown>;
    const op = String(item.op ?? "");
    const ref = typeof item.ref === "string" ? item.ref : undefined;
    const data = item.data && typeof item.data === "object" && !Array.isArray(item.data) ? (item.data as Record<string, unknown>) : undefined;
    let result: ApiResult<unknown>;
    try {
      if (op === "create") result = data ? await createProduct(data, refresh) : { ok: false, status: 422, error: "„data” lipsește." };
      else if (op === "update") result = ref && data ? await updateProduct(ref, data, refresh) : { ok: false, status: 422, error: "„ref” și „data” sunt obligatorii." };
      else if (op === "delete") result = ref ? await deleteProduct(ref, { withVariants: item.cuVariante === true }, refresh) : { ok: false, status: 422, error: "„ref” este obligatoriu." };
      else result = { ok: false, status: 422, error: `Operație necunoscută: „${op}” (create | update | delete).` };
    } catch (err) {
      console.error("[catalog-api] bulk:", err);
      result = { ok: false, status: 500, error: "Eroare internă." };
    }
    results.push(
      result.ok
        ? { index: i, op, ref, ok: true, status: 200, data: result.data }
        : { index: i, op, ref, ok: false, status: result.status, error: result.error, ...(result.details ? { details: result.details } : {}) }
    );
  }

  const succeeded = results.filter((r) => r.ok).length;
  if (succeeded > 0) {
    auditWrite(request, "operații în masă", `${succeeded}/${ops.length} reușite`);
    await flushRefresh(refresh);
  }
  return ok({ total: results.length, reusite: succeeded, esuate: results.length - succeeded, rezultate: results });
}
