// Notificările site → CRM: PARTEA DE ÎNREGISTRARE (coada persistentă). Orice scriere de produs, categorie sau comandă din coș — din admin,
// Telegram, Excel, API-ul de catalog — trece prin extensia Prisma de mai jos (lib/prisma.ts) și lasă un rând în coadă (SiteSyncOutbox).
// Trimiterea propriu-zisă (semnătură HMAC, reîncercări) e în lib/siteSyncDispatch.ts.
//
// Activare: variabila CRM_SYNC_KEY (cheia API EXISTENTĂ a CRM-ului, aceeași valoare ca în „Catalog site → Setări" din CRM). Fără ea, nimic nu
// se înregistrează și nimic nu se trimite — comportamentul site-ului rămâne exact cel de dinainte.
//
// Ce se pune în coadă NU e starea entității, ci doar „entitatea X s-a schimbat" + o secvență. Starea COMPLETĂ se citește chiar înainte de
// prima încercare de trimitere, apoi se îngheață (reluările trimit aceiași octeți). Astfel două modificări apropiate nu pot lăsa în coadă o
// stare veche cu secvență mai mare decât una nouă, iar modificările repetate ale aceleiași entități cât timp nu s-a trimis nimic se unesc.
import { randomUUID } from "node:crypto";
import type { PrismaClient } from "@prisma/client";
import { after } from "next/server";
import { CART_ORDER_SOURCE } from "./orderStages";

export function syncEnabled(): boolean {
  return (process.env.CRM_SYNC_KEY ?? "").trim().length >= 16;
}

export type SyncKind = "order" | "product" | "categories";
export interface SyncEntity {
  kind: SyncKind;
  id?: string;
  deleted?: boolean;
}

const SEQUENCE_COUNTER = "siteSyncSequence";

// Indexurile unice ale cozii (eventId, sequence) — create o dată pe instanță, cu numele pe care le folosește Prisma.
let indexesReady: Promise<void> | null = null;
export function ensureOutboxIndexes(db: PrismaClient): Promise<void> {
  if (!indexesReady) {
    indexesReady = db
      .$runCommandRaw({
        createIndexes: "SiteSyncOutbox",
        indexes: [
          { key: { eventId: 1 }, name: "SiteSyncOutbox_eventId_key", unique: true },
          { key: { sequence: 1 }, name: "SiteSyncOutbox_sequence_key", unique: true },
          { key: { status: 1, sequence: 1 }, name: "SiteSyncOutbox_status_sequence_idx" },
          { key: { entityKey: 1, status: 1 }, name: "SiteSyncOutbox_entityKey_status_idx" },
        ],
      })
      .then(() => undefined)
      .catch((err) => {
        indexesReady = null;
        throw err;
      });
  }
  return indexesReady;
}

const typeOf = (e: SyncEntity): string =>
  e.kind === "order" ? "order.upsert" : e.kind === "categories" ? "categories.replace" : e.deleted ? "product.delete" : "product.upsert";
const keyOf = (e: SyncEntity): string => (e.kind === "categories" ? "categories" : `${e.kind}:${e.id}`);

// Dispeceratul pornește după răspunsul cererii care a produs modificarea (`after`), iar dacă CRM-ul nu răspunde, reîncercările sunt făcute de
// apelul periodic /api/catalog/sync/dispatch (cron). Un singur apel programat pe cerere, oricâte scrieri a făcut.
let scheduled = false;
export function scheduleDispatch(): void {
  if (scheduled) return;
  scheduled = true;
  try {
    after(async () => {
      scheduled = false;
      try {
        const { dispatchOutbox } = await import("./siteSyncDispatch");
        await dispatchOutbox();
      } catch (err) {
        console.error("site-sync: dispeceratul a eșuat:", err);
      }
    });
  } catch {
    scheduled = false; // în afara unei cereri (script): evenimentele rămân în coadă și pleacă la următorul apel periodic
  }
}

