// API de control al catalogului (produse, categorii, subcategorii, oferte) pentru aplicații externe: citire, creare, editare, ștergere.
// Partea comună: autentificare cu cheie, răspunsuri JSON, citirea corpului, găsirea după id / slug / cod și reîmprospătarea paginilor.
//
// Autentificare — chei în variabilele de mediu (mai multe, separate prin virgulă; min. 16 caractere; se revocă scoțând-o din listă):
//   CATALOG_API_KEYS       = chei cu drept COMPLET (citire + creare + editare + ștergere)
//   CATALOG_API_READ_KEYS  = chei doar pentru CITIRE (ex. un tablou de bord care nu are voie să schimbe nimic)
// Cheia se trimite în antet — X-API-Key: <cheia>   sau   Authorization: Bearer <cheia> — niciodată în adresă (adresele apar în jurnale).
import { timingSafeEqual } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "./prisma";
import { invalidateCatalog } from "./catalog";

export type ApiLevel = "read" | "write";

function configuredKeys(envName: string): string[] {
  return (process.env[envName] ?? "")
    .split(",")
    .map((k) => k.trim())
    .filter((k) => k.length >= 16);
}

function sameKey(a: string, b: string): boolean {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}

function providedKey(request: NextRequest): string {
  const bearer = request.headers.get("authorization")?.match(/^Bearer\s+(.+)$/i)?.[1];
  return (request.headers.get("x-api-key") ?? bearer ?? "").trim();
}

/** Cine a făcut cererea, pentru jurnal: doar ultimele 4 caractere ale cheii, niciodată cheia întreagă. */
function keyTag(request: NextRequest): string {
  return `cheia …${providedKey(request).slice(-4)}`;
}

const NO_STORE = { "Cache-Control": "no-store" };

export function ok(data: unknown, status = 200): NextResponse {
  return NextResponse.json(data, { status, headers: NO_STORE });
}

export function fail(status: number, error: string, extra: Record<string, unknown> = {}): NextResponse {
  return NextResponse.json({ error, ...extra }, { status, headers: NO_STORE });
}

/** null = autorizat; altfel răspunsul de eroare gata de returnat. */
export function authorizeCatalogApi(request: NextRequest, level: ApiLevel): NextResponse | null {
  const full = configuredKeys("CATALOG_API_KEYS");
  const readOnly = configuredKeys("CATALOG_API_READ_KEYS");
  if (full.length === 0 && readOnly.length === 0) {
    return fail(503, "API-ul catalogului nu este activat (lipsește CATALOG_API_KEYS).");
  }
  const provided = providedKey(request);
  if (!provided) return NextResponse.json({ error: "Cheie API lipsă." }, { status: 401, headers: { ...NO_STORE, "WWW-Authenticate": "Bearer" } });

  if (full.some((k) => sameKey(provided, k))) return null;
  if (readOnly.some((k) => sameKey(provided, k))) {
    if (level === "read") return null;
    return fail(403, "Această cheie este doar pentru citire; nu poate modifica catalogul.");
  }
  return NextResponse.json({ error: "Cheie API invalidă." }, { status: 401, headers: { ...NO_STORE, "WWW-Authenticate": "Bearer" } });
}

/** Jurnal de audit în logurile platformei (Vercel → Logs): cine, ce, asupra cui. */
export function auditWrite(request: NextRequest, action: string, target: string) {
  console.info(`[catalog-api] ${keyTag(request)} · ${action} · ${target}`);
}

export async function readJsonObject(request: NextRequest): Promise<{ body: Record<string, unknown> } | { response: NextResponse }> {
  let parsed: unknown;
  try {
    parsed = await request.json();
  } catch {
    return { response: fail(400, "Corpul cererii trebuie să fie JSON valid (Content-Type: application/json).") };
  }
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    return { response: fail(400, "Corpul cererii trebuie să fie un obiect JSON.") };
  }
  return { body: parsed as Record<string, unknown> };
}

