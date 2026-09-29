import * as XLSX from "xlsx";
import { prisma } from "./prisma";
import { getCatalog } from "./catalog";
import { normalizeTiers, unitPriceFor, formatPrice, type PriceTier } from "./pricing";
import { CART_ORDER_SOURCE } from "./orderStages";
import { submitContactMessageAction, advanceOrderStage } from "./adminMessageActions";

// Comandă nouă dintr-un fișier Excel/CSV/PDF trimis de client (operatorii primesc adesea o listă de produse așa, în
// loc s-o retasteze pe site) — recunoaște produsele și cantitățile, apoi creează o comandă normală "din coș", care
// ajunge în Telegram exact ca oricare alta. Fără "use server": e folosit atât din acțiunea de admin
// (lib/adminOrderFileActions.ts), cât și direct din webhook-ul Telegram (nu poate fi apelat din browser).
//
// Fișierele reale (format extern, ex. cel al operatorului Ștefan) au un antet cu Client/Adresa/Telefon/Comandă Nr.
// și eventual un bloc "Necesita E-Factura" cu datele companiei — le recunoaștem automat, ca nici admin-ul nici
// Telegram-ul să nu ceară operatorului să le retasteze pe cele deja scrise în fișier.

export class OrderFileError extends Error {}

export const MAX_ORDER_FILE_BYTES = 5 * 1024 * 1024;
const MAX_ORDER_FILE_ROWS = 300;

export interface OrderFileProduct {
  id: string;
  name: string;
  code: string | null;
  slug: string;
  price: number;
  priceTiers: PriceTier[];
}

export interface ParsedOrderRow {
  line: number;
  /** Textul original al rândului/liniei — arătat operatorului ca să verifice potrivirea. */
  raw: string;
  quantity: number;
  matchedProductId: string | null;
}

export interface ParsedOrderHeader {
  clientName: string | null;
  clientPhone: string | null;
  clientAddress: string | null;
  /** "Comanda Nr. 72" din fișierul extern — doar referință afișată operatorului, NU numărul nostru intern. */
  externalOrderNumber: string | null;
  needsInvoice: boolean;
  companyName: string | null;
  companyIdno: string | null;
  companyAddress: string | null;
  companyVat: string | null;
  /**
   * "evs" = livrare prin curier EVS Express (AWB-ul se creează ca de obicei la confirmare);
   * "noi" = livrăm noi, fără AWB. Implicit "noi" cât timp fișierele nu au încă un rând clar de livrare
   * (cerut explicit — o comandă nu trebuie să primească un AWB "din greșeală" doar pentru că are adresă).
   */
  deliveryMethod: "evs" | "noi";
  /** "Se va achita prin transfer bancar" — comanda e plătită în avans, deci fără ramburs la curier. */
  paymentByTransfer: boolean;
}

export interface ParsedOrderFile {
  sourceType: "excel" | "csv" | "pdf";
  rows: ParsedOrderRow[];
  /** Catalogul întreg (id, nume, cod, preț, praguri) — pentru ca operatorul să poată alege manual orice produs. */
  products: OrderFileProduct[];
  header: ParsedOrderHeader;
}

const EMPTY_HEADER: ParsedOrderHeader = {
  clientName: null,
  clientPhone: null,
  clientAddress: null,
  externalOrderNumber: null,
  needsInvoice: false,
  companyName: null,
  companyIdno: null,
  companyAddress: null,
  companyVat: null,
  deliveryMethod: "noi",
  paymentByTransfer: false,
};

// ── potrivirea text → produs ───────────────────────────────────────────────────────────────────────────────────

function normalizeText(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

// Fișierele externe scriu codurile cu spații/liniuțe ("LT 6007") — le comparăm fără nimic din astea, ca să
// "LT 6007" din fișier să potrivească "LT6007" din baza noastră (cod SAU slug — vezi buildCatalogIndex).
function normalizeCode(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "");
}

function tokenize(value: string): string[] {
  return normalizeText(value)
    .split(" ")
    .filter((t) => t.length > 1);
}

interface CatalogEntry {
  id: string;
  nameTokens: string[];
  code: string | null;
  /** Slug-ul e uneori folosit deliberat ca "cod extern" (ex. produse aliniate la codul unui furnizor/partener). */
  slugCode: string;
}

