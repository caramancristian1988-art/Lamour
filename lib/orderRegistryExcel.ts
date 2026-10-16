// Fișierul Excel al unui export de comenzi. Structură simplă, fără celule îmbinate: antet pe primul rând,
// apoi UN RÂND PENTRU FIECARE PRODUS al fiecărei comenzi (ID-ul comenzii se repetă pe rânduri), cu valori numerice reale.
// Nu se transmite nimic doar prin culoare — toate informațiile sunt text/cifre în celule.
import * as XLSX from "xlsx";
import { formatDateTime, type ExportSummary, type RegistryOrder } from "./orderRegistry";

export const EXPORT_HEADERS = [
  "Nr. export",
  "ID comandă",
  "Data comenzii",
  "Status comandă",
  "Status extragere",
  "Client",
  "Telefon",
  "Adresa de livrare",
  "Cod produs",
  "Produs",
  "Cantitate",
  "Preț unitar (lei)",
  "Total produs (lei)",
  "Total comandă (lei)",
  "Metoda de plată",
  "Observații",
] as const;

type Cell = string | number | null;

export function exportRows(exp: { number: number | string }, orders: RegistryOrder[]): Cell[][] {
  const rows: Cell[][] = [];
  for (const o of orders) {
    const base = (item: { name: string; code: string | null; quantity: number; unitPrice: number | null; lineTotal: number | null; estimated: boolean } | null): Cell[] => [
      exp.number,
      o.ref,
      formatDateTime(o.createdAt),
      o.stageLabel,
      o.extractionLabel,
      o.name,
      o.phone,
      o.address,
      item?.code ?? "",
      item?.name ?? "Fără produse înregistrate",
      item?.quantity ?? null,
      item?.unitPrice ?? null,
      item?.lineTotal ?? null,
      o.total,
      o.paymentMethod,
      item?.estimated ? "Preț calculat din catalogul actual (comandă veche, fără preț salvat)" : "",
    ];
    if (o.items.length === 0) rows.push(base(null));
    else for (const item of o.items) rows.push(base(item));
  }
  return rows;
}

export function buildExportWorkbook(exp: { number: number | string }, orders: RegistryOrder[]): Buffer {
  const data: Cell[][] = [[...EXPORT_HEADERS], ...exportRows(exp, orders)];
  const ws = XLSX.utils.aoa_to_sheet(data);
  ws["!cols"] = EXPORT_HEADERS.map((h, i) => ({
    wch: Math.min(60, Math.max(h.length, ...data.slice(1).map((r) => String(r[i] ?? "").length)) + 2),
  }));
  // Antetul rămâne vizibil la derulare (cititoarele de ecran și filtrele Excel îl recunosc ca antet).
  ws["!autofilter"] = { ref: XLSX.utils.encode_range({ s: { r: 0, c: 0 }, e: { r: Math.max(data.length - 1, 0), c: EXPORT_HEADERS.length - 1 } }) };
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Comenzi");
  return XLSX.write(wb, { type: "buffer", bookType: "xlsx" }) as Buffer;
}

/** Lista curentă (un filtru) descărcată ca Excel, FĂRĂ a rezerva sau marca nimic ca extras — doar o copie a datelor. */
export function buildListWorkbook(orders: RegistryOrder[]): Buffer {
  return buildExportWorkbook({ number: "" }, orders);
}

export function listFilename(filter: string, date = new Date()): string {
  const names: Record<string, string> = { neextrasa: "neextrase", rezervata: "rezervate", extrasa: "extrase", toate: "toate" };
  return `comenzi_${names[filter] ?? filter}_${date.toISOString().slice(0, 10)}.xlsx`;
}

export function exportFilename(exp: Pick<ExportSummary, "number">, date = new Date()): string {
  return `comenzi_neextrase_${date.toISOString().slice(0, 10)}_export-${exp.number}.xlsx`;
}
