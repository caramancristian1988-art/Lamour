// Notificările site → CRM: PARTEA DE TRIMITERE. Citește coada (SiteSyncOutbox) în ordinea secvenței și trimite fiecare eveniment la CRM,
// semnat HMAC-SHA256, respectând contractul „Integrarea site-ului cu CRM v1":
//  • antete: Content-Type, X-CRM-Timestamp (secunde Unix, nou la fiecare încercare), X-CRM-Signature: sha256=<hex>;
//  • semnătura = HMAC-SHA256(cheie, UTF8(timestamp + "\n") + octeții EXACȚI ai corpului), cheia fiind cea existentă (CRM_SYNC_KEY);
//  • o reluare păstrează același eventId și aceiași octeți de corp (corpul se îngheață la prima încercare);
//  • 200 + ok:true (inclusiv duplicate / stale / needsReview) = confirmat; 400/413/415/422 = invalid, nu se mai repetă;
//    401/409/429/5xx/timeout/rețea = rămâne în coadă, reîncercare cu pauze crescătoare (5 s, 15 s, 60 s, 5 min, 15 min, apoi la 15 min).
// Ordinea se păstrează: dacă un eveniment nu poate fi livrat acum, cele de după el așteaptă (altfel CRM-ul ar vedea stări în dezordine).
// Un singur dispecer o dată (lease în baza de date), chiar dacă mai multe instanțe ale site-ului pornesc simultan.
import { createHmac, randomUUID } from "node:crypto";
import { prisma } from "./prisma";
import { syncEnabled } from "./siteSyncEnqueue";
import { getOrder } from "./catalogApiOrders";
import { getProduct } from "./catalogApiProducts";
import { listCategories } from "./catalogApiCategories";

const DEFAULT_URL = "https://crm-lumintehnica.vercel.app/api/site-sync/events";
const MAX_BODY_BYTES = 262_144;
const SEND_TIMEOUT_MS = 10_000;
const LEASE_MS = 90_000;
const BACKOFF_SECONDS = [5, 15, 60, 300, 900];
const ALERT_AFTER_ATTEMPTS = 8;
const STATE_NAME = "outbox";

type Outbox = Awaited<ReturnType<typeof prisma.siteSyncOutbox.findFirstOrThrow>>;

export interface DispatchReport {
  skipped?: "disabled" | "paused" | "busy";
  sent: number;
  failed: number;
  retrying: number;
  waitingUntil?: Date;
}

function crmUrl(): string {
  return (process.env.CRM_SYNC_URL ?? "").trim() || DEFAULT_URL;
}

// ── Construirea corpului (starea COMPLETĂ a entității, citită acum) ──
type Built = { type: string; body: string } | { skip: string } | { tooLarge: string };

function envelope(ev: Outbox, type: string, data: unknown): string {
  return JSON.stringify({ schemaVersion: 1, eventId: ev.eventId, sequence: ev.sequence, type, data });
}

async function buildBody(ev: Outbox): Promise<Built> {
  if (ev.type === "categories.replace") {
    const cats = await listCategories({ tree: true });
    if (!cats.ok) throw new Error(`categoriile nu au putut fi citite: ${cats.error}`);
    return fit(ev, "categories.replace", { categorii: (cats.data as { categorii: unknown[] }).categorii });
  }

  if (ev.type === "order.upsert") {
    const order = await getOrder(ev.entityId ?? "");
    if (!order.ok) {
      if (order.status === 404) return { skip: "comanda nu mai există" };
      throw new Error(order.error);
    }
    return fit(ev, "order.upsert", order.data);
  }

  // product.upsert / product.delete — dacă produsul a fost șters între timp, evenimentul devine product.delete
  const id = ev.entityId ?? "";
  if (ev.type === "product.delete") return fit(ev, "product.delete", { id });
  const product = await getProduct(id);
  if (!product.ok) {
    if (product.status === 404) return fit(ev, "product.delete", { id });
    throw new Error(product.error);
  }
  return fit(ev, "product.upsert", product.data);
}

