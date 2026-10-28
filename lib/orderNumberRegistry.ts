// Registrul COMUN al numerelor de comandă: site-ul și CRM-ul nu mai pot da același număr la două comenzi.
//
// Regula: UN singur allocator atomic (Counter „order" + incrementare atomică) și UN singur index unic pe `number` (OrderNumberRegistry).
//  - checkout-ul site-ului (nextOrderNumber) alocă prin acest registru;
//  - CRM-ul rezervă prin /api/catalog/numere-comenzi/rezerva (idempotent după (source, requestId));
//  - numerele istorice ale CRM-ului se înregistrează ca ocupate prin /api/catalog/numere-comenzi/inregistreaza-istoric,
//    iar cele ale site-ului (comenzile deja existente) se înregistrează o singură dată, automat, înainte de prima operație a CRM-ului.
// Numerele nu expiră și nu se reciclează: o comandă abandonată lasă un gol. Unicitatea e obligatorie; lipsa golurilor nu.
import { randomUUID } from "node:crypto";
import { prisma } from "./prisma";

export const REGISTRY_NAMESPACE = "shared-v1";
const COUNTER_NAME = "order";
const BACKFILL_FLAG = "orderRegistryBackfill";
const MAX_COUNTER = 2_000_000_000; // Counter.value e întreg pe 32 de biți

type Row = Awaited<ReturnType<typeof prisma.orderNumberRegistry.findUniqueOrThrow>>;

function isUniqueViolation(err: unknown): boolean {
  return (err as { code?: string } | null)?.code === "P2002";
}