function buildCatalogIndex(products: { id: string; name: string; code: string | null; slug: string }[]): CatalogEntry[] {
  return products.map((p) => ({
    id: p.id,
    nameTokens: tokenize(p.name),
    code: p.code ? normalizeCode(p.code) : null,
    slugCode: normalizeCode(p.slug),
  }));
}

// Un cod poate apărea în text ca UN token deja lipit ("9A8EC8") sau despărțit de fișier ("LT 6007" -> tokenii
// "lt","6007") — încercăm să-l reconstituim lipind 2-4 tokeni consecutivi (fără spații între ei) și comparăm
// exact cu codul/slug-ul (fără spații). Lipirea întregului rând ar strica granițele de cuvinte (ex. "6007"
// s-ar lipi și de "prosop" imediat după), de-aia ferestruim doar câțiva tokeni deodată, nu tot rândul.
function rowContainsCode(rowTokenList: string[], code: string): boolean {
  if (!code) return false;
  for (let i = 0; i < rowTokenList.length; i++) {
    let joined = "";
    for (let j = i; j < Math.min(i + 4, rowTokenList.length); j++) {
      joined += rowTokenList[j];
      if (joined === code) return true;
      if (joined.length > code.length) break;
    }
  }
  return false;
}

function scoreEntry(rowTokens: Set<string>, rowTokenList: string[], entry: CatalogEntry): number {
  // "LT 6007" din fișier -> tokenii "lt","6007" -> reconstituit "lt6007", comparat cu codul/slug-ul din bază
  // (tot fără spații), ca să prindă produsul indiferent cum a despărțit fișierul litera de cifre.
  if (rowContainsCode(rowTokenList, entry.code ?? "") || rowContainsCode(rowTokenList, entry.slugCode)) return 1;
  if (entry.nameTokens.length === 0) return 0;
  let hit = 0;
  for (const t of entry.nameTokens) if (rowTokens.has(t)) hit++;
  if (hit === 0) return 0;
  const coverage = hit / entry.nameTokens.length; // cât din numele produsului e prezent în rând
  const jaccard = hit / (rowTokens.size + entry.nameTokens.length - hit);
  return coverage * 0.75 + jaccard * 0.25;
}

/** Cel mai bun produs pentru un text de rând, doar dacă potrivirea e clară (cod exact, sau scor mare și fără ambiguitate). */
function matchText(raw: string, index: CatalogEntry[]): string | null {
  const rowNormalized = normalizeText(raw);
  const rowTokenList = rowNormalized.split(" ").filter(Boolean);
  const rowTokens = new Set(rowTokenList.filter((t) => t.length > 1));
  if (rowTokens.size === 0 || index.length === 0) return null;
  let bestId: string | null = null;
  let bestScore = 0;
  let secondScore = 0;
  for (const entry of index) {
    const score = scoreEntry(rowTokens, rowTokenList, entry);
    if (score > bestScore) {
      secondScore = bestScore;
      bestScore = score;
      bestId = entry.id;
    } else if (score > secondScore) {
      secondScore = score;
    }
  }
  if (!bestId) return null;
  if (bestScore >= 1) return bestId; // cod/slug exact
  if (bestScore >= 0.82 && bestScore - secondScore >= 0.12) return bestId;
  return null;
}

// ── extragerea cantității ──────────────────────────────────────────────────────────────────────────────────────

function str(v: unknown): string {
  return String(v ?? "").trim();
}

function parsePositiveInt(v: unknown): number | null {
  if (typeof v === "number" && Number.isFinite(v) && v > 0) return Math.round(v);
  const s = str(v).replace(/\s/g, "");
  if (!/^\d{1,6}$/.test(s)) return null;
  const n = Number(s);
  return n > 0 ? n : null;
}

// ── antetul comenzii (Client/Adresa/Telefon/Comandă Nr./factură) ──────────────────────────────────────────────