/** Corpul trebuie să încapă în 262.144 de octeți: la o comandă prea mare scoatem textul brut al mesajului (restul rămâne complet). */
function fit(ev: Outbox, type: string, data: unknown): Built {
  let body = envelope(ev, type, data);
  if (Buffer.byteLength(body, "utf8") <= MAX_BODY_BYTES) return { type, body };
  if (type === "order.upsert" && data && typeof data === "object") {
    body = envelope(ev, type, { ...(data as Record<string, unknown>), message: null });
    if (Buffer.byteLength(body, "utf8") <= MAX_BODY_BYTES) return { type, body };
  }
  return { tooLarge: `corpul depășește ${MAX_BODY_BYTES} de octeți` };
}

// ── Trimitere ──
function sign(key: string, timestamp: string, body: Buffer): string {
  return `sha256=${createHmac("sha256", key).update(`${timestamp}\n`, "utf8").update(body).digest("hex")}`;
}

interface SendResult {
  outcome: "sent" | "invalid" | "retry";
  status: number | null;
  error?: string;
  retryAfterSeconds?: number;
}

async function send(body: string): Promise<SendResult> {
  const key = (process.env.CRM_SYNC_KEY ?? "").trim();
  const timestamp = String(Math.floor(Date.now() / 1000)); // nou la fiecare încercare
  const bytes = Buffer.from(body, "utf8");
  let res: Response;
  try {
    res = await fetch(crmUrl(), {
      method: "POST",
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "X-CRM-Timestamp": timestamp,
        "X-CRM-Signature": sign(key, timestamp, bytes),
      },
      body: bytes,
      redirect: "manual",
      signal: AbortSignal.timeout(SEND_TIMEOUT_MS),
      cache: "no-store",
    });
  } catch (err) {
    // timeout / conexiune întreruptă: e posibil ca prima încercare să fi fost deja salvată — se reia același eveniment, același corp
    return { outcome: "retry", status: null, error: `rețea: ${(err as Error).message}` };
  }

  const text = await res.text().catch(() => "");
  if (res.status === 200) {
    try {
      if ((JSON.parse(text) as { ok?: unknown }).ok === true) return { outcome: "sent", status: 200 };
    } catch {
      // corp neașteptat → tratat ca eroare temporară mai jos
    }
    return { outcome: "retry", status: 200, error: `răspuns 200 fără ok:true: ${text.slice(0, 200)}` };
  }
  if ([400, 413, 415, 422].includes(res.status)) return { outcome: "invalid", status: res.status, error: text.slice(0, 500) };
  const retryAfter = Number(res.headers.get("retry-after"));
  return {
    outcome: "retry",
    status: res.status,
    error: text.slice(0, 500),
    retryAfterSeconds: res.status === 429 && Number.isFinite(retryAfter) && retryAfter > 0 ? retryAfter : undefined,
  };
}

function backoffSeconds(attempts: number, retryAfter?: number): number {
  const base = BACKOFF_SECONDS[Math.min(attempts - 1, BACKOFF_SECONDS.length - 1)];
  const jitter = 1 + Math.random() * 0.2; // variație aleatoare, ca reluările să nu pornească toate odată
  return Math.max(Math.round(base * jitter), retryAfter ?? 0);
}

async function recordState(patch: { success?: boolean; error?: string | null; status?: number | null }) {
  const now = new Date();
  await prisma.siteSyncState.upsert({
    where: { name: STATE_NAME },
    update: {
      lastAttemptAt: now,
      ...(patch.success ? { lastSuccessAt: now, lastError: null } : { lastError: patch.error ?? null }),
      lastHttpStatus: patch.status ?? null,
    },
    create: { name: STATE_NAME, lastAttemptAt: now, ...(patch.success ? { lastSuccessAt: now } : { lastError: patch.error ?? null }), lastHttpStatus: patch.status ?? null },
  });
}

// ── Lease ──
async function acquireLease(owner: string): Promise<boolean> {
  await prisma.siteSyncState.upsert({ where: { name: STATE_NAME }, update: {}, create: { name: STATE_NAME } });
  const now = new Date();
  const got = await prisma.siteSyncState.updateMany({
    where: { name: STATE_NAME, OR: [{ leaseUntil: { isSet: false } }, { leaseUntil: null }, { leaseUntil: { lt: now } }] },
    data: { leaseUntil: new Date(now.getTime() + LEASE_MS), leaseOwner: owner },
  });
  return got.count > 0;
}