// Rezultatul unei operații: fie datele, fie o eroare cu cod HTTP — aceleași funcții servesc și cererile simple, și cele în masă.
export type ApiResult<T> = { ok: true; data: T } | { ok: false; status: number; error: string; details?: string[] };

export function good<T>(data: T): ApiResult<T> {
  return { ok: true, data };
}

export function bad(status: number, error: string, details?: string[]): { ok: false; status: number; error: string; details?: string[] } {
  return { ok: false, status, error, ...(details && details.length > 0 ? { details } : {}) };
}

export function resultResponse<T>(result: ApiResult<T>, successStatus = 200): NextResponse {
  if (result.ok) return ok(result.data, successStatus);
  return fail(result.status, result.error, result.details ? { details: result.details } : {});
}

const OBJECT_ID = /^[0-9a-f]{24}$/i;

export function isObjectId(value: string): boolean {
  return OBJECT_ID.test(value);
}

/** Produsul după id, slug sau cod produs (în această ordine). */
export async function findProductByRef(rawRef: string) {
  const ref = decodeURIComponent(rawRef).trim();
  if (!ref) return null;
  if (isObjectId(ref)) {
    const byId = await prisma.product.findUnique({ where: { id: ref } });
    if (byId) return byId;
  }
  const bySlug = await prisma.product.findUnique({ where: { slug: ref } });
  if (bySlug) return bySlug;
  return prisma.product.findUnique({ where: { code: ref.toUpperCase() } });
}

/** Categoria (sau subcategoria) după id sau slug. */
export async function findCategoryByRef(rawRef: string) {
  const ref = decodeURIComponent(rawRef).trim();
  if (!ref) return null;
  if (isObjectId(ref)) {
    const byId = await prisma.category.findUnique({ where: { id: ref } });
    if (byId) return byId;
  }
  return prisma.category.findUnique({ where: { slug: ref } });
}

/** id-ul categoriei + id-urile subcategoriilor ei (listările de pe site arată produsele subcategoriilor în categoria părinte). */
export async function categoryWithChildrenIds(categoryId: string): Promise<string[]> {
  const children = await prisma.category.findMany({ where: { parentId: categoryId }, select: { id: true } });
  return [categoryId, ...children.map((c) => c.id)];
}

// ── Reîmprospătarea site-ului după o modificare ──
// Paginile sunt statice (ISR) și catalogul stă în cache; fără asta modificările din API nu s-ar vedea pe site până a doua zi.
export interface Refresh {
  slugs: Set<string>;
  categoryIds: Set<string>;
}

export function newRefresh(): Refresh {
  return { slugs: new Set(), categoryIds: new Set() };
}

/** Familia de variante (produsul principal + variantele lui): fiecare are pagină proprie, deci fiecare se reîmprospătează. */
export async function addProductFamily(refresh: Refresh, productId: string) {
  const product = await prisma.product.findUnique({ where: { id: productId }, select: { variantGroupId: true } });
  const primaryId = product?.variantGroupId ?? productId;
  const family = await prisma.product.findMany({
    where: { OR: [{ id: primaryId }, { variantGroupId: primaryId }] },
    select: { slug: true, categoryId: true },
  });
  for (const p of family) {
    refresh.slugs.add(p.slug);
    refresh.categoryIds.add(p.categoryId);
  }
}

export async function flushRefresh(refresh: Refresh) {
  invalidateCatalog();
  revalidatePath("/");
  revalidatePath("/produse");
  revalidatePath("/favorite");
  revalidatePath("/sitemap.xml");
  for (const slug of refresh.slugs) revalidatePath(`/produse/${slug}`);

  if (refresh.categoryIds.size > 0) {
    const categories = await prisma.category.findMany({
      where: { id: { in: [...refresh.categoryIds] } },
      select: { slug: true, parentId: true },
    });
    const parentIds = categories.map((c) => c.parentId).filter((id): id is string => !!id);
    const parents = parentIds.length ? await prisma.category.findMany({ where: { id: { in: parentIds } }, select: { slug: true } }) : [];
    for (const c of [...categories, ...parents]) revalidatePath(`/produse/${c.slug}`);
  }
}

