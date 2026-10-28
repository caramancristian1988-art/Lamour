// Registrul de comenzi — sursa UNICĂ pentru site (/admin/comenzi) și pentru botul Telegram.
//
// Registrul NU e o tabelă separată: comenzile din coș sunt rândurile ContactMessage cu
// source = "Comandă din coș" (altfel ar exista două registre care se pot desincroniza). Peste ele:
//   • statusul extragerii (neextrasa | rezervata | extrasa), independent de etapa operațională (orderStage);
//   • exporturi (OrderExport) care REZERVĂ atomic un set fix de comenzi, apoi sunt confirmate/anulate/expirate;
//   • jurnal de audit (ExportAuditLog).
//
// Fără "use server": funcțiile de aici NU trebuie să fie apelabile din browser; accesul trece prin acțiuni
// (app/admin/comenzi/actions.ts) și prin webhook-ul Telegram, care verifică drepturile.
import type { Prisma } from "@prisma/client";
import { prisma } from "./prisma";
import { CART_ORDER_SOURCE, orderStageLabel } from "./orderStages";
import { normalizeTiers, unitPriceFor } from "./pricing";

// ── Constante și tipuri ────────────────────────────────────────────────────────────────────────

export const EXTRACTION = { NEW: "neextrasa", RESERVED: "rezervata", DONE: "extrasa" } as const;
export type ExtractionStatus = (typeof EXTRACTION)[keyof typeof EXTRACTION];

export const EXTRACTION_LABELS: Record<ExtractionStatus, string> = {
  neextrasa: "Neextrasă",
  rezervata: "Rezervată pentru extragere",
  extrasa: "Extrasă",
};

export const EXPORT_STATUS_LABELS: Record<string, string> = {
  pregatit: "Pregătit, neconfirmat",
  confirmat: "Confirmat",
  anulat: "Anulat",
  expirat: "Expirat",
};

/** O rezervare neconfirmată expiră după atât — comenzile revin automat la „Neextrasă”. */
export const RESERVATION_HOURS = 24;

/** Site-ul acceptă doar plata la livrare (COD) — nu există un câmp separat în comandă. */
export const PAYMENT_METHOD = "Plată la livrare";

export interface Actor {
  channel: "site" | "telegram" | "api";
  /** ID-ul utilizatorului admin (site) sau ID-ul Telegram (from.id). */
  id: string;
  name: string;
}

/** Restrânge registrul la un alt `source` — folosit DOAR de teste, ca să nu atingă comenzile reale. */
export interface Scope {
  source?: string;
}

export interface RegistryItem {
  /** Id-ul produsului din catalog (pentru legarea de produs în sisteme externe, ex. CRM); null dacă nu se mai știe. */
  productId: string | null;
  name: string;
  /** Codul produsului („Cod produs” din admin); null dacă produsul a fost șters din catalog. */
  code: string | null;
  quantity: number;
  unitPrice: number | null;
  lineTotal: number | null;
  /** true = prețul vine din catalogul actual (comandă mai veche, fără preț salvat la plasare). */
  estimated: boolean;
}

export interface RegistryOrder {
  id: string;
  orderNumber: string | null;
  /** Referința citibilă: numărul comenzii, sau ultimele 6 caractere din id dacă lipsește. */
  ref: string;
  createdAt: Date;
  orderStage: string;
  stageLabel: string;
  extractionStatus: ExtractionStatus;
  extractionLabel: string;
  name: string;
  phone: string;
  email: string | null;
  address: string;
  items: RegistryItem[];
  itemCount: number;
  total: number | null;
  paymentMethod: string;
  extractedAt: Date | null;
  extractedBy: string | null;
  exportId: string | null;
  archived: boolean;
}

export interface ExportSummary {
  id: string;
  number: number;
  status: string;
  statusLabel: string;
  orderCount: number;
  channel: string;
  initiatedById: string;
  initiatedByName: string;
  createdAt: Date;
  reservedUntil: Date;
  confirmedAt: Date | null;
  confirmedByName: string | null;
}

