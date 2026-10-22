import { NextRequest } from "next/server";
import { apiActor, methodOverride, readJsonObject, runRead, runWrite } from "@/lib/catalogApi";
import { archiveOrder, getOrder, updateOrder } from "@/lib/catalogApiOrders";

export const maxDuration = 60;

type Ctx = { params: Promise<{ ref: string }> };

// GET /api/catalog/comenzi/<număr | id> — o comandă (ex. /comenzi/1052).
export async function GET(request: NextRequest, { params }: Ctx) {
  const { ref } = await params;
  return runRead(request, () => getOrder(ref));
}

// PATCH /api/catalog/comenzi/<ref> — modifică comanda. Corp (doar ce vrei să schimbi):
//   { stage: "confirmata" | "predata_curier" | "anulata" | "noua", status: "achitat" | …, orderNumber, read, archived,
//     customer: { name, phone, email }, delivery: { locality, address, zip, weightKg, codAmount, ownDelivery } }
// Schimbarea etapei are aceleași efecte ca în Telegram / admin: editează mesajul din Telegram, creează AWB-ul EVS la confirmare,
// anunță depozitarul / curierul. Răspunsul include `evs` (rezultatul încercării de AWB) când a fost cazul.
export async function PATCH(request: NextRequest, { params }: Ctx) {
  const { ref } = await params;
  const read = await readJsonObject(request);
  if ("response" in read) return read.response;
  return runWrite(request, "modifică comandă", `${ref} ${Object.keys(read.body).filter((k) => k === "stage" || k === "status" || k === "archived").map((k) => `${k}=${String(read.body[k])}`).join(" ")}`.trim(), () =>
    updateOrder(ref, read.body, apiActor(request))
  );
}

// DELETE /api/catalog/comenzi/<ref> — ARHIVEAZĂ comanda (nu o șterge: comenzile fac parte din registrul permanent). Anularea reală: PATCH { "stage": "anulata" }.
export async function DELETE(request: NextRequest, { params }: Ctx) {
  const { ref } = await params;
  return runWrite(request, "arhivează comandă", ref, () => archiveOrder(ref, apiActor(request)));
}

// POST /api/catalog/comenzi/<ref>[?_method=DELETE] — pentru clienți care știu doar GET și POST: modifică (ca PATCH) sau, cu ?_method=DELETE, arhivează.
export async function POST(request: NextRequest, ctx: Ctx) {
  return methodOverride(request, "PATCH") === "DELETE" ? DELETE(request, ctx) : PATCH(request, ctx);
}