const LABEL_PATTERNS: { key: keyof Pick<ParsedOrderHeader, "clientName" | "clientPhone" | "clientAddress" | "externalOrderNumber" | "companyName" | "companyIdno" | "companyAddress" | "companyVat">; re: RegExp }[] = [
  { key: "clientName", re: /^client\s*:\s*(.+)$/i },
  { key: "clientPhone", re: /^telefon\s*:\s*(.+)$/i },
  { key: "clientAddress", re: /^adresa\s*:\s*(.+)$/i },
  { key: "externalOrderNumber", re: /^comanda\s*n?r\.?\s*:?\s*(\d+)/i },
  { key: "companyName", re: /^(denumire\s*companie|companie|denumire)\s*:\s*(.+)$/i },
  { key: "companyIdno", re: /^(idno|cod\s*fiscal)\s*:\s*(.+)$/i },
  { key: "companyAddress", re: /^adresa\s*juridic[aă]\s*:\s*(.+)$/i },
  { key: "companyVat", re: /^(cod\s*tva|tva)\s*:\s*(.+)$/i },
];

/** Scanează toate liniile (antet + subsol) după câmpuri cunoscute — independent de unde e tabelul de produse. */
function extractOrderHeaderFields(lines: string[]): ParsedOrderHeader {
  const header: ParsedOrderHeader = { ...EMPTY_HEADER };
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    if (/^necesit[aă]\s*e[\s-]?factur[aă]/i.test(trimmed)) {
      header.needsInvoice = true;
      continue;
    }
    if (/livr(are|at|[aă]m)/i.test(trimmed) && /\bevs\b/i.test(trimmed)) {
      header.deliveryMethod = "evs";
      continue;
    }
    if (/livr(are|at|[aă]m)/i.test(trimmed) && /\b(noi|proprie|intern[aă])\b/i.test(trimmed)) {
      header.deliveryMethod = "noi";
      continue;
    }
    if (/(achit|pl[aă]t)/i.test(trimmed) && /transfer/i.test(trimmed)) {
      header.paymentByTransfer = true;
      continue;
    }

    for (const { key, re } of LABEL_PATTERNS) {
      const m = trimmed.match(re);
      if (!m) continue;
      const value = m[m.length - 1]?.trim();
      if (value && !header[key]) header[key] = value;
      break;
    }
  }
  // "Client: Test" / "Telefon: Test" etc. nu sunt valori reale — un fișier fără antet complet nu trebuie
  // să lase câmpuri pe jumătate completate (numele fără telefon, de ex.) — dar lăsăm asta pe seama
  // apelantului (are nevoie de AMBELE, name+phone, ca să poată sări peste rescrierea din operator/caption).
  return header;
}

// ── EXCEL / CSV ─────────────────────────────────────────────────────────────────────────────────────────────────

const CODE_HEADERS = ["cod", "sku", "code", "articol nr", "art nr"];
const QTY_HEADERS = ["cant", "cantitate", "qty", "buc", "bucati", "nr", "numar", "piese"];
const PRICE_HEADERS = ["pret", "price", "cost", "valoare", "suma", "lei", "mdl"];
const NAME_HEADERS = ["denumire", "produs", "nume", "articol", "descriere", "item", "product", "name", "title"];

function headerKind(header: string): "code" | "qty" | "price" | "name" | null {
  const n = normalizeText(header);
  if (!n) return null;
  if (CODE_HEADERS.some((k) => n === k || n.startsWith(k))) return "code";
  if (QTY_HEADERS.some((k) => n === k || n.startsWith(k))) return "qty";
  if (PRICE_HEADERS.some((k) => n.includes(k))) return "price";
  if (NAME_HEADERS.some((k) => n.includes(k))) return "name";
  return null;
}