// ── Condiții de interogare ─────────────────────────────────────────────────────────────────────

function sourceFilter(scope?: Scope): Prisma.ContactMessageWhereInput {
  return { source: scope?.source ?? CART_ORDER_SOURCE };
}

// În Prisma + MongoDB, `field: null` și `{ not: ... }` NU potrivesc un câmp LIPSĂ (documentele vechi nu au
// câmpurile nou adăugate) — de aceea `isSet: false` e inclus explicit peste tot.
const NOT_EXTRACTED_FILTER: Prisma.ContactMessageWhereInput = {
  OR: [{ extractionStatus: { isSet: false } }, { extractionStatus: null }, { extractionStatus: EXTRACTION.NEW }],
};
const NOT_ARCHIVED_FILTER: Prisma.ContactMessageWhereInput = {
  OR: [{ archivedAt: { isSet: false } }, { archivedAt: null }],
};

function unextractedWhere(scope?: Scope): Prisma.ContactMessageWhereInput {
  return { AND: [sourceFilter(scope), NOT_EXTRACTED_FILTER] };
}

function normalizeExtraction(value: string | null | undefined): ExtractionStatus {
  return value === EXTRACTION.RESERVED || value === EXTRACTION.DONE ? value : EXTRACTION.NEW;
}

// ── Audit ──────────────────────────────────────────────────────────────────────────────────────

export async function logExportAudit(
  action: string,
  actor: Actor | { channel: string; id: string; name: string },
  exportId: string | null,
  details?: Prisma.InputJsonValue
): Promise<void> {
  try {
    await prisma.exportAuditLog.create({
      data: { action, exportId, actorType: actor.channel, actorId: actor.id, actorName: actor.name, details: details ?? undefined },
    });
  } catch (err) {
    // Auditul nu are voie să blocheze o operațiune deja făcută; eșecul rămâne în loguri.
    console.error("registru: scrierea în jurnalul de audit a eșuat:", err);
  }
}

// ── Produsele comenzii: preț salvat la plasare ─────────────────────────────────────────────────

interface StoredItem {
  productId: string;
  quantity: number;
}

function readStoredItems(raw: unknown): StoredItem[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((it): it is { productId: string; quantity: number } => typeof it?.productId === "string" && typeof it?.quantity === "number")
    .map((it) => ({ productId: it.productId, quantity: it.quantity }));
}

/**
 * Salvează numele și prețul unitar ale fiecărui produs în momentul plasării (sau al editării) comenzii —
 * prețurile din catalog se pot schimba ulterior, iar registrul trebuie să arate ce a plătit clientul.
 * Best-effort: un eșec nu are voie să blocheze plasarea comenzii.
 */
export async function saveOrderItemsSnapshot(orderId: string, rawItems: unknown): Promise<void> {
  try {
    const items = readStoredItems(rawItems);
    if (items.length === 0) return;
    const products = await prisma.product.findMany({ where: { id: { in: items.map((i) => i.productId) } } });
    const byId = new Map(products.map((p) => [p.id, p]));
    const snapshot = items.map((it) => {
      const p = byId.get(it.productId);
      if (!p) return { productId: it.productId, name: "Produs șters", quantity: it.quantity, unitPrice: null, lineTotal: null };
      const unitPrice = unitPriceFor(p.price, normalizeTiers(p), it.quantity);
      return {
        productId: it.productId,
        name: p.name,
        quantity: it.quantity,
        unitPrice,
        lineTotal: Math.round(unitPrice * it.quantity * 100) / 100,
      };
    });
    await prisma.contactMessage.update({ where: { id: orderId }, data: { orderItemsSnapshot: snapshot } });
  } catch (err) {
    console.error("registru: salvarea prețurilor comenzii a eșuat:", err);
  }
}