/** Pune în coadă câte un eveniment pentru fiecare entitate schimbată (unind modificările încă netrimise ale aceleiași entități). */
export async function enqueueEvents(db: PrismaClient, entities: SyncEntity[]): Promise<number> {
  if (entities.length === 0) return 0;
  await ensureOutboxIndexes(db);
  const seen = new Set<string>();
  let created = 0;
  for (const entity of entities) {
    const type = typeOf(entity);
    const entityKey = keyOf(entity);
    if (seen.has(`${type}|${entityKey}`)) continue;
    seen.add(`${type}|${entityKey}`);

    // Există deja un eveniment de același fel, netrimis și neînghețat? Va citi starea cea mai nouă la trimitere — nu mai adăugăm altul.
    const waiting = await db.siteSyncOutbox.findFirst({
      where: { entityKey, type, status: "pending", OR: [{ body: { isSet: false } }, { body: null }] },
      select: { id: true },
    });
    if (waiting) continue;

    const counter = await db.counter.upsert({
      where: { name: SEQUENCE_COUNTER },
      update: { value: { increment: 1 } },
      create: { name: SEQUENCE_COUNTER, value: 1 },
    });
    await db.siteSyncOutbox.create({
      data: { eventId: randomUUID(), sequence: counter.value, type, entityKey, entityId: entity.id ?? null },
    });
    created++;
  }
  if (created > 0) scheduleDispatch();
  return created;
}

// ── Extensia Prisma: orice scriere pe Product / Category / ContactMessage (comenzi din coș) înregistrează un eveniment ──
const WRITES = new Set(["create", "createMany", "createManyAndReturn", "update", "updateMany", "upsert", "delete", "deleteMany"]);
type Model = "product" | "category" | "contactMessage";

/* eslint-disable @typescript-eslint/no-explicit-any */
async function handleWrite(db: PrismaClient, model: Model, ctx: { operation: string; args: any; query: (args: any) => Promise<any> }) {
  const { operation, args, query } = ctx;
  if (!WRITES.has(operation) || !syncEnabled()) return query(args);

  const many = operation === "updateMany" || operation === "deleteMany";
  let before: { id: string; source?: string | null }[] = [];
  if (many) {
    try {
      before = await (db as any)[model].findMany({ where: args?.where, select: model === "contactMessage" ? { id: true, source: true } : { id: true } });
    } catch (err) {
      console.error("site-sync: nu s-au putut afla entitățile afectate:", err);
    }
  }

  const result = await query(args);

  try {
    const entities: SyncEntity[] = [];
    const deleted = operation === "delete" || operation === "deleteMany";
    if (model === "category") {
      entities.push({ kind: "categories" });
    } else {
      let rows: { id: string; source?: string | null }[] = [];
      if (many) rows = before;
      else if (operation === "createMany" && model === "product") {
        const slugs = (Array.isArray(args?.data) ? args.data : [args?.data]).map((d: any) => d?.slug).filter(Boolean);
        rows = slugs.length ? await db.product.findMany({ where: { slug: { in: slugs } }, select: { id: true } }) : [];
      } else if (Array.isArray(result)) rows = result; // createManyAndReturn
      else if (result && typeof result === "object" && "id" in result) rows = [result];

      for (const r of rows) {
        if (model === "product") entities.push({ kind: "product", id: r.id, deleted });
        else if (!deleted && r.source === CART_ORDER_SOURCE) entities.push({ kind: "order", id: r.id });
      }
    }
    await enqueueEvents(db, entities);
  } catch (err) {
    // O eroare aici NU are voie să strice scrierea deja făcută; reconcilierea completă (/api/catalog/sync/resync) acoperă ce s-ar fi pierdut.
    console.error("site-sync: înregistrarea evenimentului a eșuat:", err);
  }
  return result;
}

export function withSiteSync(base: PrismaClient) {
  return base.$extends({
    name: "site-sync",
    query: {
      product: { $allOperations: (ctx: any) => handleWrite(base, "product", ctx) },
      category: { $allOperations: (ctx: any) => handleWrite(base, "category", ctx) },
      contactMessage: { $allOperations: (ctx: any) => handleWrite(base, "contactMessage", ctx) },
    },
  });
}
/* eslint-enable @typescript-eslint/no-explicit-any */