function parseTabularRows(matrix: unknown[][], index: CatalogEntry[]): { rows: ParsedOrderRow[]; headerRowIdx: number } {
  const rows: ParsedOrderRow[] = [];
  if (matrix.length === 0) return { rows, headerRowIdx: -1 };

  // Antetul (Client/Adresa/...) poate fi scris ca rânduri înainte de tabel — găsim primul rând care arată
  // ca antetul tabelului de produse, ca să nu tratăm acele rânduri ca produse.
  let headerRowIdx = matrix.findIndex((r) => {
    const kinds = (r ?? []).map((c) => headerKind(str(c)));
    return kinds.includes("name") || kinds.includes("code");
  });
  if (headerRowIdx === -1) headerRowIdx = 0;

  const header = (matrix[headerRowIdx] ?? []).map((c) => str(c));
  const kinds = header.map(headerKind);
  const nameIdx = kinds.indexOf("name");
  const codeIdx = kinds.indexOf("code");
  const qtyIdx = kinds.indexOf("qty");
  const hasHeader = nameIdx >= 0 || codeIdx >= 0;
  const dataRows = hasHeader ? matrix.slice(headerRowIdx + 1) : matrix;
  let line = headerRowIdx + (hasHeader ? 2 : 1);

  for (const cells of dataRows) {
    if (rows.length >= MAX_ORDER_FILE_ROWS) break;
    if (!cells || cells.every((c) => str(c) === "")) { line++; continue; }

    let raw: string;
    let quantity: number;
    if (hasHeader) {
      const nameCell = nameIdx >= 0 ? str(cells[nameIdx]) : "";
      const codeCell = codeIdx >= 0 ? str(cells[codeIdx]) : "";
      raw = [codeCell, nameCell].filter(Boolean).join(" — ") || nameCell || codeCell;
      quantity = (qtyIdx >= 0 ? parsePositiveInt(cells[qtyIdx]) : null) ?? 1;
    } else {
      // Fără antet recunoscut: numele e cea mai lungă celulă text, cantitatea e cel mai mic număr întreg din rând
      // (de obicei prețul/totalul e mai mare decât cantitatea) — implicit 1 dacă nu găsim niciun număr.
      const texts = cells.map((c) => str(c));
      raw = texts.reduce((a, b) => (b.length > a.length ? b : a), "");
      const nums = cells.map((c) => parsePositiveInt(c)).filter((n): n is number => n !== null);
      quantity = nums.length > 0 ? Math.min(...nums) : 1;
    }

    if (raw) {
      rows.push({ line, raw, quantity, matchedProductId: matchText(raw, index) });
    }
    line++;
  }
  return { rows, headerRowIdx };
}

/** Rândurile din matrice DINAINTEA tabelului de produse — text "Label: value" per celulă sau pe 2 celule alăturate. */
function headerLinesFromMatrix(matrix: unknown[][], headerRowIdx: number): string[] {
  const lines: string[] = [];
  for (const row of matrix.slice(0, Math.max(0, headerRowIdx))) {
    const cells = (row ?? []).map((c) => str(c)).filter(Boolean);
    if (cells.length === 0) continue;
    if (cells.length >= 2 && !cells[0].includes(":")) lines.push(`${cells[0]}: ${cells.slice(1).join(" ")}`);
    else lines.push(cells.join(" "));
  }
  return lines;
}

// ── PDF ─────────────────────────────────────────────────────────────────────────────────────────────────────────

const PDF_NOISE_RE = /^(total|subtotal|pagina|page|nr\.?\s*crt|data\b|semn[aă]tur[aă]|factur[aă]|oferta\b|cod\s*fiscal|idno|tva|deviz)/i;

function isPdfNoiseLine(line: string): boolean {
  if (line.length < 3) return true;
  if (PDF_NOISE_RE.test(line)) return true;
  if (!/[a-zA-ZăâîșțĂÂÎȘȚ]{3,}/.test(line)) return true;
  return false;
}

function extractQuantityFromPdfLine(line: string): number {
  // Text extras dintr-un tabel PDF păstrează de obicei spațierea coloanelor — încercăm întâi coloanele
  // (primul număr întreg după prima coloană), altfel cel mai mic număr din linie (de obicei cantitatea, nu prețul).
  const cols = line.split(/\s{2,}|\t/).map((s) => s.trim()).filter(Boolean);
  if (cols.length >= 2) {
    for (let i = 1; i < cols.length; i++) {
      const n = parsePositiveInt(cols[i]);
      if (n !== null && n < 100000) return n;
    }
  }
  const matches = [...line.matchAll(/\d{1,5}/g)].map((m) => Number(m[0])).filter((n) => n > 0);
  return matches.length > 0 ? Math.min(...matches) : 1;
}

// O linie "de numere" (coloanele Cantitate/Preț/Total) — fără nicio literă în afară de "lei"/"mdl". În PDF-urile
// cu nume de produs pe mai multe rânduri (celula se înfășoară), coloanele numerice ajung pe propriul rând, rupte
// de cod+nume — vezi buildPdfProductRows.
function isNumbersOnlyLine(line: string): boolean {
  const stripped = line.replace(/\b(lei|mdl)\b/gi, "").trim();
  return stripped.length > 0 && /^[\d.,\s]+$/.test(stripped);
}