async function renewLease(owner: string) {
  await prisma.siteSyncState.updateMany({ where: { name: STATE_NAME, leaseOwner: owner }, data: { leaseUntil: new Date(Date.now() + LEASE_MS) } });
}

async function releaseLease(owner: string) {
  await prisma.siteSyncState.updateMany({ where: { name: STATE_NAME, leaseOwner: owner }, data: { leaseUntil: null, leaseOwner: null } });
}

/** Trimite ce e de trimis, în ordine, cel mult `budgetMs` (implicit 45 s). Sigur de apelat oricând și de oriunde (lease). */
export async function dispatchOutbox(opts: { budgetMs?: number } = {}): Promise<DispatchReport> {
  const report: DispatchReport = { sent: 0, failed: 0, retrying: 0 };
  if (!syncEnabled()) return { ...report, skipped: "disabled" };
  if (process.env.CRM_SYNC_PAUSED === "1") return { ...report, skipped: "paused" };

  const owner = randomUUID();
  if (!(await acquireLease(owner))) return { ...report, skipped: "busy" };
  const deadline = Date.now() + (opts.budgetMs ?? 45_000);

  try {
    while (Date.now() < deadline) {
      const ev = await prisma.siteSyncOutbox.findFirst({ where: { status: "pending" }, orderBy: { sequence: "asc" } });
      if (!ev) break;
      if (ev.nextAttemptAt.getTime() > Date.now()) {
        report.waitingUntil = ev.nextAttemptAt; // ordinea contează: cele de după așteaptă pauza acestuia
        break;
      }
      await renewLease(owner);

      // 1) corpul: la prima încercare se construiește din starea curentă și se îngheață; la reluări se refolosește
      let body = ev.body;
      if (!body) {
        // marcaj ÎNAINTE de citire: o modificare care apare între marcaj și citire primește propriul eveniment (nu se unește cu acesta)
        await prisma.siteSyncOutbox.update({ where: { id: ev.id }, data: { body: "" } });
        let built: Built;
        try {
          built = await buildBody(ev);
        } catch (err) {
          const attempts = ev.attempts + 1;
          const message = `construirea corpului a eșuat: ${(err as Error).message}`;
          await prisma.siteSyncOutbox.update({ where: { id: ev.id }, data: { attempts, lastError: message, nextAttemptAt: new Date(Date.now() + backoffSeconds(attempts) * 1000) } });
          report.retrying++;
          console.error(`[site-sync] ${ev.type} #${ev.sequence}: ${message}`);
          break;
        }
        if ("skip" in built) {
          await prisma.siteSyncOutbox.update({ where: { id: ev.id }, data: { status: "sent", sentAt: new Date(), lastError: built.skip, body: "" } });
          continue;
        }
        if ("tooLarge" in built) {
          await prisma.siteSyncOutbox.update({ where: { id: ev.id }, data: { status: "failed", lastError: built.tooLarge } });
          console.error(`[site-sync] ${ev.type} #${ev.sequence} respins local: ${built.tooLarge}`);
          report.failed++;
          continue;
        }
        body = built.body;
        await prisma.siteSyncOutbox.update({ where: { id: ev.id }, data: { body, type: built.type } });
      }

      // 2) trimiterea
      const result = await send(body);
      const attempts = ev.attempts + 1;
      if (result.outcome === "sent") {
        await prisma.siteSyncOutbox.update({ where: { id: ev.id }, data: { status: "sent", sentAt: new Date(), attempts, lastError: null, lastHttpStatus: result.status } });
        await recordState({ success: true, status: result.status });
        report.sent++;
        continue;
      }
      if (result.outcome === "invalid") {
        await prisma.siteSyncOutbox.update({ where: { id: ev.id }, data: { status: "failed", attempts, lastError: result.error ?? "invalid", lastHttpStatus: result.status } });
        await recordState({ error: `eveniment invalid (${result.status}): ${result.error ?? ""}`, status: result.status });
        console.error(`[site-sync] ${ev.type} #${ev.sequence} respins de CRM (${result.status}): ${result.error}`);
        report.failed++;
        continue;
      }
      // temporar (401 / 409 / 429 / 5xx / rețea): rămâne în coadă, iar cele de după el așteaptă
      const wait = backoffSeconds(attempts, result.retryAfterSeconds);
      await prisma.siteSyncOutbox.update({
        where: { id: ev.id },
        data: { attempts, lastError: result.error ?? null, lastHttpStatus: result.status, nextAttemptAt: new Date(Date.now() + wait * 1000) },
      });
      await recordState({ error: result.error ?? null, status: result.status });
      console.error(
        `[site-sync] ${attempts >= ALERT_AFTER_ATTEMPTS ? "ALERTĂ " : ""}${ev.type} #${ev.sequence}: încercarea ${attempts} eșuată (${result.status ?? "fără răspuns"}): ${result.error ?? ""} — reîncerc în ${wait}s`
      );
      report.retrying++;
      report.waitingUntil = new Date(Date.now() + wait * 1000);
      break;
    }
  } finally {
    await releaseLease(owner);
  }
  return report;
}

