import * as XLSX from "xlsx";
import type { Product } from "@prisma/client";
import { prisma } from "./prisma";
import { parseDecimalInput } from "./pricing";

// Export / import de produse în Excel. Aceeași definiție de coloane servește ambele sensuri, ca un fișier exportat să
// poată fi editat și reimportat. Fără "use server": e folosit doar din rutele API de admin (app/api/admin/products-*).

export class ProductsFileError extends Error {}

type FieldKey =
  | "id" | "code" | "name" | "slug" | "category" | "description" | "price" | "oldPrice" | "bulkMinQty" | "bulkPrice"
  | "priceTiers" | "packageQuantity" | "weightKg" | "brand" | "badge" | "availability" | "installmentsEnabled"
  | "warrantyEnabled" | "salesCount" | "image" | "images" | "specifications" | "variantGroupCode" | "variantLabel"
  | "rating" | "reviewCount" | "popupEnabled" | "createdAt";

interface Column {
  key: FieldKey;
  header: string;
  /** Titluri acceptate la import, normalizate (fără diacritice/semne, litere mici). */
  aliases: string[];
  width: number;
  /** Doar informativ la export: se ignoră la import și nu contează la „identic”. */
  info?: boolean;
}

export const PRODUCT_COLUMNS: Column[] = [
  { key: "id", header: "ID", aliases: ["id"], width: 26, info: true },
  { key: "code", header: "Cod produs", aliases: ["cod produs", "cod", "code", "sku"], width: 14 },
  { key: "name", header: "Nume", aliases: ["nume", "denumire", "name", "titlu", "produs"], width: 42 },
  { key: "slug", header: "Slug", aliases: ["slug", "url"], width: 34 },
  { key: "category", header: "Categorie", aliases: ["categorie", "category"], width: 26 },
  { key: "description", header: "Descriere", aliases: ["descriere", "description"], width: 50 },
  { key: "price", header: "Preț (MDL)", aliases: ["pret mdl", "pret", "price"], width: 12 },
  { key: "oldPrice", header: "Preț vechi (MDL)", aliases: ["pret vechi mdl", "pret vechi", "old price", "oldprice"], width: 14 },
  { key: "bulkMinQty", header: "Cantitate mare (buc.)", aliases: ["cantitate mare buc", "cantitate mare", "bulk min qty"], width: 14 },
  { key: "bulkPrice", header: "Preț la cantitate mare (MDL)", aliases: ["pret la cantitate mare mdl", "pret la cantitate mare", "bulk price"], width: 16 },
  { key: "priceTiers", header: "Praguri preț", aliases: ["praguri pret", "praguri pret cantitate pret", "price tiers"], width: 22 },
  { key: "packageQuantity", header: "Ambalaj / cantitate", aliases: ["ambalaj cantitate", "ambalaj", "cantitate", "package"], width: 18 },
  { key: "weightKg", header: "Greutate (kg)", aliases: ["greutate kg", "greutate", "weight"], width: 12 },
  { key: "brand", header: "Brand", aliases: ["brand", "marca"], width: 16 },
  { key: "badge", header: "Insignă", aliases: ["insigna", "badge"], width: 14 },
  { key: "availability", header: "Disponibilitate", aliases: ["disponibilitate", "stoc", "availability"], width: 16 },
  { key: "installmentsEnabled", header: "Rate", aliases: ["rate", "in rate", "installments"], width: 8 },
  { key: "warrantyEnabled", header: "Garanție", aliases: ["garantie", "warranty"], width: 10 },
  { key: "salesCount", header: "Nr. vânzări", aliases: ["nr vanzari", "vanzari", "sales"], width: 11 },
  { key: "image", header: "Imagine principală", aliases: ["imagine principala", "imagine principala url", "imagine", "image", "poza"], width: 44 },
  { key: "images", header: "Imagini suplimentare", aliases: ["imagini suplimentare", "imagini suplimentare url cate una pe rand", "imagini", "images", "galerie"], width: 44 },
  { key: "specifications", header: "Specificații", aliases: ["specificatii", "specificatii eticheta valoare cate una pe rand", "specifications"], width: 40 },
  { key: "variantGroupCode", header: "Variantă a produsului (cod)", aliases: ["varianta a produsului cod", "varianta a produsului", "produs principal cod", "produs principal"], width: 18 },
  { key: "variantLabel", header: "Etichetă variantă", aliases: ["eticheta varianta", "varianta", "variant label"], width: 16 },
  { key: "rating", header: "Rating", aliases: ["rating"], width: 8, info: true },
  { key: "reviewCount", header: "Nr. recenzii", aliases: ["nr recenzii", "recenzii"], width: 10, info: true },
  { key: "popupEnabled", header: "Pop-up ofertă", aliases: ["pop up oferta", "popup"], width: 12, info: true },
  { key: "createdAt", header: "Data creării", aliases: ["data crearii", "creat"], width: 17, info: true },
];