function quantityFromNumbersLine(line: string): number {
  const tokens = line.split(/\s+/).filter(Boolean);
  // Cantitatea e un întreg simplu (fără punct zecimal) — prețul/totalul au mereu ".XX". Prima potrivire =
  // prima coloană (ordinea din tabel: Cantitate, Pret, Total).
  for (const t of tokens) {
    if (/^\d+$/.test(t)) return Number(t);
  }
  return extractQuantityFromPdfLine(line);
}

// Codul de produs extern (ex. "LT 6007") apare la începutul rândului, lipit de prima bucată din nume
// ("LT 6007 Prosop de"). Îl recunoaștem ca 1-4 litere urmate de 3-8 cifre, cu spațiu/liniuță opțional(ă).
const LEADING_CODE_RE = /^([A-Za-z]{1,4}[\s-]?\d{3,8})\b\s*/;

/**
 * Tabelul de produse dintr-un PDF cu nume înfășurate pe mai multe linii: un rând nou începe la o linie cu
 * cod de produs la început; liniile următoare (fără cod, cu litere) se adaugă la nume; o linie "de numere"
 * încheie rândul curent (de-acolo vine cantitatea). Fără cod la început de linie pentru primul rând dintr-un
 * fișier fără coduri, tratăm prima linie ca început de rând oricum.
 */
function buildPdfProductRows(bodyLines: string[], index: CatalogEntry[], startLine: number): ParsedOrderRow[] {
  const rows: ParsedOrderRow[] = [];
  let nameParts: string[] = [];
  let rowStartLine = startLine;

  const flush = (numbersLine: string | null) => {
    if (nameParts.length === 0) return;
    const raw = nameParts.join(" ").replace(/\s+/g, " ").trim();
    if (raw) {
      const quantity = numbersLine ? quantityFromNumbersLine(numbersLine) : 1;
      rows.push({ line: rowStartLine, raw, quantity, matchedProductId: matchText(raw, index) });
    }
    nameParts = [];
  };

  bodyLines.forEach((rawLine, i) => {
    const line = rawLine.trim();
    if (!line) return;
    if (isNumbersOnlyLine(line)) {
      flush(line);
      return;
    }
    if (LEADING_CODE_RE.test(line) && nameParts.length > 0) {
      // Un cod nou apare fără ca rândul anterior să fi primit linia de numere (fișier neașteptat) — închidem
      // rândul anterior fără cantitate confirmată (implicit 1) și pornim unul nou, ca să nu pierdem produsul.
      flush(null);
      rowStartLine = startLine + i;
    } else if (nameParts.length === 0) {
      rowStartLine = startLine + i;
    }
    nameParts.push(line);
  });
  flush(null);

  return rows.slice(0, MAX_ORDER_FILE_ROWS);
}

let pdfParseFn: ((data: Uint8Array) => Promise<{ text: string; numpages: number }>) | null = null;
async function getPdfParse() {
  if (!pdfParseFn) {
    // Fișierul de intrare al pachetului (index.js) are un mod de depanare care citește un PDF de test la orice
    // require — ocolit cerând direct implementarea din lib/.
    const mod = await import("pdf-parse/lib/pdf-parse.js");
    pdfParseFn = (mod as unknown as { default?: typeof pdfParseFn }).default ?? (mod as unknown as typeof pdfParseFn);
  }
  return pdfParseFn!;
}

