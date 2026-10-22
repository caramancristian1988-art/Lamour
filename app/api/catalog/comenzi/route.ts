import { NextRequest } from "next/server";
import { csvResponse, fail, readJsonObject, runRead, runWrite } from "@/lib/catalogApi";
import { createOrder, listOrders } from "@/lib/catalogApiOrders";

export const maxDuration = 60;

// GET /api/catalog/comenzi?etapa=noua|confirmata|predata_curier|anulata&status=in_asteptare|…|achitat|anulat&extragere=neextrasa|rezervata|extrasa
//                         &arhivate=da|nu&q=&de=2026-10-01&pana=2026-10-31&sortare=nou|vechi&pagina=1&perPagina=50|toate&format=json|csv
// Lista comenzilor (cu produse, prețuri, client, livrare, AWB), implicit toate (și cele arhivate — filtrezi cu arhivate=nu).
export async function GET(request: NextRequest) {
  const sp = request.nextUrl.searchParams;
  const csv = sp.get("format") === "csv";
  const response = await runRead(request, () =>
    listOrders({
      etapa: sp.get("etapa"),
      status: sp.get("status"),
      extragere: sp.get("extragere"),
      arhivate: sp.get("arhivate"),
      q: sp.get("q"),
      de: sp.get("de"),
      pana: sp.get("pana"),
      sortare: sp.get("sortare"),
      pagina: sp.get("pagina"),
      perPagina: sp.get("perPagina"),
    })
  );
  if (!csv || !response.ok) return response;

  type O = {
    id: string; orderNumber: string | null; createdAt: string; stage: string; stageLabel: string; status: string; archived: boolean; total: number | null;
    customer: { name: string; phone: string; email: string | null };
    delivery: { locality: string | null; address: string | null; zip: string | null; awbCode: string | null };
    items: { name: string; code: string | null; quantity: number }[];
  };
  const data = (await response.json()) as { comenzi: O[] };
  const columns = ["orderNumber", "id", "createdAt", "stage", "status", "archived", "name", "phone", "email", "locality", "address", "zip", "awbCode", "total", "items"];
  const rows = data.comenzi.map((o) => ({
    orderNumber: o.orderNumber, id: o.id, createdAt: o.createdAt, stage: o.stage, status: o.status, archived: o.archived,
    name: o.customer.name, phone: o.customer.phone, email: o.customer.email,
    locality: o.delivery.locality, address: o.delivery.address, zip: o.delivery.zip, awbCode: o.delivery.awbCode, total: o.total,
    items: o.items.map((i) => `${i.code ?? ""} ${i.name} x${i.quantity}`.trim()).join("; "),
  }));
  return csvResponse("comenzi.csv", columns, rows);
}

// POST /api/catalog/comenzi — creează o comandă (ca „Comandă din coș"; apare în Telegram și în admin).
// Corp: { customer: { name, phone, email? }, items: [{ product: "slug|id|cod", quantity }], delivery?: { locality, address, zip, ownDelivery },
//         note?, paymentByTransfer?, invoice?: { companyName, idno, address?, vat? }, confirm?: true }
export async function POST(request: NextRequest) {
  const read = await readJsonObject(request);
  if ("response" in read) return read.response;
  if (!read.body.items) return fail(422, "„items” este obligatoriu.");
  return runWrite(request, "creează comandă", JSON.stringify((read.body.customer as { name?: string } | undefined)?.name ?? read.body.name ?? ""), () => createOrder(read.body), 201);
}