const COLUMN_BY_KEY = new Map(PRODUCT_COLUMNS.map((c) => [c.key, c]));

function normHeader(value: unknown): string {
  return String(value ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

const KEY_BY_ALIAS = new Map<string, FieldKey>();
for (const col of PRODUCT_COLUMNS) {
  KEY_BY_ALIAS.set(normHeader(col.header), col.key);
  for (const alias of col.aliases) if (!KEY_BY_ALIAS.has(alias)) KEY_BY_ALIAS.set(alias, col.key);
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// Un slug scris de mână se curăță (litere mici, cifre, cratime) doar dacă are caractere nepotrivite pentru un URL; cele
// existente (unele au puncte, ex. "lt6009.1") rămân cum sunt.
function cleanSlug(value: string): string {
  return /^[a-z0-9]+(?:[-._][a-z0-9]+)*$/.test(value) ? value : slugify(value);
}

const PRODUCT_CODE_RE = /^[A-Z0-9]+(-[A-Z0-9]+)*$/;
const PRODUCT_CODE_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

function randomProductCode(taken: Set<string>): string {
  for (;;) {
    let code = "";
    for (let i = 0; i < 6; i++) code += PRODUCT_CODE_CHARS[Math.floor(Math.random() * PRODUCT_CODE_CHARS.length)];
    if (!taken.has(code)) return code;
  }
}

const str = (v: unknown): string => String(v ?? "").replace(/\r\n?/g, "\n").trim();
const round = (n: number): number => Math.round(n * 10000) / 10000;

// ── valori canonice ────────────────────────────────────────────────────────────────────────────────────────────
// Fiecare câmp, din fișier sau din baza de date, se aduce la aceeași formă (text tăiat, număr rotunjit, listă sortată),
// iar „identic” înseamnă formă canonică egală — nu contează formatul în care a scris-o Excel (virgulă/punct, CRLF etc.).

type Canon = string | number | boolean | null | string[] | { minQty: number; price: number }[] | { label: string; value: string }[];

const EDITABLE_KEYS = PRODUCT_COLUMNS.filter((c) => !c.info).map((c) => c.key);

/** Câmpuri care au mereu o valoare (cod, slug) sau una implicită (disponibilitate, rate, vânzări): goale în fișier = nemodificate. */
const NOT_CLEARABLE = new Set<FieldKey>(["code", "slug", "availability", "installmentsEnabled", "salesCount"]);

function parseNumber(raw: unknown, header: string): number | null {
  const text = str(raw);
  if (text === "") return null;
  const n = parseDecimalInput(text);
  if (!Number.isFinite(n)) throw new Error(`„${header}”: „${text}” nu e un număr`);
  return round(n);
}

function parseBool(raw: unknown, header: string): boolean | null {
  const text = normHeader(raw);
  if (text === "") return null;
  if (["da", "yes", "true", "1", "x", "activ"].includes(text)) return true;
  if (["nu", "no", "false", "0", "inactiv"].includes(text)) return false;
  throw new Error(`„${header}”: „${str(raw)}” — folosește Da sau Nu`);
}

function parseImageUrl(text: string, header: string): string {
  if (!/^https?:\/\/\S+$/i.test(text) && !/^\/\S+$/.test(text)) {
    throw new Error(`„${header}”: „${text.slice(0, 40)}” nu e un link de imagine (începe cu https:// sau /)`);
  }
  return text;
}

/** Valoarea canonică a unui câmp din celula fișierului. Aruncă Error cu mesajul de arătat utilizatorului. */
function parseCell(key: FieldKey, raw: unknown): Canon {
  const header = COLUMN_BY_KEY.get(key)!.header;
  switch (key) {
    case "code": {
      const code = str(raw).toUpperCase();
      if (code && !PRODUCT_CODE_RE.test(code)) throw new Error(`„${header}”: „${code}” — doar litere, cifre și cratimă între ele (ex. LT-141)`);
      return code;
    }
    case "variantGroupCode": {
      const code = str(raw).toUpperCase();
      if (code && !PRODUCT_CODE_RE.test(code)) throw new Error(`„${header}”: „${code}” nu e un cod de produs valid`);
      return code;
    }
    case "price": {
      const n = parseNumber(raw, header);
      if (n !== null && n <= 0) throw new Error(`„${header}” trebuie să fie mai mare ca 0`);
      return n;
    }
    case "oldPrice":
    case "bulkPrice": {
      const n = parseNumber(raw, header);
      return n !== null && n > 0 ? n : null;
    }
    case "bulkMinQty": {
      const n = parseNumber(raw, header);
      return n !== null && n >= 1 ? Math.floor(n) : null;
    }
    case "weightKg": {
      const n = parseNumber(raw, header);
      return n !== null && n > 0 ? Math.round(n * 1000) / 1000 : null;
    }
    case "salesCount": {
      const n = parseNumber(raw, header);
      return n !== null && n > 0 ? Math.floor(n) : 0;
    }
    case "installmentsEnabled":
      return parseBool(raw, header) ?? true;
    case "warrantyEnabled":
      return parseBool(raw, header);
    case "availability":
      return str(raw) || "În stoc";
    case "image": {
      const text = str(raw);
      return text ? parseImageUrl(text, header) : "";
    }
    case "images": {
      const list = str(raw).split(/\n|\|/).map((s) => s.trim()).filter(Boolean);
      return list.map((u) => parseImageUrl(u, header));
    }
    case "priceTiers": {
      const byQty = new Map<number, number>();
      for (const part of str(raw).split(/[;\n]/).map((s) => s.trim()).filter(Boolean)) {
        const m = part.match(/^(\d+)\s*[:=]\s*([\d.,]+)$/);
        const minQty = m ? Number(m[1]) : NaN;
        const price = m ? parseDecimalInput(m[2]) : NaN;
        if (!m || !Number.isFinite(price) || minQty < 2 || price <= 0) {
          throw new Error(`„${header}”: „${part.slice(0, 30)}” — scrie cantitate:preț (ex. 10:25; 30:20,5), cantitatea minim 2`);
        }
        byQty.set(minQty, round(price));
      }
      return [...byQty.entries()].map(([minQty, price]) => ({ minQty, price })).sort((a, b) => a.minQty - b.minQty);
    }
    case "specifications": {
      const specs: { label: string; value: string }[] = [];
      for (const line of str(raw).split("\n").map((s) => s.trim()).filter(Boolean)) {
        const m = line.match(/^(.*?):\s+(.*)$/) ?? line.match(/^(.*?):$/);
        const label = m ? m[1].trim() : "";
        const value = m && m[2] !== undefined ? m[2].trim() : "";
        if (!label || !value) throw new Error(`„${header}”: „${line.slice(0, 30)}” — scrie Etichetă: valoare, câte una pe rând`);
        specs.push({ label, value });
      }
      return specs;
    }
    default:
      return str(raw);
  }
}

interface DbContext {
  categoryNameById: Map<string, string>;
  codeById: Map<string, string | null>;
}

/** Valoarea canonică a aceluiași câmp, din produsul din baza de date. */
function canonFromProduct(key: FieldKey, p: Product, ctx: DbContext): Canon {
  switch (key) {
    case "id": return p.id;
    case "code": return p.code ?? "";
    case "name": return str(p.name);
    case "slug": return p.slug;
    case "category": return p.categoryId;
    case "description": return str(p.description);
    case "price": return round(p.price);
    case "oldPrice": return p.oldPrice != null && p.oldPrice > 0 ? round(p.oldPrice) : null;
    case "bulkMinQty": return p.bulkMinQty && p.bulkMinQty >= 1 ? p.bulkMinQty : null;
    case "bulkPrice": return p.bulkPrice != null && p.bulkPrice > 0 ? round(p.bulkPrice) : null;
    case "priceTiers": return [...(p.priceTiers ?? [])].map((t) => ({ minQty: t.minQty, price: round(t.price) })).sort((a, b) => a.minQty - b.minQty);
    case "packageQuantity": return str(p.packageQuantity);
    case "weightKg": return p.weightKg != null && p.weightKg > 0 ? Math.round(p.weightKg * 1000) / 1000 : null;
    case "brand": return str(p.brand);
    case "badge": return str(p.badge);
    case "availability": return str(p.availability) || "În stoc";
    case "installmentsEnabled": return p.installmentsEnabled ?? true;
    case "warrantyEnabled": return p.warrantyEnabled ?? null;
    case "salesCount": return p.salesCount ?? 0;
    case "image": return str(p.image);
    case "images": return (p.images ?? []).map(str).filter(Boolean);
    case "specifications": return (p.specifications ?? []).map((s) => ({ label: str(s.label), value: str(s.value) }));
    case "variantGroupCode": return p.variantGroupId ? ctx.codeById.get(p.variantGroupId) ?? "" : "";
    case "variantLabel": return str(p.variantLabel);
    case "rating": return p.rating;
    case "reviewCount": return p.reviewCount;
    case "popupEnabled": return p.popupEnabled;
    case "createdAt": return p.createdAt.toISOString();
  }
}

const same = (a: Canon, b: Canon): boolean => JSON.stringify(a) === JSON.stringify(b);

// ── EXPORT ─────────────────────────────────────────────────────────────────────────────────────────────────────

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

function formatDate(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

const yesNo = (v: boolean | null): string => (v === null ? "" : v ? "Da" : "Nu");

/** Toate produsele, cu toate datele, într-un fișier .xlsx (foaia „Produse” + foaia „Instrucțiuni”). */
export async function buildProductsWorkbook(): Promise<Buffer> {
  const [products, categories] = await Promise.all([
    prisma.product.findMany({ orderBy: { createdAt: "asc" } }),
    prisma.category.findMany(),
  ]);
  const ctx: DbContext = {
    categoryNameById: new Map(categories.map((c) => [c.id, c.name])),
    codeById: new Map(products.map((p) => [p.id, p.code])),
  };

  const cellValue = (col: Column, p: Product): string | number => {
    switch (col.key) {
      case "category": return ctx.categoryNameById.get(p.categoryId) ?? "";
      case "priceTiers": return (p.priceTiers ?? []).map((t) => `${t.minQty}:${String(t.price).replace(".", ",")}`).join("; ");
      case "images": return (p.images ?? []).join("\n");
      case "specifications": return (p.specifications ?? []).map((s) => `${s.label}: ${s.value}`).join("\n");
      case "installmentsEnabled": return yesNo(p.installmentsEnabled ?? true);
      case "warrantyEnabled": return yesNo(p.warrantyEnabled ?? null);
      case "popupEnabled": return yesNo(p.popupEnabled);
      case "createdAt": return formatDate(p.createdAt);
      default: {
        const v = canonFromProduct(col.key, p, ctx);
        if (v === null) return "";
        return typeof v === "number" || typeof v === "string" ? v : "";
      }
    }
  };

  const header = PRODUCT_COLUMNS.map((c) => c.header);
  const body = products.map((p) => PRODUCT_COLUMNS.map((c) => cellValue(c, p)));
  const ws = XLSX.utils.aoa_to_sheet([header, ...body]);
  ws["!cols"] = PRODUCT_COLUMNS.map((c) => ({ wch: c.width }));
  ws["!autofilter"] = { ref: XLSX.utils.encode_range({ s: { r: 0, c: 0 }, e: { r: body.length, c: PRODUCT_COLUMNS.length - 1 } }) };

  // Linkul imaginii principale devine clicabil în Excel (deschide poza).
  const imageCol = PRODUCT_COLUMNS.findIndex((c) => c.key === "image");
  products.forEach((p, i) => {
    if (!p.image) return;
    const cell = ws[XLSX.utils.encode_cell({ r: i + 1, c: imageCol })];
    if (cell) cell.l = { Target: p.image.startsWith("/") ? `https://lumina.md${p.image}` : p.image };
  });

  const help: string[][] = [
    ["Cum se folosește acest fișier"],
    [""],
    ["Fiecare rând din foaia „Produse” este un produs. Fișierul se poate edita și reimporta din Admin → Produse → Importă Excel."],
    ["La import, un rând se potrivește cu un produs existent după ID, apoi după Cod produs, apoi după Slug (iar dacă lipsesc codul și slug-ul, după Nume)."],
    ["Rândurile IDENTICE cu produsul din site se sar (nu se adaugă a doua oară). Rândurile care diferă se actualizează doar dacă bifezi asta la import."],
    ["Rândurile care nu se potrivesc cu niciun produs se adaugă ca produse noi (obligatoriu: Nume, Preț, Categorie existentă). Codul și slug-ul lipsă se generează."],
    ["Poți importa și un fișier cu mai puține coloane (ex. doar „Cod produs” și „Preț”): coloanele care lipsesc nu se modifică."],
    [""],
    ["Coloane:"],
    ["Categorie — numele exact al unei categorii existente (sau slug-ul ei)."],
    ["Preț, Preț vechi, Preț la cantitate mare — în MDL, cu virgulă sau punct. Praguri preț — cantitate:preț, separate prin „;” (ex. 10:25; 30:20,5)."],
    ["Rate, Garanție — Da / Nu (Garanție goală = implicit). Disponibilitate — text (ex. În stoc, Stoc epuizat)."],
    ["Imagine principală — link (https://…) către poză. Imagini suplimentare — linkuri, câte unul pe rând în aceeași celulă. Pozele nu se încarcă din Excel: se păstrează linkul."],
    ["Specificații — câte una pe rând, în forma Etichetă: valoare."],
    ["Variantă a produsului (cod) — codul produsului principal, pentru produsele care sunt variante de mărime/cantitate; Etichetă variantă — ex. „2 L”."],
    ["ID, Rating, Nr. recenzii, Pop-up ofertă, Data creării — doar informative; se ignoră la import (ID ajută la potrivire)."],
  ];
  const helpSheet = XLSX.utils.aoa_to_sheet(help);
  helpSheet["!cols"] = [{ wch: 140 }];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Produse");
  XLSX.utils.book_append_sheet(wb, helpSheet, "Instrucțiuni");
  return XLSX.write(wb, { type: "buffer", bookType: "xlsx" }) as Buffer;
}

// ── IMPORT ─────────────────────────────────────────────────────────────────────────────────────────────────────

export const MAX_IMPORT_BYTES = 5 * 1024 * 1024;
const MAX_IMPORT_ROWS = 3000;

export type RowStatus = "new" | "identical" | "changed" | "duplicate" | "error";

export interface ImportRowResult {
  line: number;
  status: RowStatus;
  name: string;
  code: string;
  details: string;
}

export interface ImportSummary {
  total: number;
  new: number;
  identical: number;
  changed: number;
  duplicate: number;
  error: number;
}

export interface ImportAnalysis {
  summary: ImportSummary;
  rows: ImportRowResult[];
  /** Coloane recunoscute din fișier și titluri ignorate. */
  recognized: string[];
  ignored: string[];
}

interface Plan {
  line: number;
  status: RowStatus;
  name: string;
  code: string;
  details: string;
  existingId?: string;
  /** Câmpuri gata de scris în baza de date (la „nou”: toate; la „diferit”: doar cele schimbate). */
  data: Record<string, unknown>;
  /** Codul produsului principal (undefined = nu se atinge; "" = nu mai e variantă). */
  variantCode?: string;
}

function toDbValue(key: FieldKey, v: Canon): unknown {
  switch (key) {
    case "description":
    case "packageQuantity":
    case "brand":
    case "badge":
    case "image":
    case "variantLabel":
      return v === "" ? null : v;
    default:
      return v;
  }
}

function shorten(v: Canon): string {
  const text = Array.isArray(v) ? `${v.length} elem.` : v === null || v === "" ? "gol" : String(v);
  return text.length > 22 ? `${text.slice(0, 20)}…` : text;
}

function readSheet(buffer: Buffer): { keys: (FieldKey | null)[]; headers: string[]; rows: unknown[][] } {
  if (buffer.length === 0) throw new ProductsFileError("Fișierul e gol.");
  if (buffer.length > MAX_IMPORT_BYTES) throw new ProductsFileError("Fișierul e prea mare (maxim 5 MB).");
  let wb: XLSX.WorkBook;
  try {
    wb = XLSX.read(buffer, { type: "buffer", cellDates: false });
  } catch {
    throw new ProductsFileError("Nu am putut citi fișierul. Folosește un fișier Excel (.xlsx) sau CSV.");
  }
  const sheetName = wb.SheetNames.find((n) => normHeader(n) === "produse") ?? wb.SheetNames[0];
  const ws = sheetName ? wb.Sheets[sheetName] : undefined;
  if (!ws) throw new ProductsFileError("Fișierul nu conține nicio foaie.");
  const matrix = XLSX.utils.sheet_to_json<unknown[]>(ws, { header: 1, defval: "", blankrows: true, raw: true });
  if (matrix.length === 0) throw new ProductsFileError("Foaia este goală.");

  const headers = (matrix[0] ?? []).map((h) => str(h));
  const seen = new Set<FieldKey>();
  const keys = headers.map((h) => {
    const key = KEY_BY_ALIAS.get(normHeader(h)) ?? null;
    if (!key || seen.has(key)) return null;
    seen.add(key);
    return key;
  });
  if (!keys.some((k) => k === "code" || k === "slug" || k === "name" || k === "id")) {
    throw new ProductsFileError("Nu găsesc nicio coloană de identificare: adaugă cel puțin „Cod produs”, „Slug” sau „Nume” pe primul rând.");
  }
  const rows = matrix.slice(1);
  if (rows.length > MAX_IMPORT_ROWS) throw new ProductsFileError(`Prea multe rânduri (maxim ${MAX_IMPORT_ROWS}).`);
  return { keys, headers, rows };
}

interface Analyzed {
  analysis: ImportAnalysis;
  plans: Plan[];
}

async function analyze(buffer: Buffer): Promise<Analyzed> {
  const { keys, headers, rows } = readSheet(buffer);
  const present = new Set(keys.filter((k): k is FieldKey => k !== null));

  const [products, categories] = await Promise.all([prisma.product.findMany(), prisma.category.findMany()]);
  const ctx: DbContext = {
    categoryNameById: new Map(categories.map((c) => [c.id, c.name])),
    codeById: new Map(products.map((p) => [p.id, p.code])),
  };
  const byId = new Map(products.map((p) => [p.id, p]));
  const byCode = new Map(products.filter((p) => p.code).map((p) => [p.code!, p]));
  const bySlug = new Map(products.map((p) => [p.slug, p]));
  const byName = new Map<string, Product[]>();
  for (const p of products) {
    const k = normHeader(p.name);
    byName.set(k, [...(byName.get(k) ?? []), p]);
  }
  const catByName = new Map<string, { id: string }[]>();
  const catBySlug = new Map<string, { id: string }>();
  for (const c of categories) {
    const k = normHeader(c.name);
    catByName.set(k, [...(catByName.get(k) ?? []), { id: c.id }]);
    catBySlug.set(normHeader(c.slug), { id: c.id });
  }

  const takenCodes = new Set(products.map((p) => p.code).filter((c): c is string => Boolean(c)));
  const takenSlugs = new Set(products.map((p) => p.slug));
  const matchedIds = new Map<string, number>(); // produs existent -> rândul care l-a revendicat
  const newKeys = new Map<string, number>(); // cod / slug / nume folosit de un rând nou -> rândul
  const plans: Plan[] = [];

  rows.forEach((cells, index) => {
    const line = index + 2;
    if (cells.every((c) => str(c) === "")) return;

    const raw = new Map<FieldKey, unknown>();
    keys.forEach((k, i) => { if (k) raw.set(k, cells[i]); });

    // 1) valorile din rând, în formă canonică (erorile de format se strâng, nu opresc analiza)
    const values = new Map<FieldKey, Canon>();
    const errors: string[] = [];
    for (const key of present) {
      if (COLUMN_BY_KEY.get(key)!.info && key !== "id") continue;
      try {
        values.set(key, key === "id" ? str(raw.get("id")) : key === "category" ? str(raw.get("category")) : parseCell(key, raw.get(key)));
      } catch (e) {
        errors.push((e as Error).message);
      }
    }
    const name = str(values.get("name") ?? "");
    const code = str(values.get("code") ?? "");
    const label = name || code || str(values.get("slug") ?? "") || `rândul ${line}`;

    const fail = (message: string, status: RowStatus = "error") =>
      plans.push({ line, status, name: label, code, details: message, data: {} });

    if (errors.length > 0) return fail(errors.join(" · "));

    // 2) categoria (doar dacă există coloana)
    let categoryId: string | null | undefined;
    if (present.has("category")) {
      const wanted = str(values.get("category") ?? "");
      if (wanted) {
        const byNameHits = catByName.get(normHeader(wanted)) ?? [];
        if (byNameHits.length > 1) return fail(`Categoria „${wanted}” există de mai multe ori — folosește slug-ul ei`);
        categoryId = byNameHits[0]?.id ?? catBySlug.get(normHeader(wanted))?.id ?? null;
        if (!categoryId) return fail(`Categoria „${wanted}” nu există — creeaz-o întâi în Admin → Categorii`);
        values.set("category", categoryId);
      } else {
        categoryId = null;
        values.set("category", "");
      }
    }

    // 3) ce produs existent este acesta?
    const id = str(values.get("id") ?? "");
    const slug = str(values.get("slug") ?? "");
    const hits = new Map<string, Product>();
    if (id && byId.has(id)) hits.set(id, byId.get(id)!);
    if (code && byCode.has(code)) hits.set(byCode.get(code)!.id, byCode.get(code)!);
    const slugHit = slug ? bySlug.get(slug) ?? bySlug.get(cleanSlug(slug)) : undefined;
    if (slugHit) hits.set(slugHit.id, slugHit);
    if (hits.size === 0 && !code && !slug && name) {
      const named = byName.get(normHeader(name)) ?? [];
      if (named.length > 1) return fail(`Există ${named.length} produse cu numele „${name}” — adaugă Cod produs ca să știu care e`);
      if (named.length === 1) hits.set(named[0].id, named[0]);
    }
    if (hits.size > 1) return fail("ID / cod / slug aparțin unor produse diferite");
    const existing = [...hits.values()][0];

    if (existing) {
      const firstLine = matchedIds.get(existing.id);
      if (firstLine !== undefined) return fail(`Același produs apare și pe rândul ${firstLine} — sărit`, "duplicate");
      matchedIds.set(existing.id, line);

      const data: Record<string, unknown> = {};
      const changes: string[] = [];
      let variantCode: string | undefined;
      for (const key of EDITABLE_KEYS) {
        if (!present.has(key) || !values.has(key)) continue;
        // Celulă goală la câmpurile care nu pot fi „golite” (au valoare implicită) = nespecificat, nu „șterge”:
        // altfel un fișier cu coloana Slug necompletată ar încerca să scoată slug-ul produselor existente.
        if (NOT_CLEARABLE.has(key) && str(raw.get(key)) === "") continue;
        const fileVal = values.get(key)!;
        const dbVal = canonFromProduct(key, existing, ctx);
        if (same(fileVal, dbVal)) continue;
        // câmpuri obligatorii: un preț/nume gol în fișier nu șterge produsul existent
        if ((key === "name" && fileVal === "") || (key === "price" && fileVal === null) || (key === "category" && fileVal === "")) continue;
        const colLabel = COLUMN_BY_KEY.get(key)!.header;
        changes.push(["price", "oldPrice", "salesCount", "weightKg", "code", "slug", "name", "category", "availability", "brand"].includes(key) && key !== "category"
          ? `${colLabel}: ${shorten(dbVal)} → ${shorten(fileVal)}`
          : colLabel);
        if (key === "variantGroupCode") variantCode = String(fileVal);
        else data[key === "category" ? "categoryId" : key] = toDbValue(key, fileVal);
      }
      if (changes.length === 0) return plans.push({ line, status: "identical", name: existing.name, code: existing.code ?? "", details: "Identic cu produsul din site — sărit", existingId: existing.id, data: {} });
      // cod/slug schimbate trebuie să rămână unice
      if (typeof data.code === "string" && data.code && takenCodes.has(data.code)) return fail(`Codul „${data.code}” aparține altui produs`);
      if (typeof data.slug === "string" && data.slug) data.slug = cleanSlug(data.slug);
      if (typeof data.slug === "string" && data.slug && takenSlugs.has(data.slug)) return fail(`Slug-ul „${data.slug}” aparține altui produs`);
      if (data.code === "") delete data.code;
      if (data.slug === "") delete data.slug;
      return plans.push({ line, status: "changed", name: existing.name, code: existing.code ?? "", details: changes.join(" · "), existingId: existing.id, data, variantCode });
    }

    // 4) produs nou
    const priceVal = values.get("price");
    if (!name) return fail("Lipsește Nume");
    if (typeof priceVal !== "number" || priceVal <= 0) return fail("Lipsește Preț (sau nu e mai mare ca 0)");
    if (!categoryId) return fail("Lipsește Categorie (obligatorie pentru un produs nou)");
    if ((values.get("bulkMinQty") === null) !== (values.get("bulkPrice") === null) && present.has("bulkMinQty") && present.has("bulkPrice")) {
      return fail("Completează atât „Cantitate mare”, cât și „Preț la cantitate mare” (sau niciuna)");
    }

    const claim = (k: string) => newKeys.get(k);
    const claims = [code && `c:${code}`, slug && `s:${slug}`, !code && !slug && `n:${normHeader(name)}`].filter((k): k is string => Boolean(k));
    for (const k of claims) {
      const other = claim(k);
      if (other !== undefined) return fail(`Se repetă rândul ${other} (același ${k[0] === "c" ? "cod" : k[0] === "s" ? "slug" : "nume"}) — sărit`, "duplicate");
    }
    if (code && takenCodes.has(code)) return fail(`Codul „${code}” aparține altui produs`);
    let finalSlug = slug ? cleanSlug(slug) : slugify(name);
    if (!finalSlug) return fail("Numele nu poate produce un slug valid");
    if (!slug) {
      const base = finalSlug;
      for (let n = 2; takenSlugs.has(finalSlug); n++) finalSlug = `${base}-${n}`;
    } else if (takenSlugs.has(finalSlug)) {
      return fail(`Slug-ul „${finalSlug}” aparține altui produs`);
    }
    const finalCode = code || randomProductCode(takenCodes);
    claims.forEach((k) => newKeys.set(k, line));
    newKeys.set(`c:${finalCode}`, line);
    newKeys.set(`s:${finalSlug}`, line);
    takenCodes.add(finalCode);
    takenSlugs.add(finalSlug);

    const data: Record<string, unknown> = { name, slug: finalSlug, code: finalCode, price: priceVal, categoryId };
    let variantCode: string | undefined;
    for (const key of EDITABLE_KEYS) {
      if (["name", "slug", "code", "price", "category"].includes(key)) continue;
      if (!present.has(key) || !values.has(key)) continue;
      if (key === "variantGroupCode") { variantCode = String(values.get(key)) || undefined; continue; }
      data[key] = toDbValue(key, values.get(key)!);
    }
    plans.push({ line, status: "new", name, code: finalCode, details: `Produs nou · ${ctx.categoryNameById.get(categoryId) ?? ""}`, data, variantCode });
  });

  // 5) legăturile de variantă: produsul principal trebuie să existe (în site sau în fișier) și să nu fie el însuși variantă
  const isVariant = new Set(products.filter((p) => p.variantGroupId && p.code).map((p) => p.code!));
  for (const pl of plans) {
    if (pl.status === "error" || pl.status === "duplicate" || pl.variantCode === undefined) continue;
    if (pl.variantCode) isVariant.add(pl.code);
    else isVariant.delete(pl.code);
  }
  for (const pl of plans) {
    if (pl.status === "error" || pl.status === "duplicate" || !pl.variantCode) continue;
    const parent = pl.variantCode;
    const problem =
      parent === pl.code ? "un produs nu poate fi variantă a lui însuși"
      : !takenCodes.has(parent) ? `produsul principal „${parent}” nu există`
      : isVariant.has(parent) ? `„${parent}” e el însuși variantă — alege produsul principal`
      : null;
    if (problem) {
      pl.status = "error";
      pl.details = `Variantă: ${problem}`;
    }
  }

  const summary: ImportSummary = { total: plans.length, new: 0, identical: 0, changed: 0, duplicate: 0, error: 0 };
  for (const pl of plans) summary[pl.status]++;
  const recognized = keys.filter((k): k is FieldKey => k !== null).map((k) => COLUMN_BY_KEY.get(k)!.header);
  const ignored = headers.filter((h, i) => h && keys[i] === null);
  return {
    analysis: {
      summary,
      rows: plans.map(({ line, status, name, code, details }) => ({ line, status, name, code, details })),
      recognized,
      ignored,
    },
    plans,
  };
}

/** Verifică fișierul fără să scrie nimic: ce e nou, ce e identic (se sare), ce diferă, ce are erori. */
export async function analyzeProductsFile(buffer: Buffer): Promise<ImportAnalysis> {
  return (await analyze(buffer)).analysis;
}

export interface ImportResult {
  created: number;
  updated: number;
  skippedIdentical: number;
  skippedChanged: number;
  skippedDuplicate: number;
  errors: { line: number; name: string; message: string }[];
}

/** Aplică importul: produsele noi se adaugă; cele identice se sar; cele diferite se actualizează doar dacă se cere. */
export async function applyProductsFile(buffer: Buffer, options: { updateExisting: boolean }): Promise<ImportResult> {
  const { plans } = await analyze(buffer);
  const result: ImportResult = { created: 0, updated: 0, skippedIdentical: 0, skippedChanged: 0, skippedDuplicate: 0, errors: [] };
  const idByCode = new Map<string, string>();
  for (const p of await prisma.product.findMany({ select: { id: true, code: true } })) if (p.code) idByCode.set(p.code, p.id);

  const fail = (pl: Plan, e: unknown) => result.errors.push({ line: pl.line, name: pl.name, message: e instanceof Error ? e.message : "eroare necunoscută" });
  const toCreate: Plan[] = [];
  const toUpdate: Plan[] = [];
  for (const pl of plans) {
    if (pl.status === "error") result.errors.push({ line: pl.line, name: pl.name, message: pl.details });
    else if (pl.status === "duplicate") result.skippedDuplicate++;
    else if (pl.status === "identical") result.skippedIdentical++;
    else if (pl.status === "changed") {
      if (options.updateExisting) toUpdate.push(pl);
      else result.skippedChanged++;
    } else toCreate.push(pl);
  }

  // faza 1: produsele noi (fără legătura de variantă — produsul principal poate fi mai jos în fișier)
  const created: Plan[] = [];
  for (let i = 0; i < toCreate.length; i += 10) {
    await Promise.all(
      toCreate.slice(i, i + 10).map(async (pl) => {
        try {
          const row = await prisma.product.create({ data: pl.data as never, select: { id: true, code: true } });
          if (row.code) idByCode.set(row.code, row.id);
          pl.existingId = row.id;
          created.push(pl);
          result.created++;
        } catch (e) {
          fail(pl, e);
        }
      })
    );
  }

  // faza 2: actualizările produselor existente
  const updatedPlans: Plan[] = [];
  for (let i = 0; i < toUpdate.length; i += 10) {
    await Promise.all(
      toUpdate.slice(i, i + 10).map(async (pl) => {
        try {
          if (Object.keys(pl.data).length > 0) await prisma.product.update({ where: { id: pl.existingId! }, data: pl.data as never });
          updatedPlans.push(pl);
          result.updated++;
        } catch (e) {
          fail(pl, e);
        }
      })
    );
  }

  // faza 3: legăturile de variantă (acum toate produsele principale există)
  for (const pl of [...created, ...updatedPlans]) {
    if (pl.variantCode === undefined || !pl.existingId) continue;
    try {
      const parentId = pl.variantCode ? idByCode.get(pl.variantCode) ?? null : null;
      if (pl.variantCode && !parentId) throw new Error(`produsul principal „${pl.variantCode}” nu există`);
      await prisma.product.update({ where: { id: pl.existingId }, data: { variantGroupId: parentId } });
    } catch (e) {
      fail(pl, e);
    }
  }
  return result;
}