async function parsePdfRows(buffer: Buffer, index: CatalogEntry[]): Promise<{ rows: ParsedOrderRow[]; header: ParsedOrderHeader }> {
  const pdfParse = await getPdfParse();
  let text: string;
  try {
    // Uint8Array, NU Buffer: pdf.js din pdf-parse clonează intrarea cu `new value.constructor(value)` — pentru un
    // Buffer asta e `new Buffer()` (deprecat), care pune fișierele sub 4 KB în pool-ul comun al Node, la un offset
    // oarecare, iar pdf.js citește apoi de la începutul pool-ului -> "bad XRef entry" la întâmplare (~1 din 3
    // încercări pe același PDF mic). Un Uint8Array se copiază mereu într-o zonă proprie, exact cât fișierul.
    const data = await pdfParse(new Uint8Array(buffer));
    text = data.text;
  } catch (err) {
    console.error("comandă din fișier: pdf-parse a eșuat:", err);
    throw new OrderFileError("Nu am putut citi acest PDF — pare stricat sau nu conține text (ex. e doar o poză scanată).");
  }
  const allLines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const header = extractOrderHeaderFields(allLines);

  // Tabelul de produse: căutăm antetul ("Cod produs ... Denumire ... Cantitate") — dacă îl găsim, parsăm DOAR
  // regiunea dintre el și "Suma totala" cu logica de nume-pe-mai-multe-linii; altfel cădem pe parsarea veche,
  // linie cu linie (fișiere fără acest format exact).
  // Strict, doar "cod produs": un antet mai vag ("Denumire ... Cantitate", posibil într-un fișier vechi,
  // cu totul alt format) NU trebuie să pornească parsarea nouă (nume-pe-mai-multe-linii) — ar rupe
  // parsarea veche, linie cu linie, care oricum se descurcă bine cu un singur rând per produs.
  const tableStartIdx = allLines.findIndex((l) => normalizeText(l).includes("cod produs"));

  let rows: ParsedOrderRow[];
  if (tableStartIdx >= 0) {
    const tableEndIdx = allLines.findIndex((l, i) => i > tableStartIdx && /suma\s*total/i.test(l));
    const bodyLines = allLines.slice(tableStartIdx + 1, tableEndIdx >= 0 ? tableEndIdx : undefined);
    rows = buildPdfProductRows(bodyLines, index, tableStartIdx + 2);
  } else {
    rows = [];
    let line = 1;
    for (const raw of allLines) {
      line++;
      if (rows.length >= MAX_ORDER_FILE_ROWS) break;
      if (isPdfNoiseLine(raw)) continue;
      rows.push({ line, raw, quantity: extractQuantityFromPdfLine(raw), matchedProductId: matchText(raw, index) });
    }
  }
  return { rows, header };
}

// ── intrare comună ──────────────────────────────────────────────────────────────────────────────────────────────

export async function parseOrderFile(buffer: Buffer, filename: string): Promise<ParsedOrderFile> {
  if (buffer.length === 0) throw new OrderFileError("Fișierul e gol.");
  if (buffer.length > MAX_ORDER_FILE_BYTES) throw new OrderFileError("Fișierul e prea mare (maxim 5 MB).");

  const { products: catalogProducts } = await getCatalog();
  const index = buildCatalogIndex(catalogProducts.map((p) => ({ id: p.id, name: p.name, code: p.code, slug: p.slug })));
  const products: OrderFileProduct[] = catalogProducts.map((p) => ({
    id: p.id,
    name: p.name,
    code: p.code,
    slug: p.slug,
    price: p.price,
    priceTiers: normalizeTiers({ priceTiers: p.priceTiers, bulkMinQty: p.bulkMinQty, bulkPrice: p.bulkPrice }),
  }));

  const ext = filename.toLowerCase().split(".").pop() ?? "";
  if (ext === "pdf") {
    const { rows, header } = await parsePdfRows(buffer, index);
    if (rows.length === 0) throw new OrderFileError("Nu am găsit nicio linie cu produse în acest PDF.");
    return { sourceType: "pdf", rows, products, header };
  }

  let wb: XLSX.WorkBook;
  try {
    wb = XLSX.read(buffer, { type: "buffer", cellDates: false });
  } catch {
    throw new OrderFileError("Nu am putut citi fișierul. Folosește un fișier Excel (.xlsx), CSV sau PDF.");
  }
  const sheetName = wb.SheetNames[0];
  const ws = sheetName ? wb.Sheets[sheetName] : undefined;
  if (!ws) throw new OrderFileError("Fișierul nu conține nicio foaie.");
  const matrix = XLSX.utils.sheet_to_json<unknown[]>(ws, { header: 1, defval: "", blankrows: true, raw: true });
  const { rows, headerRowIdx } = parseTabularRows(matrix, index);
  if (rows.length === 0) throw new OrderFileError("Nu am găsit niciun rând cu produse în acest fișier.");
  const header = extractOrderHeaderFields(headerLinesFromMatrix(matrix, headerRowIdx));
  return { sourceType: ext === "csv" ? "csv" : "excel", rows, products, header };
}

