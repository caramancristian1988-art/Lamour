import { NextRequest } from "next/server";
import { EXTRACTION, listRegistryAll, type RegistryFilter } from "@/lib/orderRegistry";
import { authorizeRegistryApi, ordersResponse, parseFormat } from "@/lib/registryApi";

// GET /api/registru/comenzi?status=neextrasa|rezervata|extrasa|toate&q=...&arhivate=1&format=json|tsv|csv
// Lista de comenzi (implicit cele neextrase), un rând pe produs. Doar citire: nu marchează nimic ca extras.
export async function GET(request: NextRequest) {
  const denied = authorizeRegistryApi(request);
  if (denied) return denied;

  const sp = request.nextUrl.searchParams;
  const raw = sp.get("status");
  const status: RegistryFilter =
    raw === "toate" || raw === EXTRACTION.DONE || raw === EXTRACTION.RESERVED ? (raw as RegistryFilter) : EXTRACTION.NEW;
  const orders = await listRegistryAll({
    status,
    q: sp.get("q") ?? undefined,
    includeArchived: sp.get("arhivate") === "1",
  });
  return ordersResponse(orders, parseFormat(sp.get("format")));
}