function readSnapshot(raw: unknown): { productId: string | null; name: string; quantity: number; unitPrice: number | null; lineTotal: number | null }[] | null {
  if (!Array.isArray(raw) || raw.length === 0) return null;
  const out = raw.map((it) => {
    const r = it as Record<string, unknown>;
    return {
      productId: typeof r?.productId === "string" ? r.productId : null,
      name: typeof r?.name === "string" ? r.name : "Produs",
      quantity: typeof r?.quantity === "number" ? r.quantity : 1,
      unitPrice: typeof r?.unitPrice === "number" ? r.unitPrice : null,
      lineTotal: typeof r?.lineTotal === "number" ? r.lineTotal : null,
    };
  });
  return out;
}

function extractMessageTotal(message: string | null): number | null {
  if (!message) return null;
  const line = message.match(/^Total cu livrare:\s*(.+)$/m)?.[1] ?? message.match(/^Subtotal:\s*(.+)$/m)?.[1];
  if (!line) return null;
  const n = Number(line.replace(/[^\d.,]/g, "").replace(",", "."));
  return Number.isFinite(n) && n > 0 ? n : null;
}

type MessageRow = Awaited<ReturnType<typeof prisma.contactMessage.findMany>>[number];

export async function toRegistryOrders(rows: MessageRow[]): Promise<RegistryOrder[]> {
  // Comenzile vechi nu au prețuri salvate — le estimăm din catalogul actual (marcate "estimated").
  // Codul produsului se citește mereu din catalog (se poate edita din admin), deci căutăm toate produsele comenzilor.
  const ids = [
    ...new Set(
      rows.flatMap((r) => {
        const snap = readSnapshot(r.orderItemsSnapshot);
        return snap ? snap.flatMap((s) => (s.productId ? [s.productId] : [])) : readStoredItems(r.orderItems).map((i) => i.productId);
      })
    ),
  ];
  const products = ids.length ? await prisma.product.findMany({ where: { id: { in: ids } } }) : [];
  const byId = new Map(products.map((p) => [p.id, p]));

  return rows.map((r) => {
    const snap = readSnapshot(r.orderItemsSnapshot);
    let items: RegistryItem[];
    if (snap) {
      const stored = readStoredItems(r.orderItems);
      items = snap.map((s, idx) => {
        const productId = s.productId ?? stored[idx]?.productId ?? null;
        const p = productId ? byId.get(productId) : undefined;
        const { productId: _omit, ...rest } = s;
        void _omit;
        return { productId, ...rest, code: p ? (p.code ?? p.id.slice(-6).toUpperCase()) : null, estimated: false };
      });
    } else {
      items = readStoredItems(r.orderItems).map((it) => {
        const p = byId.get(it.productId);
        if (!p) return { productId: it.productId, name: "Produs șters", code: null, quantity: it.quantity, unitPrice: null, lineTotal: null, estimated: true };
        const unitPrice = unitPriceFor(p.price, normalizeTiers(p), it.quantity);
        return { productId: p.id, name: p.name, code: p.code ?? p.id.slice(-6).toUpperCase(), quantity: it.quantity, unitPrice, lineTotal: Math.round(unitPrice * it.quantity * 100) / 100, estimated: true };
      });
    }

    const itemsSum = items.length > 0 && items.every((i) => i.lineTotal !== null) ? items.reduce((s, i) => s + (i.lineTotal ?? 0), 0) : null;
    const total = r.deliveryCodAmount ?? extractMessageTotal(r.message) ?? itemsSum;
    const extraction = normalizeExtraction(r.extractionStatus);
    return {
      id: r.id,
      orderNumber: r.orderNumber,
      ref: r.orderNumber ?? r.id.slice(-6).toUpperCase(),
      createdAt: r.createdAt,
      orderStage: r.orderStage ?? "noua",
      stageLabel: orderStageLabel(r.orderStage),
      extractionStatus: extraction,
      extractionLabel: EXTRACTION_LABELS[extraction],
      name: r.name,
      phone: r.phone,
      email: r.email,
      address: [r.deliveryLocality, r.deliveryAddress, r.deliveryZip].filter(Boolean).join(", "),
      items,
      itemCount: items.reduce((s, i) => s + i.quantity, 0),
      total,
      paymentMethod: PAYMENT_METHOD,
      extractedAt: r.extractedAt,
      extractedBy: r.extractedBy,
      exportId: r.extractionExportId,
      archived: Boolean(r.archivedAt),
    };
  });
}