// ── crearea comenzii ────────────────────────────────────────────────────────────────────────────────────────────

export interface CreateOrderFromFileItem {
  productId: string;
  quantity: number;
}

export interface CreateOrderFromFileInput {
  name: string;
  phone: string;
  email?: string | null;
  deliveryLocality?: string | null;
  deliveryAddress?: string | null;
  deliveryZip?: string | null;
  /** Notă internă (ex. "Comandă din fișier: comanda.xlsx") — apare ca "Mesaj client" pe fișă/Telegram. */
  note?: string | null;
  items: CreateOrderFromFileItem[];
  /** "Necesită E-Factură" din fișier — trimite automat contabilului (are nevoie de companyName+companyIdno). */
  needsInvoice?: boolean;
  companyName?: string | null;
  companyIdno?: string | null;
  companyAddress?: string | null;
  companyVat?: string | null;
  /**
   * Comenzile generate direct din fișier nu au nevoie de confirmarea manuală din Telegram — sar direct la
   * etapa "confirmată" (pleacă direct la depozitar). Implicit true pentru fluxul din fișier.
   */
  autoConfirm?: boolean;
  /** Livrăm noi (fără curier EVS / AWB) — vezi ContactMessage.ownDelivery. */
  ownDelivery?: boolean;
  /** Plătită prin transfer bancar — fără ramburs (COD 0), ca un eventual curier să nu mai încaseze încă o dată. */
  paymentByTransfer?: boolean;
}

export interface CreateOrderFromFileResult {
  ok: boolean;
  error?: string;
  orderNumber?: string | null;
}

/**
 * Creează o comandă "din coș" pornind de la produse + cantități deja recunoscute (fișier Excel/PDF, verificate de un
 * operator sau — pentru Telegram — doar cele cu potrivire clară). Prețul se ia mereu din baza de date (niciodată din
 * client), cu pragurile de cantitate aplicate. Trimite comanda mai departe exact ca CheckoutPanel (submitContactMessageAction),
 * deci apare în Telegram cu aceleași butoane și fluxul de fulfillment obișnuit — apoi, dacă autoConfirm, o avansează
 * direct la "confirmată" (advanceOrderStage), exact ce ar face operatorul apăsând "Confirmă" — depozitarul o
 * primește imediat, iar AWB-ul se creează doar dacă există deja adresă+cod poștal de livrare (nesetate aici cât
 * timp fișierele nu au un rând clar "livrare EVS" — vezi ParsedOrderHeader.deliveryMethod).
 */