// ── Monitorizare ──
export async function getSyncStatus() {
  const [pending, failed, oldest, state, recentFailed] = await Promise.all([
    prisma.siteSyncOutbox.count({ where: { status: "pending" } }),
    prisma.siteSyncOutbox.count({ where: { status: "failed" } }),
    prisma.siteSyncOutbox.findFirst({ where: { status: "pending" }, orderBy: { sequence: "asc" } }),
    prisma.siteSyncState.findUnique({ where: { name: STATE_NAME } }),
    prisma.siteSyncOutbox.findMany({ where: { status: "failed" }, orderBy: { sequence: "desc" }, take: 10 }),
  ]);
  return {
    enabled: syncEnabled(),
    paused: process.env.CRM_SYNC_PAUSED === "1",
    target: crmUrl(),
    pending,
    failed,
    oldestPending: oldest
      ? {
          eventId: oldest.eventId,
          sequence: oldest.sequence,
          type: oldest.type,
          createdAt: oldest.createdAt,
          ageSeconds: Math.round((Date.now() - oldest.createdAt.getTime()) / 1000),
          attempts: oldest.attempts,
          nextAttemptAt: oldest.nextAttemptAt,
          lastError: oldest.lastError,
          lastHttpStatus: oldest.lastHttpStatus,
        }
      : null,
    lastSuccessAt: state?.lastSuccessAt ?? null,
    lastAttemptAt: state?.lastAttemptAt ?? null,
    lastError: state?.lastError ?? null,
    lastHttpStatus: state?.lastHttpStatus ?? null,
    recentFailed: recentFailed.map((e) => ({ eventId: e.eventId, sequence: e.sequence, type: e.type, entityKey: e.entityKey, attempts: e.attempts, lastError: e.lastError, lastHttpStatus: e.lastHttpStatus })),
  };
}

/** Repune în coadă evenimentele respinse ca invalide (după ce s-a reparat cauza). Corpul se reconstruiește din starea curentă. */
export async function requeueFailed(): Promise<number> {
  const res = await prisma.siteSyncOutbox.updateMany({ where: { status: "failed" }, data: { status: "pending", body: null, attempts: 0, nextAttemptAt: new Date(), lastError: null } });
  return res.count;
}

/**
 * Reconcilierea completă / punctul de pornire: pune în coadă starea ACTUALĂ a fiecărui produs, a fiecărei comenzi din coș și a arborelui
 * de categorii, cu secvențe noi. Folosită la inițializare (după importul inițial din CRM) și ca plasă de siguranță dacă s-a pierdut ceva.
 */
export async function enqueueFullResync(): Promise<{ products: number; orders: number; categories: number }> {
  const { enqueueEvents } = await import("./siteSyncEnqueue");
  const { CART_ORDER_SOURCE } = await import("./orderStages");
  const [products, orders] = await Promise.all([
    prisma.product.findMany({ select: { id: true } }),
    prisma.contactMessage.findMany({ where: { source: CART_ORDER_SOURCE }, select: { id: true } }),
  ]);
  const base = prisma as unknown as Parameters<typeof enqueueEvents>[0];
  const categories = await enqueueEvents(base, [{ kind: "categories" }]);
  const p = await enqueueEvents(base, products.map((x) => ({ kind: "product" as const, id: x.id })));
  const o = await enqueueEvents(base, orders.map((x) => ({ kind: "order" as const, id: x.id })));
  return { products: p, orders: o, categories };
}