// ── Valori din JSON ──
export function parsePositiveInt(raw: string | null, fallback: number, max: number): number {
  const n = Math.floor(Number(raw));
  if (!Number.isFinite(n) || n < 1) return fallback;
  return Math.min(n, max);
}

export function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

function csvCell(v: unknown): string {
  const s = v === null || v === undefined ? "" : String(v);
  return /[",\n\r;]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

/** Tabel CSV (separat prin virgulă, cu BOM ca Excel să citească corect diacriticele). */
export function csvResponse(filename: string, columns: string[], rows: Record<string, unknown>[]): NextResponse {
  const lines = [columns.map(csvCell).join(","), ...rows.map((r) => columns.map((c) => csvCell(r[c])).join(","))];
  return new NextResponse("﻿" + lines.join("\r\n"), {
    headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": `attachment; filename="${filename}"`, ...NO_STORE },
  });
}

function errorResponse(err: unknown): NextResponse {
  const code = (err as { code?: string } | null)?.code;
  if (code === "P2002") return fail(409, "Valoare duplicată (slug sau cod deja folosit).");
  console.error("[catalog-api] eroare:", err);
  return fail(500, "Eroare internă la procesarea cererii.");
}

/** Cerere de CITIRE: verifică cheia, rulează operația și întoarce rezultatul (erorile neașteptate devin 500 curat). */
export async function runRead<T>(request: NextRequest, fn: () => Promise<ApiResult<T>>): Promise<NextResponse> {
  const denied = authorizeCatalogApi(request, "read");
  if (denied) return denied;
  try {
    return resultResponse(await fn());
  } catch (err) {
    return errorResponse(err);
  }
}

/**
 * Cerere de SCRIERE: verifică cheia (drept complet), rulează operația și, dacă a reușit, o trece în jurnal și reîmprospătează site-ul
 * (cache-ul catalogului + paginile atinse) — ca modificarea să se vadă imediat pe site.
 */
export async function runWrite<T>(
  request: NextRequest,
  action: string,
  target: string,
  fn: (refresh: Refresh) => Promise<ApiResult<T>>,
  successStatus = 200
): Promise<NextResponse> {
  const denied = authorizeCatalogApi(request, "write");
  if (denied) return denied;
  const refresh = newRefresh();
  try {
    const result = await fn(refresh);
    if (result.ok) {
      auditWrite(request, action, target);
      await flushRefresh(refresh);
    }
    return resultResponse(result, successStatus);
  } catch (err) {
    return errorResponse(err);
  }
}

/** Cine a făcut cererea, pentru jurnalul de audit al registrului (ultimele 4 caractere ale cheii, niciodată cheia întreagă). */
export function apiActor(request: NextRequest): { channel: "api"; id: string; name: string } {
  const tail = providedKey(request).slice(-4);
  return { channel: "api", id: `catalog-${tail}`, name: `API catalog (cheia …${tail})` };
}

/**
 * Clienți care știu doar GET și POST (Excel/VBA, unele CRM-uri, formulare) pot face orice operație printr-un POST pe adresa unei resurse
 * (`/produse/{ref}`, `/categorii/{ref}`, `/oferte/{ref}`, `/comenzi/{ref}`), cu metoda dorită în `?_method=PATCH|PUT|DELETE` sau în
 * antetul `X-HTTP-Method-Override`. Fără ele, POST pe o resursă înseamnă modificare (PATCH; la oferte PUT).
 */
export function methodOverride(request: NextRequest, fallback: "PATCH" | "PUT"): "PATCH" | "PUT" | "DELETE" {
  const raw = (request.nextUrl.searchParams.get("_method") ?? request.headers.get("x-http-method-override") ?? "").toUpperCase();
  return raw === "DELETE" || raw === "PATCH" || raw === "PUT" ? raw : fallback;
}