export async function createCartOrderFromParsedItems(input: CreateOrderFromFileInput): Promise<CreateOrderFromFileResult> {
  const name = input.name.trim();
  const phone = input.phone.trim();
  if (!name || !phone) return { ok: false, error: `Lipsește ${!name ? "numele" : "numărul de telefon"}.` };

  const cleaned = input.items.filter((it) => it.productId && Number.isFinite(it.quantity) && it.quantity > 0);
  if (cleaned.length === 0) return { ok: false, error: "Nu există niciun produs recunoscut în comandă." };
  if (cleaned.length > 200) return { ok: false, error: "Prea multe produse într-o singură comandă (maxim 200)." };

  const dbProducts = await prisma.product.findMany({
    where: { id: { in: cleaned.map((it) => it.productId) } },
    select: { id: true, name: true, slug: true, price: true, priceTiers: true, bulkMinQty: true, bulkPrice: true },
  });
  const byId = new Map(dbProducts.map((p) => [p.id, p]));

  const lines: { name: string; slug: string; qty: number; unitPrice: number }[] = [];
  for (const it of cleaned) {
    const p = byId.get(it.productId);
    if (!p) continue;
    const tiers = normalizeTiers({ priceTiers: p.priceTiers, bulkMinQty: p.bulkMinQty, bulkPrice: p.bulkPrice });
    lines.push({ name: p.name, slug: p.slug, qty: Math.floor(it.quantity), unitPrice: unitPriceFor(p.price, tiers, it.quantity) });
  }
  if (lines.length === 0) return { ok: false, error: "Produsele din fișier nu mai există în catalog." };

  const subtotal = lines.reduce((s, l) => s + l.unitPrice * l.qty, 0);
  const address = [input.deliveryLocality, input.deliveryAddress, input.deliveryZip].map((s) => s?.trim()).filter(Boolean).join(", ") || null;
  // Plata intră în notă, NU pe un rând separat: parseCartOrderMessage (lib/orderMessage.ts) respinge tot mesajul la
  // orice rând necunoscut, iar Telegramul și fișa tipărită ar cădea pe formatul brut.
  const note =
    [input.note?.trim(), input.paymentByTransfer ? "Plată: transfer bancar (fără ramburs)." : null].filter(Boolean).join(" ") || null;

  const itemsText = lines
    .map((l) => `• ${l.name}\n   ${l.qty} buc × ${formatPrice(l.unitPrice)} MDL = ${formatPrice(l.unitPrice * l.qty)} MDL`)
    .join("\n");
  // Blocul de factură trebuie să fie identic ca marcaj cu cel de pe site (CheckoutPanel) — extractInvoiceBlock
  // din lib/telegram.ts îl recunoaște după "🧾 CERE FACTURĂ", ca trimiterea automată la contabil (deja
  // existentă în submitContactMessageAction) să funcționeze neschimbată și pentru comenzile din fișier.
  const needsInvoice = Boolean(input.needsInvoice);
  const ownDelivery = Boolean(input.ownDelivery);
  const paymentByTransfer = Boolean(input.paymentByTransfer);
  const deliveryLine = ownDelivery
    ? `Livrare: livrăm noi (fără curier EVS)${address ? ` — ${address}` : ""}`
    : address
      ? `Livrare: ${address}`
      : null;
  const message = [
    "Produse comandate:",
    itemsText,
    "",
    `Subtotal: ${formatPrice(subtotal)} MDL`,
    deliveryLine ? "" : null,
    deliveryLine,
    needsInvoice ? "\n🧾 CERE FACTURĂ (companie):" : null,
    needsInvoice ? `Denumire: ${input.companyName?.trim() || "(de completat)"}` : null,
    needsInvoice ? `IDNO / Cod fiscal: ${input.companyIdno?.trim() || "(de completat)"}` : null,
    needsInvoice && input.companyAddress?.trim() ? `Adresa juridică: ${input.companyAddress.trim()}` : null,
    needsInvoice && input.companyVat?.trim() ? `Cod TVA: ${input.companyVat.trim()}` : null,
    note ? "" : null,
    note ? `Mesaj client: ${note}` : null,
  ]
    .filter((l) => l !== null)
    .join("\n");

  const formData = new FormData();
  formData.set("name", name);
  formData.set("phone", phone);
  if (input.email?.trim()) formData.set("email", input.email.trim());
  formData.set("message", message);
  formData.set("source", CART_ORDER_SOURCE);
  formData.set("productSlugs", lines.map((l) => l.slug).join(","));
  formData.set("orderItems", JSON.stringify(lines.map((l) => ({ slug: l.slug, quantity: l.qty }))));
  if (input.deliveryLocality?.trim()) formData.set("deliveryLocality", input.deliveryLocality.trim());
  if (input.deliveryAddress?.trim()) formData.set("deliveryAddress", input.deliveryAddress.trim());
  if (input.deliveryZip?.trim()) formData.set("deliveryZip", input.deliveryZip.trim());
  formData.set("deliveryWeightKg", String(lines.reduce((s, l) => s + l.qty, 0)));
  formData.set("deliveryCodAmount", String(paymentByTransfer ? 0 : subtotal));

  const result = await submitContactMessageAction({}, formData);
  if (result.error) return { ok: false, error: result.error };

  // Marcajul se pune aici, pe server (nu prin formularul public submitContactMessageAction, pe care îl poate
  // apela oricine) și ÎNAINTE de confirmare, ca etapele să nu încerce AWB pentru o livrare proprie.
  if (ownDelivery && result.id) {
    await prisma.contactMessage.update({ where: { id: result.id }, data: { ownDelivery: true } });
  }

  if (input.autoConfirm !== false && result.id) {
    try {
      await advanceOrderStage(result.id, "confirmata");
    } catch (err) {
      // O comandă rămasă la "nouă" tot ajunge la operator din Admin → Cereri și comenzi — nu blocăm crearea.
      console.error("comandă din fișier: avansarea automată la „confirmată” a eșuat:", err);
    }
  }

  return { ok: true, orderNumber: result.orderNumber ?? null };
}
