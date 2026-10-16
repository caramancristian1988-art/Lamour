// API de citire a registrului de comenzi, pentru aplicații externe (ex. un buton din Excel care cere „comanda 40" și
// o scrie automat într-o foaie goală). Doar CITIRE: nu rezervă, nu marchează nimic ca extras.
//
// Autentificare: o cheie secretă pe integrator, în variabila de mediu REGISTRY_API_KEYS (mai multe chei, separate prin
// virgulă; fiecare programator primește a lui și poate fi revocată scoțând-o din listă). Cheia se trimite în antet:
//   X-API-Key: <cheia>      sau      Authorization: Bearer <cheia>
// NU în adresă (adresele apar în jurnale). Datele includ telefon și adresă, deci cheia se păstrează ca o parolă.
import { timingSafeEqual } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { EXPORT_HEADERS, exportRows } from "./orderRegistryExcel";
import type { RegistryOrder } from "./orderRegistry";

function configuredKeys(): string[] {
  return (process.env.REGISTRY_API_KEYS ?? "")
    .split(",")
    .map((k) => k.trim())
    .filter((k) => k.length >= 16);
}

function sameKey(a: string, b: string): boolean {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}

/** null = autorizat; altfel răspunsul de eroare gata de returnat. */
export function authorizeRegistryApi(request: NextRequest): NextResponse | null {
  const keys = configuredKeys();
  if (keys.length === 0) {
    return NextResponse.json({ error: "API-ul registrului nu este activat (lipsește REGISTRY_API_KEYS)." }, { status: 503 });
  }
  const bearer = request.headers.get("authorization")?.match(/^Bearer\s+(.+)$/i)?.[1];
  const provided = (request.headers.get("x-api-key") ?? bearer ?? "").trim();
  if (!provided || !keys.some((k) => sameKey(provided, k))) {
    return NextResponse.json({ error: "Cheie API lipsă sau invalidă." }, { status: 401, headers: { "WWW-Authenticate": "Bearer" } });
  }
  return null;
}

export type ApiFormat = "json" | "tsv" | "csv";

export function parseFormat(value: string | null): ApiFormat {
  return value === "tsv" || value === "csv" ? value : "json";
}

const NO_STORE = { "Cache-Control": "no-store" };

function cellText(v: string | number | null): string {
  return v === null || v === undefined ? "" : String(v);
}

/**
 * Comenzile ca tabel: ACELEAȘI coloane ca în fișierul Excel din Registru (un rând pe produs; id-ul comenzii se repetă).
 *  - json: { count, columns, rows: [ {coloană: valoare, ...} ] }
 *  - tsv:  text separat prin TAB, primul rând = antetul (cel mai simplu de împărțit în VBA: Split pe vbTab / vbLf)
 *  - csv:  separat prin virgulă, cu ghilimele unde trebuie (se deschide direct în Excel / Power Query)
 */
export function ordersResponse(orders: RegistryOrder[], format: ApiFormat): NextResponse {
  const rows = exportRows({ number: "" }, orders);
  const headers = [...EXPORT_HEADERS];

  if (format === "json") {
    return NextResponse.json(
      {
        count: orders.length,
        columns: headers,
        rows: rows.map((r) => Object.fromEntries(headers.map((h, i) => [h, r[i]]))),
      },
      { headers: NO_STORE }
    );
  }

  if (format === "tsv") {
    const clean = (v: string | number | null) => cellText(v).replace(/[\t\r\n]+/g, " ");
    const body = [headers, ...rows].map((r) => r.map(clean).join("\t")).join("\n");
    return new NextResponse(body + "\n", {
      headers: { "Content-Type": "text/tab-separated-values; charset=utf-8", ...NO_STORE },
    });
  }

  const esc = (v: string | number | null) => {
    const t = cellText(v);
    return /[",\r\n]/.test(t) ? `"${t.replace(/"/g, '""')}"` : t;
  };
  const body = [headers, ...rows].map((r) => r.map(esc).join(",")).join("\r\n");
  return new NextResponse(body + "\r\n", {
    headers: { "Content-Type": "text/csv; charset=utf-8", ...NO_STORE },
  });
}