// ── Formulări pentru cititorul de ecran / Telegram ─────────────────────────────────────────────

export function formatMoney(value: number | null): string {
  if (value === null) return "necunoscut";
  const rounded = Math.round(value * 100) / 100;
  return `${rounded.toLocaleString("ro-MD", { maximumFractionDigits: 2 })} lei`;
}

function pieces(n: number): string {
  return n === 1 ? "1 bucată" : `${n} bucăți`;
}

/** „Comanda 1052. Client Ion Popescu. 2 produse. Total 450 lei. Status extragere: neextrasă.” — o singură propoziție de citit. */
export function describeOrderForSpeech(o: RegistryOrder): string {
  const products = o.items.length === 1 ? "un produs" : `${o.items.length} produse`;
  return `Comanda ${o.ref}. Client ${o.name}. ${products}. Total ${formatMoney(o.total)}. Status: ${o.extractionLabel.toLowerCase()}.`;
}

/** „2 bucăți Produs A și 1 bucată Produs B” — pentru notificări. */
export function describeItemsForSpeech(items: RegistryItem[]): string {
  if (items.length === 0) return "fără produse înregistrate";
  const parts = items.map((i) => `${pieces(i.quantity)} ${i.name}`);
  return parts.length === 1 ? parts[0] : `${parts.slice(0, -1).join(", ")} și ${parts[parts.length - 1]}`;
}

export function formatDateTime(d: Date): string {
  return new Intl.DateTimeFormat("ro-MD", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }).format(d);
}

// ── Citire registru ────────────────────────────────────────────────────────────────────────────

export type RegistryFilter = "toate" | ExtractionStatus;

export interface ListOptions {
  status?: RegistryFilter;
  /** Implicit, comenzile arhivate sunt ascunse (dar rămân în registru și în exporturi). */
  includeArchived?: boolean;
  q?: string;
  page?: number;
  pageSize?: number;
  scope?: Scope;
}