// Indexurile unice se creează o dată pe instanță (idempotent) — numele sunt cele pe care le folosește Prisma, deci un `prisma db push`
// ulterior nu găsește nicio diferență. Fără ele registrul NU ar garanta unicitatea.
let indexesReady: Promise<void> | null = null;
export function ensureRegistryIndexes(): Promise<void> {
  if (!indexesReady) {
    indexesReady = prisma
      .$runCommandRaw({
        createIndexes: "OrderNumberRegistry",
        indexes: [
          { key: { number: 1 }, name: "OrderNumberRegistry_number_key", unique: true },
          { key: { source: 1, requestId: 1 }, name: "OrderNumberRegistry_source_requestId_key", unique: true },
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

/** Ridică contorul comenzilor până la cel puțin `n` (doar în sus, atomic) — ca seria numerică să continue DUPĂ cel mai mare număr istoric. */
async function raiseCounterTo(n: number): Promise<void> {
  if (!Number.isSafeInteger(n) || n < 1 || n > MAX_COUNTER) return;
  await prisma.counter.upsert({ where: { name: COUNTER_NAME }, update: {}, create: { name: COUNTER_NAME, value: 0 } });
  await prisma.counter.updateMany({ where: { name: COUNTER_NAME, value: { lt: n } }, data: { value: n } });
}

function numericValue(number: string): number | null {
  return /^\d{1,10}$/.test(number) ? Number(number) : null;
}

/** Numerele comenzilor existente pe site intră o singură dată în registru (ca ocupate), iar contorul trece peste cel mai mare dintre ele. */
async function ensureSiteHistoryRegistered(): Promise<void> {
  await ensureRegistryIndexes();
  const done = await prisma.counter.findUnique({ where: { name: BACKFILL_FLAG } });
  if (done && done.value >= 1) return;

  const orders = await prisma.contactMessage.findMany({ where: { orderNumber: { not: null } }, select: { id: true, orderNumber: true } });
  let maxNumeric = 0;
  const seen = new Set<string>();
  for (const o of orders) {
    const number = o.orderNumber?.trim();
    if (!number || seen.has(number)) continue;
    seen.add(number);
    const n = numericValue(number);
    if (n !== null && n > maxNumeric) maxNumeric = n;
    try {
      await prisma.orderNumberRegistry.create({ data: { number, source: "site-istoric", requestId: `site-istoric-${number}`, reservationId: randomUUID(), orderId: o.id } });
    } catch (err) {
      if (!isUniqueViolation(err)) throw err; // deja înregistrat (ex. alocat de registru la crearea comenzii) — în regulă
    }
  }
  if (maxNumeric > 0) await raiseCounterTo(maxNumeric);
  await prisma.counter.upsert({ where: { name: BACKFILL_FLAG }, update: { value: 1 }, create: { name: BACKFILL_FLAG, value: 1 } });
}

/**
 * Alocă atomic următorul număr liber: incrementează contorul, apoi încearcă să-l ocupe în registru. Dacă numărul e deja luat
 * (înregistrat ca istoric al CRM-ului, sau rezervat de el) trece la următorul — un număr ocupat nu se dă niciodată a doua oară.
 */
async function allocate(source: string, requestId: () => string, orderId?: string | null): Promise<Row> {
  await ensureRegistryIndexes();
  for (let attempt = 0; attempt < 500; attempt++) {
    const counter = await prisma.counter.upsert({ where: { name: COUNTER_NAME }, update: { value: { increment: 1 } }, create: { name: COUNTER_NAME, value: 1 } });
    const number = String(counter.value);
    try {
      return await prisma.orderNumberRegistry.create({
        data: { number, source, requestId: requestId(), reservationId: randomUUID(), orderId: orderId ?? null },
      });
    } catch (err) {
      if (!isUniqueViolation(err)) throw err;
      // Fie numărul e ocupat (→ următorul), fie e o cerere simultană cu aceeași identitate (apelantul o tratează: întoarce rezervarea câștigătoare).
      if (source === "crm" && (await prisma.orderNumberRegistry.findUnique({ where: { source_requestId: { source, requestId: requestId() } } }))) throw err;
    }
  }
  throw new Error("Nu s-a putut aloca un număr de comandă liber (prea multe numere ocupate la rând).");
}

/** Numărul următoarei comenzi de pe site — ACELAȘI allocator ca rezervările CRM-ului. */
export async function allocateSiteOrderNumber(): Promise<string> {
  return (await allocate("site", () => `site-${randomUUID()}`)).number;
}

/** După crearea comenzii: numărul alocat știe acum de ce comandă ține (pentru diagnostic; nu schimbă nimic altceva). */
export async function attachOrderToNumber(number: string, orderId: string): Promise<void> {
  try {
    await prisma.orderNumberRegistry.updateMany({ where: { number, OR: [{ orderId: { isSet: false } }, { orderId: null }] }, data: { orderId } });
  } catch (err) {
    console.error("registru numere: atașarea comenzii la număr a eșuat:", err);
  }
}

/**
 * Un număr pus de mână pe o comandă (admin / API) se înregistrează ca ocupat, ca CRM-ul să nu-l primească. Best-effort și FĂRĂ refuz:
 * adminul poate seta intenționat același număr pe două comenzi (vezi comentariul de la ContactMessage.orderNumber).
 */
export async function noteManualOrderNumber(number: string | null | undefined, orderId: string): Promise<void> {
  const value = number?.trim();
  if (!value) return;
  try {
    await ensureRegistryIndexes();
    await prisma.orderNumberRegistry.create({ data: { number: value, source: "manual", requestId: `manual-${value}`, reservationId: randomUUID(), orderId } });
  } catch (err) {
    if (!isUniqueViolation(err)) console.error("registru numere: înregistrarea numărului manual a eșuat:", err);
  }
}

export interface Reservation {
  requestId: string;
  number: string;
  reservationId: string;
  replay: boolean;
}

const REQUEST_ID_RE = /^[A-Za-z0-9_-]{1,100}$/;

export function isValidRequestId(value: unknown): value is string {
  return typeof value === "string" && REQUEST_ID_RE.test(value);
}

/**
 * Rezervarea unui număr pentru CRM, idempotentă după (source, requestId): aceeași identitate primește MEREU aceeași rezervare
 * (și cereri simultane la fel), identități diferite primesc numere diferite. Nu creează nicio comandă și nu trimite nicio notificare.
 */
export async function reserveForCrm(requestId: string): Promise<Reservation> {
  await ensureSiteHistoryRegistered();
  const existing = await prisma.orderNumberRegistry.findUnique({ where: { source_requestId: { source: "crm", requestId } } });
  if (existing) return { requestId, number: existing.number, reservationId: existing.reservationId, replay: true };
  try {
    const row = await allocate("crm", () => requestId);
    return { requestId, number: row.number, reservationId: row.reservationId, replay: false };
  } catch (err) {
    if (!isUniqueViolation(err)) throw err;
    // Cerere simultană cu aceeași identitate: a doua primește rezervarea primeia (numărul cheltuit de aceasta rămâne un gol).
    const winner = await prisma.orderNumberRegistry.findUnique({ where: { source_requestId: { source: "crm", requestId } } });
    if (winner) return { requestId, number: winner.number, reservationId: winner.reservationId, replay: true };
    throw err;
  }
}

/** Valideaza un număr trimis de CRM: text de 1–100 de caractere, fără spații la capete, fără caractere de control. */
export function isValidOrderNumber(value: unknown): value is string {
  return typeof value === "string" && value.length >= 1 && value.length <= 100 && value === value.trim() && !/[\u0000-\u001f\u007f]/.test(value);
}

export interface HistoryResult {
  registered: number;
  alreadyRegistered: number;
  /** Numere deja ocupate de ALT sistem (ex. același „1000" există și pe site): rămân ocupate de primul, se raportează pentru reconciliere. */
  ambiguous: { number: string; occupiedBy: string }[];
}

/** Înregistrează numere istorice ale CRM-ului ca ocupate. Idempotent; nu modifică nimic existent și nu creează comenzi. */
export async function registerCrmHistory(numbers: string[]): Promise<HistoryResult> {
  await ensureSiteHistoryRegistered();
  const unique = [...new Set(numbers)];
  const result: HistoryResult = { registered: 0, alreadyRegistered: 0, ambiguous: [] };
  let maxNumeric = 0;

  for (let i = 0; i < unique.length; i += 25) {
    await Promise.all(
      unique.slice(i, i + 25).map(async (number) => {
        const n = numericValue(number);
        if (n !== null && n > maxNumeric) maxNumeric = n;
        try {
          await prisma.orderNumberRegistry.create({ data: { number, source: "crm-istoric", requestId: `crm-istoric-${number}`, reservationId: randomUUID() } });
          result.registered++;
        } catch (err) {
          if (!isUniqueViolation(err)) throw err;
          const existing = await prisma.orderNumberRegistry.findUnique({ where: { number } });
          if (existing && existing.source === "crm-istoric") result.alreadyRegistered++;
          else result.ambiguous.push({ number, occupiedBy: existing?.source ?? "necunoscut" });
        }
      })
    );
  }
  // seria numerică continuă după cel mai mare număr din ambele istorice (al site-ului a fost ridicat la backfill)
  if (maxNumeric > 0) await raiseCounterTo(maxNumeric);
  return result;
}