function buildListWhere(opts: ListOptions): Prisma.ContactMessageWhereInput {
  const and: Prisma.ContactMessageWhereInput[] = [sourceFilter(opts.scope)];
  if (opts.status === EXTRACTION.NEW) and.push(NOT_EXTRACTED_FILTER);
  else if (opts.status === EXTRACTION.RESERVED || opts.status === EXTRACTION.DONE) and.push({ extractionStatus: opts.status });
  if (!opts.includeArchived) and.push(NOT_ARCHIVED_FILTER);
  const q = opts.q?.trim();
  if (q) {
    and.push({
      OR: [
        { orderNumber: q.replace(/^#/, "") },
        { name: { contains: q, mode: "insensitive" } },
        { phone: { contains: q } },
      ],
    });
  }
  return { AND: and };
}

export async function listRegistry(opts: ListOptions = {}) {
  const pageSize = Math.min(Math.max(opts.pageSize ?? 10, 1), 100);
  const where = buildListWhere(opts);
  const total = await prisma.contactMessage.count({ where });
  const pages = Math.max(1, Math.ceil(total / pageSize));
  const page = Math.min(Math.max(opts.page ?? 1, 1), pages);
  const rows = await prisma.contactMessage.findMany({
    where,
    orderBy: { createdAt: "desc" },
    skip: (page - 1) * pageSize,
    take: pageSize,
  });
  return { orders: await toRegistryOrders(rows), total, page, pages, pageSize };
}

/** Toate comenzile care se potrivesc filtrului (fără paginare, cel mult 5000) — pentru descărcarea listei în Excel. */
export async function listRegistryAll(opts: ListOptions = {}): Promise<RegistryOrder[]> {
  const rows = await prisma.contactMessage.findMany({
    where: buildListWhere(opts),
    orderBy: { createdAt: "desc" },
    take: 5000,
  });
  return toRegistryOrders(rows);
}

export async function registryCounts(scope?: Scope) {
  const base = sourceFilter(scope);
  const [neextrase, rezervate, extrase, total] = await Promise.all([
    prisma.contactMessage.count({ where: unextractedWhere(scope) }),
    prisma.contactMessage.count({ where: { AND: [base, { extractionStatus: EXTRACTION.RESERVED }] } }),
    prisma.contactMessage.count({ where: { AND: [base, { extractionStatus: EXTRACTION.DONE }] } }),
    prisma.contactMessage.count({ where: base }),
  ]);
  return { neextrase, rezervate, extrase, total };
}

/** Caută o comandă după număr („1052”) sau după id-ul intern. */
export async function findRegistryOrder(reference: string, scope?: Scope): Promise<RegistryOrder | null> {
  const ref = reference.trim().replace(/^#/, "");
  if (!ref) return null;
  const or: Prisma.ContactMessageWhereInput[] = [{ orderNumber: ref }];
  if (/^[0-9a-fA-F]{24}$/.test(ref)) or.push({ id: ref });
  const row = await prisma.contactMessage.findFirst({
    where: { AND: [sourceFilter(scope), { OR: or }] },
    orderBy: { createdAt: "desc" },
  });
  if (!row) return null;
  return (await toRegistryOrders([row]))[0];
}

// ── Arhivare (în loc de ștergere) ──────────────────────────────────────────────────────────────

export async function setOrderArchived(orderId: string, archived: boolean, actor: Actor, scope?: Scope): Promise<boolean> {
  const res = await prisma.contactMessage.updateMany({
    where: { AND: [sourceFilter(scope), { id: orderId }] },
    data: { archivedAt: archived ? new Date() : null },
  });
  if (res.count > 0) await logExportAudit(archived ? "comanda_arhivata" : "comanda_dezarhivata", actor, null, { orderId });
  return res.count > 0;
}

// ── Exporturi ──────────────────────────────────────────────────────────────────────────────────

function toExportSummary(e: Awaited<ReturnType<typeof prisma.orderExport.findUniqueOrThrow>>): ExportSummary {
  return {
    id: e.id,
    number: e.number,
    status: e.status,
    statusLabel: EXPORT_STATUS_LABELS[e.status] ?? e.status,
    orderCount: e.orderCount,
    channel: e.channel,
    initiatedById: e.initiatedById,
    initiatedByName: e.initiatedByName,
    createdAt: e.createdAt,
    reservedUntil: e.reservedUntil,
    confirmedAt: e.confirmedAt,
    confirmedByName: e.confirmedByName,
  };
}

async function nextExportNumber(): Promise<number> {
  const counter = await prisma.counter.upsert({
    where: { name: "orderExport" },
    update: { value: { increment: 1 } },
    create: { name: "orderExport", value: 1 },
  });
  return counter.value;
}

async function releaseOrders(exportId: string): Promise<number> {
  const res = await prisma.contactMessage.updateMany({
    where: { extractionExportId: exportId, extractionStatus: EXTRACTION.RESERVED },
    data: { extractionStatus: EXTRACTION.NEW, extractionExportId: null },
  });
  return res.count;
}

const SYSTEM_ACTOR = { channel: "system", id: "system", name: "Sistem" };

/**
 * Rezervările neconfirmate după `reservedUntil` revin la „Neextrasă”. Rulată leneș la accesarea registrului —
 * nu depinde de un cron, deci o repornire a serverului nu poate lăsa comenzi blocate.
 */
export async function expireStaleExports(): Promise<number> {
  const stale = await prisma.orderExport.findMany({ where: { status: "pregatit", reservedUntil: { lt: new Date() } } });
  let released = 0;
  for (const exp of stale) {
    const claimed = await prisma.orderExport.updateMany({
      where: { id: exp.id, status: "pregatit" },
      data: { status: "expirat", closedAt: new Date(), closedReason: "rezervare expirată" },
    });
    if (claimed.count === 0) continue;
    const n = await releaseOrders(exp.id);
    released += n;
    await logExportAudit("export_expirat", SYSTEM_ACTOR, exp.id, { eliberate: n });
  }
  return released;
}

export type PrepareResult =
  | { kind: "created" | "resumed"; export: ExportSummary }
  | { kind: "none"; active: ExportSummary[] };

/**
 * Pornește extragerea: dacă utilizatorul are deja un export pregătit îl REIA (nu creează un duplicat);
 * altfel rezervă atomic toate comenzile neextrase. Două cereri simultane nu pot rezerva aceeași comandă:
 * `updateMany` re-evaluează condiția „neextrasă” pe fiecare document, iar o comandă deja rezervată nu o mai îndeplinește.
 */
export async function prepareExport(actor: Actor, scope?: Scope): Promise<PrepareResult> {
  await expireStaleExports();

  const mine = await prisma.orderExport.findFirst({
    where: { status: "pregatit", channel: actor.channel, initiatedById: actor.id },
    orderBy: { createdAt: "desc" },
  });
  if (mine) {
    const count = await prisma.contactMessage.count({ where: { extractionExportId: mine.id, extractionStatus: EXTRACTION.RESERVED } });
    const refreshed = count === mine.orderCount ? mine : await prisma.orderExport.update({ where: { id: mine.id }, data: { orderCount: count } });
    await logExportAudit("export_reluat", actor, mine.id, { comenzi: count });
    return { kind: "resumed", export: toExportSummary(refreshed) };
  }

  const number = await nextExportNumber();
  const exp = await prisma.orderExport.create({
    data: {
      number,
      status: "pregatit",
      channel: actor.channel,
      initiatedById: actor.id,
      initiatedByName: actor.name,
      reservedUntil: new Date(Date.now() + RESERVATION_HOURS * 3600 * 1000),
    },
  });

  const reserved = await prisma.contactMessage.updateMany({
    where: unextractedWhere(scope),
    data: { extractionStatus: EXTRACTION.RESERVED, extractionExportId: exp.id },
  });

  if (reserved.count === 0) {
    // Nimic de extras: exportul gol nu are rost în istoric.
    await prisma.orderExport.delete({ where: { id: exp.id } }).catch(() => undefined);
    const active = await prisma.orderExport.findMany({ where: { status: "pregatit" }, orderBy: { createdAt: "desc" } });
    return { kind: "none", active: active.map(toExportSummary) };
  }

  const ids = (await prisma.contactMessage.findMany({ where: { extractionExportId: exp.id }, select: { id: true } })).map((m) => m.id);
  const saved = await prisma.orderExport.update({ where: { id: exp.id }, data: { orderIds: ids, orderCount: ids.length } });
  await logExportAudit("export_pregatit", actor, exp.id, { comenzi: ids.length, numar: number });
  return { kind: "created", export: toExportSummary(saved) };
}

// ── „Următoarea comandă”: se oferă pe rând, fără să introduci numărul ───────────────────────────
// Registrul are două liste: neextrase și extrase. „Următoarea” = cea mai VECHE comandă neextrasă (în ordinea primirii);
// în clipa în care e oferită trece la „extrase", deci data viitoare se oferă următoarea. Revendicarea e atomică
// (updateMany pe documentul ales, doar dacă e încă neextras), deci două cereri simultane nu primesc aceeași comandă.
function actorLabel(actor: Actor): string {
  return `${actor.name} (${actor.channel === "site" ? "site" : actor.channel === "telegram" ? "Telegram" : "API"})`;
}

export async function claimNextOrder(actor: Actor, scope?: Scope): Promise<{ order: RegistryOrder; remaining: number } | null> {
  for (let attempt = 0; attempt < 5; attempt++) {
    const where: Prisma.ContactMessageWhereInput = { AND: [unextractedWhere(scope), NOT_ARCHIVED_FILTER] };
    const next = await prisma.contactMessage.findFirst({ where, orderBy: { createdAt: "asc" }, select: { id: true } });
    if (!next) return null;
    const claimed = await prisma.contactMessage.updateMany({
      where: { AND: [{ id: next.id }, NOT_EXTRACTED_FILTER] },
      data: { extractionStatus: EXTRACTION.DONE, extractedAt: new Date(), extractedBy: actorLabel(actor) },
    });
    if (claimed.count === 1) {
      const row = await prisma.contactMessage.findUnique({ where: { id: next.id } });
      if (!row) return null;
      const remaining = await prisma.contactMessage.count({ where });
      await logExportAudit("comanda_urmatoare", actor, null, { comanda: row.orderNumber ?? row.id, ramase: remaining });
      return { order: (await toRegistryOrders([row]))[0], remaining };
    }
    // altcineva a luat-o între timp — încercăm următoarea
  }
  return null;
}

/** Ultima comandă oferită prin „următoarea” de același solicitant (ca să poți reciti dacă ai pierdut-o pe drum). */
export async function lastClaimedOrder(actor: Actor, scope?: Scope): Promise<RegistryOrder | null> {
  const row = await prisma.contactMessage.findFirst({
    where: { AND: [sourceFilter(scope), { extractionStatus: EXTRACTION.DONE }, { extractedBy: actorLabel(actor) }] },
    orderBy: { extractedAt: "desc" },
  });
  return row ? (await toRegistryOrders([row]))[0] : null;
}

/** Pune o comandă extrasă înapoi la „neextrasă” (ex. fișierul nu a ajuns). Nu atinge comenzile dintr-un export Excel. */
export async function reopenOrder(reference: string, actor: Actor, scope?: Scope): Promise<RegistryOrder | null> {
  const found = await findRegistryOrder(reference, scope);
  if (!found || found.extractionStatus !== EXTRACTION.DONE || found.exportId) return null;
  const done = await prisma.contactMessage.updateMany({
    where: { id: found.id, extractionStatus: EXTRACTION.DONE },
    data: { extractionStatus: EXTRACTION.NEW, extractedAt: null, extractedBy: null },
  });
  if (done.count === 0) return null;
  await logExportAudit("comanda_redeschisa", actor, null, { comanda: found.ref });
  return findRegistryOrder(found.ref, scope);
}

export async function getExportSummary(exportId: string): Promise<ExportSummary | null> {
  if (!/^[0-9a-fA-F]{24}$/.test(exportId)) return null;
  const exp = await prisma.orderExport.findUnique({ where: { id: exportId } });
  return exp ? toExportSummary(exp) : null;
}

export async function getExportOrders(exportId: string): Promise<RegistryOrder[]> {
  const rows = await prisma.contactMessage.findMany({ where: { extractionExportId: exportId }, orderBy: { createdAt: "asc" } });
  return toRegistryOrders(rows);
}

/** Exporturile active (pregătite, neconfirmate) — pentru reluare și pentru mesajul „există un export în curs”. */
export async function listActiveExports(): Promise<ExportSummary[]> {
  await expireStaleExports();
  const rows = await prisma.orderExport.findMany({ where: { status: "pregatit" }, orderBy: { createdAt: "desc" } });
  return rows.map(toExportSummary);
}

export async function listExports(limit = 10): Promise<ExportSummary[]> {
  const rows = await prisma.orderExport.findMany({ orderBy: { createdAt: "desc" }, take: limit });
  return rows.map(toExportSummary);
}

export type ConfirmResult =
  | { kind: "confirmed"; export: ExportSummary; orderCount: number; alreadyConfirmed: boolean }
  | { kind: "closed"; status: string; statusLabel: string }
  | { kind: "not_found" };

/**
 * Confirmă extragerea: abia acum comenzile devin „Extrase”. Operațiunea e idempotentă — o a doua apăsare
 * (sau o cerere reluată după o cădere de rețea) nu strică nimic și nu dublează nimic.
 */
export async function confirmExport(exportId: string, actor: Actor): Promise<ConfirmResult> {
  const exp = await getExportSummary(exportId);
  if (!exp) return { kind: "not_found" };
  if (exp.status === "anulat" || exp.status === "expirat") {
    return { kind: "closed", status: exp.status, statusLabel: exp.statusLabel };
  }

  const now = new Date();
  const transition = await prisma.orderExport.updateMany({
    where: { id: exportId, status: "pregatit" },
    data: { status: "confirmat", confirmedAt: now, confirmedByName: actor.name, closedAt: now },
  });
  const alreadyConfirmed = transition.count === 0;
  if (alreadyConfirmed) {
    // Altcineva (sau o încercare anterioară) l-a confirmat deja — continuăm doar dacă e într-adevăr confirmat.
    const current = await getExportSummary(exportId);
    if (!current || current.status !== "confirmat") {
      return { kind: "closed", status: current?.status ?? "necunoscut", statusLabel: current?.statusLabel ?? "Necunoscut" };
    }
  }

  // Idempotent: doar comenzile încă „rezervate” de acest export trec la „extrase”; repetat, nu mai găsește nimic.
  await prisma.contactMessage.updateMany({
    where: { extractionExportId: exportId, extractionStatus: EXTRACTION.RESERVED },
    data: { extractionStatus: EXTRACTION.DONE, extractedAt: now, extractedBy: `${actor.name} (${actor.channel === "site" ? "site" : "Telegram"})` },
  });
  const orderCount = await prisma.contactMessage.count({ where: { extractionExportId: exportId, extractionStatus: EXTRACTION.DONE } });
  if (!alreadyConfirmed) await logExportAudit("export_confirmat", actor, exportId, { comenzi: orderCount });

  const final = (await getExportSummary(exportId))!;
  return { kind: "confirmed", export: final, orderCount, alreadyConfirmed };
}

export type CancelResult =
  | { kind: "cancelled"; export: ExportSummary; released: number }
  | { kind: "closed"; status: string; statusLabel: string }
  | { kind: "not_found" };

/** Anulează exportul: comenzile revin la „Neextrasă”; istoricul exportului și al comenzilor rămâne. */
export async function cancelExport(exportId: string, actor: Actor, reason = "anulat de utilizator"): Promise<CancelResult> {
  const exp = await getExportSummary(exportId);
  if (!exp) return { kind: "not_found" };
  if (exp.status !== "pregatit") return { kind: "closed", status: exp.status, statusLabel: exp.statusLabel };

  const claimed = await prisma.orderExport.updateMany({
    where: { id: exportId, status: "pregatit" },
    data: { status: "anulat", closedAt: new Date(), closedReason: reason },
  });
  if (claimed.count === 0) {
    const current = await getExportSummary(exportId);
    return { kind: "closed", status: current?.status ?? "necunoscut", statusLabel: current?.statusLabel ?? "Necunoscut" };
  }
  const released = await releaseOrders(exportId);
  await logExportAudit("export_anulat", actor, exportId, { eliberate: released, motiv: reason });
  return { kind: "cancelled", export: (await getExportSummary(exportId))!, released };
}
