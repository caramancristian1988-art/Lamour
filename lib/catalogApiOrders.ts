// COMENZILE în API-ul de catalog: listare, citire, creare, modificare (etapă, status, date de client și de livrare, număr, arhivare).
// O comandă e un rând ContactMessage cu sursa „Comandă din coș" (aceeași sursă ca registrul și adminul) — deci orice se face aici
// se vede în Admin → Comenzi / Cereri și comenzi și în Telegram, cu aceleași efecte ca atunci când o face un operator
// (mesajul din Telegram se editează, AWB-ul EVS se creează la confirmare, vânzările produselor cresc la „gata de ridicare").
import type { Prisma } from "@prisma/client";
import { prisma } from "./prisma";
import { CART_ORDER_SOURCE, ORDER_STAGES, orderStageLabel, type OrderStage } from "./orderStages";
import { MESSAGE_STATUSES } from "./messageStatuses";
import { EXTRACTION, EXTRACTION_LABELS, PAYMENT_METHOD, setOrderArchived, toRegistryOrders, type Actor, type RegistryOrder } from "./orderRegistry";
import { createCartOrderFromParsedItems } from "./orderFileImport";
import { advanceOrderStageReport, applySalesCountForStatusChange, maybeCreateEvsShipment } from "./adminMessageActions";
import { syncOrderTelegramMessage } from "./orderTelegramSync";
import { parseCartOrderMessage } from "./orderMessage";
import { TOO_MANY_REQUESTS } from "./rateLimit";
import { bad, findProductByRef, good, parsePositiveInt, type ApiResult } from "./catalogApi";

type Row = Prisma.ContactMessageGetPayload<object>;

// În Prisma + MongoDB un câmp LIPSĂ nu se potrivește cu `null` / `not` — de aceea `isSet: false` explicit (ca în lib/orderRegistry.ts).
const NOT_EXTRACTED: Prisma.ContactMessageWhereInput = {
  OR: [{ extractionStatus: { isSet: false } }, { extractionStatus: null }, { extractionStatus: EXTRACTION.NEW }],
};
const NOT_ARCHIVED: Prisma.ContactMessageWhereInput = { OR: [{ archivedAt: { isSet: false } }, { archivedAt: null }] };
const NO_STAGE_OR_NEW: Prisma.ContactMessageWhereInput = { OR: [{ orderStage: { isSet: false } }, { orderStage: null }, { orderStage: "noua" }] };

// ── Ieșire ──
export function orderOut(row: Row, reg: RegistryOrder) {
  const parsed = parseCartOrderMessage(row.message ?? "");
  const stage = reg.orderStage;
  return {
    id: row.id,
    orderNumber: row.orderNumber,
    ref: reg.ref,
    createdAt: row.createdAt,
    stage,
    stageLabel: orderStageLabel(stage),
    status: row.status,
    statusLabel: MESSAGE_STATUSES.find((s) => s.value === row.status)?.label ?? row.status,
    read: row.read,
    archived: Boolean(row.archivedAt),
    archivedAt: row.archivedAt ?? null,
    customer: { name: row.name, phone: row.phone, email: row.email },
    delivery: {
      locality: row.deliveryLocality,
      address: row.deliveryAddress,
      zip: row.deliveryZip,
      weightKg: row.deliveryWeightKg,
      codAmount: row.deliveryCodAmount,
      ownDelivery: row.ownDelivery === true,
      awbCode: row.awbCode,
      awbStatus: row.awbStatus,
      awbCreatedAt: row.awbCreatedAt,
    },
    invoice: { requested: Boolean(row.message && row.message.includes("🧾 CERE FACTURĂ")), sentAt: row.invoiceSentAt },
    items: reg.items,
    itemCount: reg.itemCount,
    total: reg.total,
    paymentMethod: PAYMENT_METHOD,
    note: parsed?.clientNote || null,
    extraction: {
      status: reg.extractionStatus,
      label: EXTRACTION_LABELS[reg.extractionStatus],
      exportId: reg.exportId,
      extractedAt: reg.extractedAt,
      extractedBy: reg.extractedBy,
    },
    message: row.message,
  };
}

async function toOut(rows: Row[]) {
  const regs = await toRegistryOrders(rows);
  return rows.map((r, i) => orderOut(r, regs[i]));
}

async function loadOut(id: string) {
  const row = await prisma.contactMessage.findUnique({ where: { id } });
  return row ? (await toOut([row]))[0] : null;
}

// ── Căutare ──
/** Comanda după număr („1052", „#1052") sau id intern. Același număr pe două comenzi (se poate seta manual) → 409 cu id-urile. */
async function findOrderRow(rawRef: string): Promise<ApiResult<Row>> {
  const ref = decodeURIComponent(rawRef).trim().replace(/^#/, "");
  if (!ref) return bad(404, "Comanda nu a fost găsită.");
  const or: Prisma.ContactMessageWhereInput[] = [{ orderNumber: ref }];
  const isId = /^[0-9a-fA-F]{24}$/.test(ref);
  if (isId) or.push({ id: ref });
  const rows = await prisma.contactMessage.findMany({ where: { AND: [{ source: CART_ORDER_SOURCE }, { OR: or }] }, orderBy: { createdAt: "desc" }, take: 5 });
  if (rows.length === 0) return bad(404, `Comanda „${rawRef}” nu a fost găsită (se caută după număr sau id).`);
  const byId = isId ? rows.find((r) => r.id === ref) : undefined;
  if (byId) return good(byId);
  if (rows.length > 1) {
    return bad(409, `Mai multe comenzi au numărul „${ref}”. Folosește id-ul intern.`, rows.map((r) => `${r.id} (${r.name}, ${r.createdAt.toISOString()})`));
  }
  return good(rows[0]);
}

export interface OrderListParams {
  etapa?: string | null;
  status?: string | null;
  extragere?: string | null;
  arhivate?: string | null; // da | nu | (gol = toate)
  q?: string | null;
  de?: string | null;
  pana?: string | null;
  sortare?: string | null; // nou | vechi
  pagina?: string | null;
  perPagina?: string | null;
}

function parseDate(raw: string, endOfDay: boolean): Date | null {
  const dateOnly = /^\d{4}-\d{2}-\d{2}$/.test(raw);
  const d = new Date(dateOnly ? `${raw}T${endOfDay ? "23:59:59.999" : "00:00:00.000"}Z` : raw);
  return Number.isNaN(d.getTime()) ? null : d;
}

export async function listOrders(p: OrderListParams): Promise<ApiResult<{ total: number; pagina: number; perPagina: number; pagini: number; comenzi: ReturnType<typeof orderOut>[] }>> {
  const and: Prisma.ContactMessageWhereInput[] = [{ source: CART_ORDER_SOURCE }];

  if (p.etapa) {
    if (!ORDER_STAGES.some((s) => s.value === p.etapa)) return bad(422, `„etapa” trebuie să fie una dintre: ${ORDER_STAGES.map((s) => s.value).join(", ")}.`);
    and.push(p.etapa === "noua" ? NO_STAGE_OR_NEW : { orderStage: p.etapa });
  }
  if (p.status) {
    if (!MESSAGE_STATUSES.some((s) => s.value === p.status)) return bad(422, `„status” trebuie să fie unul dintre: ${MESSAGE_STATUSES.map((s) => s.value).join(", ")}.`);
    and.push({ status: p.status });
  }
  if (p.extragere) {
    if (p.extragere === EXTRACTION.NEW) and.push(NOT_EXTRACTED);
    else if (p.extragere === EXTRACTION.RESERVED || p.extragere === EXTRACTION.DONE) and.push({ extractionStatus: p.extragere });
    else return bad(422, "„extragere” trebuie să fie neextrasa, rezervata sau extrasa.");
  }
  if (p.arhivate === "nu") and.push(NOT_ARCHIVED);
  else if (p.arhivate === "da") and.push({ archivedAt: { not: null } });
  const q = p.q?.trim().replace(/^#/, "");
  if (q) and.push({ OR: [{ orderNumber: q }, { name: { contains: q, mode: "insensitive" } }, { phone: { contains: q } }, { email: { contains: q, mode: "insensitive" } }] });
  if (p.de || p.pana) {
    const range: { gte?: Date; lte?: Date } = {};
    if (p.de) {
      const d = parseDate(p.de, false);
      if (!d) return bad(422, "„de” trebuie să fie o dată (AAAA-LL-ZZ sau ISO).");
      range.gte = d;
    }
    if (p.pana) {
      const d = parseDate(p.pana, true);
      if (!d) return bad(422, "„pana” trebuie să fie o dată (AAAA-LL-ZZ sau ISO).");
      range.lte = d;
    }
    and.push({ createdAt: range });
  }

  const where: Prisma.ContactMessageWhereInput = { AND: and };
  const all = p.perPagina === "toate";
  const perPagina = all ? 5000 : parsePositiveInt(p.perPagina ?? null, 50, 200);
  const pagina = all ? 1 : parsePositiveInt(p.pagina ?? null, 1, 100000);
  const [total, rows] = await Promise.all([
    prisma.contactMessage.count({ where }),
    prisma.contactMessage.findMany({ where, orderBy: { createdAt: p.sortare === "vechi" ? "asc" : "desc" }, skip: (pagina - 1) * perPagina, take: perPagina }),
  ]);
  return good({ total, pagina, perPagina, pagini: Math.max(1, Math.ceil(total / perPagina)), comenzi: await toOut(rows) });
}

export async function getOrder(ref: string): Promise<ApiResult<ReturnType<typeof orderOut>>> {
  const row = await findOrderRow(ref);
  if (!row.ok) return row;
  const out = await loadOut(row.data.id);
  return out ? good(out) : bad(404, "Comanda nu a fost găsită.");
}

// ── Creare ──
const CREATE_KEYS = new Set(["customer", "name", "phone", "email", "items", "delivery", "note", "paymentByTransfer", "invoice", "confirm"]);

function text(v: unknown): string | undefined {
  return typeof v === "string" && v.trim() ? v.trim() : undefined;
}

/**
 * Creează o comandă ca la „Comandă din coș": prețurile se iau din catalog (cu pragurile de cantitate), comanda apare în Telegram și în admin.
 *   { customer: { name, phone, email? }, items: [{ product: "slug|id|cod", quantity }], delivery?: { locality, address, zip, ownDelivery },
 *     note?, paymentByTransfer?, invoice?: { companyName, idno, address?, vat? }, confirm?: bool (true = o confirmă direct, ca „Confirmă" din Telegram) }
 * Limită: formularul public al site-ului primește cel mult 15 comenzi / 10 minute de la aceeași adresă IP, iar API-ul folosește aceeași limită.
 */
export async function createOrder(body: Record<string, unknown>): Promise<ApiResult<ReturnType<typeof orderOut> & { evs?: { ok: boolean; description: string } | null }>> {
  const unknown = Object.keys(body).filter((k) => !CREATE_KEYS.has(k));
  if (unknown.length > 0) return bad(422, "Date invalide.", unknown.map((k) => `Câmp necunoscut: „${k}”.`));

  const c = (typeof body.customer === "object" && body.customer ? body.customer : body) as Record<string, unknown>;
  const name = text(c.name);
  const phone = text(c.phone);
  const errors: string[] = [];
  if (!name) errors.push("„customer.name” este obligatoriu.");
  if (!phone) errors.push("„customer.phone” este obligatoriu.");

  const rawItems = body.items;
  const merged = new Map<string, number>();
  if (!Array.isArray(rawItems) || rawItems.length === 0) errors.push("„items” trebuie să fie o listă nevidă de { product, quantity }.");
  else {
    for (let i = 0; i < rawItems.length; i++) {
      const it = (rawItems[i] ?? {}) as Record<string, unknown>;
      const ref = text(it.product ?? it.ref ?? it.productId ?? it.slug ?? it.code);
      const quantity = Number(it.quantity);
      if (!ref) { errors.push(`items[${i}]: „product” (slug, id sau cod) lipsește.`); continue; }
      if (!Number.isInteger(quantity) || quantity < 1) { errors.push(`items[${i}]: „quantity” trebuie să fie un întreg ≥ 1.`); continue; }
      const product = await findProductByRef(ref);
      if (!product) { errors.push(`items[${i}]: produsul „${ref}” nu există.`); continue; }
      merged.set(product.id, (merged.get(product.id) ?? 0) + quantity);
    }
  }

  const d = (typeof body.delivery === "object" && body.delivery ? body.delivery : {}) as Record<string, unknown>;
  const inv = typeof body.invoice === "object" && body.invoice ? (body.invoice as Record<string, unknown>) : null;
  if (inv && (!text(inv.companyName) || !text(inv.idno))) errors.push("„invoice” cere „companyName” și „idno”.");
  if (errors.length > 0) return bad(422, "Date invalide.", errors);

  const result = await createCartOrderFromParsedItems({
    name: name as string,
    phone: phone as string,
    email: text(c.email) ?? null,
    deliveryLocality: text(d.locality) ?? null,
    deliveryAddress: text(d.address) ?? null,
    deliveryZip: text(d.zip) ?? null,
    note: text(body.note) ?? null,
    items: [...merged.entries()].map(([productId, quantity]) => ({ productId, quantity })),
    needsInvoice: Boolean(inv),
    companyName: inv ? text(inv.companyName) : null,
    companyIdno: inv ? text(inv.idno) : null,
    companyAddress: inv ? text(inv.address) : null,
    companyVat: inv ? text(inv.vat) : null,
    autoConfirm: body.confirm === true,
    ownDelivery: d.ownDelivery === true,
    paymentByTransfer: body.paymentByTransfer === true,
  });
  if (!result.ok || !result.id) return bad(result.error === TOO_MANY_REQUESTS ? 429 : 422, result.error ?? "Comanda nu a putut fi creată.");

  const out = await loadOut(result.id);
  return out ? good({ ...out, evs: result.evs ?? null }) : bad(500, "Comanda a fost creată, dar nu a putut fi citită.");
}

// ── Modificare ──
const EDIT_KEYS = new Set(["stage", "status", "orderNumber", "read", "archived", "customer", "delivery"]);
// Câmpuri care apar în citire (GET) și sunt ignorate la scriere, ca un obiect citit să poată fi trimis înapoi.
const READONLY_KEYS = new Set([
  "id", "ref", "createdAt", "stageLabel", "statusLabel", "archivedAt", "invoice", "items", "itemCount", "total", "paymentMethod", "note", "extraction", "message", "evs",
]);
const DELIVERY_EDIT = new Set(["locality", "address", "zip", "weightKg", "codAmount", "ownDelivery"]);
const DELIVERY_READONLY = new Set(["awbCode", "awbStatus", "awbCreatedAt"]);

/** Rândul „Livrare: …" din textul comenzii (cel afișat în Telegram și pe fișa tipărită) urmează adresa nouă. */
function rewriteDeliveryLine(message: string | null, ownDelivery: boolean, address: string): string | null {
  if (!message || !/^Livrare: .*$/m.test(message)) return message;
  const line = ownDelivery ? `Livrare: livrăm noi (fără curier EVS)${address ? ` — ${address}` : ""}` : address ? `Livrare: ${address}` : null;
  return line ? message.replace(/^Livrare: .*$/m, () => line) : message;
}

export async function updateOrder(ref: string, body: Record<string, unknown>, actor: Actor): Promise<ApiResult<ReturnType<typeof orderOut> & { evs?: { ok: boolean; description: string } | null }>> {
  const found = await findOrderRow(ref);
  if (!found.ok) return found;
  const row = found.data;

  const errors: string[] = [];
  for (const k of Object.keys(body)) if (!EDIT_KEYS.has(k) && !READONLY_KEYS.has(k)) errors.push(`Câmp necunoscut: „${k}”.`);

  const stage = body.stage;
  if (stage !== undefined && !(typeof stage === "string" && ORDER_STAGES.some((s) => s.value === stage))) {
    errors.push(`„stage” trebuie să fie una dintre: ${ORDER_STAGES.map((s) => s.value).join(", ")}.`);
  }
  const status = body.status;
  if (status !== undefined && !(typeof status === "string" && MESSAGE_STATUSES.some((s) => s.value === status))) {
    errors.push(`„status” trebuie să fie unul dintre: ${MESSAGE_STATUSES.map((s) => s.value).join(", ")}.`);
  }
  if (body.read !== undefined && typeof body.read !== "boolean") errors.push("„read” trebuie să fie true sau false.");
  if (body.archived !== undefined && typeof body.archived !== "boolean") errors.push("„archived” trebuie să fie true sau false.");
  if (body.orderNumber !== undefined && body.orderNumber !== null && typeof body.orderNumber !== "string" && typeof body.orderNumber !== "number") {
    errors.push("„orderNumber” trebuie să fie text, număr sau null.");
  }

  const data: Prisma.ContactMessageUpdateInput = {};
  let touchedTelegram = false;

  if (body.customer !== undefined) {
    const c = body.customer;
    if (!c || typeof c !== "object" || Array.isArray(c)) errors.push("„customer” trebuie să fie un obiect { name, phone, email }.");
    else {
      const o = c as Record<string, unknown>;
      for (const k of Object.keys(o)) if (!["name", "phone", "email"].includes(k)) errors.push(`customer: câmp necunoscut „${k}”.`);
      if (o.name !== undefined) {
        const v = text(o.name);
        if (v) { data.name = v; touchedTelegram = true; } else errors.push("„customer.name” nu poate fi gol.");
      }
      if (o.phone !== undefined) {
        const v = text(o.phone);
        if (v) { data.phone = v; touchedTelegram = true; } else errors.push("„customer.phone” nu poate fi gol.");
      }
      if (o.email !== undefined) { data.email = o.email === null ? null : text(o.email) ?? null; touchedTelegram = true; }
    }
  }

  let deliveryChanged = false;
  let newOwn = row.ownDelivery === true;
  const nextDelivery = { locality: row.deliveryLocality, address: row.deliveryAddress, zip: row.deliveryZip };
  if (body.delivery !== undefined) {
    const dv = body.delivery;
    if (!dv || typeof dv !== "object" || Array.isArray(dv)) errors.push("„delivery” trebuie să fie un obiect.");
    else {
      const o = dv as Record<string, unknown>;
      for (const k of Object.keys(o)) if (!DELIVERY_EDIT.has(k) && !DELIVERY_READONLY.has(k)) errors.push(`delivery: câmp necunoscut „${k}”.`);
      const strField = (key: "locality" | "address" | "zip", col: "deliveryLocality" | "deliveryAddress" | "deliveryZip") => {
        if (o[key] === undefined) return;
        const v = o[key] === null ? null : text(o[key]) ?? null;
        data[col] = v;
        nextDelivery[key] = v;
        deliveryChanged = true;
      };
      strField("locality", "deliveryLocality");
      strField("address", "deliveryAddress");
      strField("zip", "deliveryZip");
      if (o.weightKg !== undefined) {
        const n = o.weightKg === null ? null : Number(o.weightKg);
        if (n !== null && !(Number.isFinite(n) && n > 0)) errors.push("„delivery.weightKg” trebuie să fie > 0 (sau null).");
        else data.deliveryWeightKg = n;
      }
      if (o.codAmount !== undefined) {
        const n = o.codAmount === null ? null : Number(o.codAmount);
        if (n !== null && !(Number.isFinite(n) && n >= 0)) errors.push("„delivery.codAmount” trebuie să fie ≥ 0 (sau null).");
        else data.deliveryCodAmount = n;
      }
      if (o.ownDelivery !== undefined) {
        if (typeof o.ownDelivery !== "boolean") errors.push("„delivery.ownDelivery” trebuie să fie true sau false.");
        else { data.ownDelivery = o.ownDelivery; newOwn = o.ownDelivery; deliveryChanged = true; }
      }
      if (deliveryChanged) touchedTelegram = true;
    }
  }
  if (errors.length > 0) return bad(422, "Date invalide.", errors);

  if (body.orderNumber !== undefined) {
    data.orderNumber = body.orderNumber === null || String(body.orderNumber).trim() === "" ? null : String(body.orderNumber).trim();
    touchedTelegram = true;
  }
  if (body.read !== undefined) data.read = body.read as boolean;
  if (deliveryChanged) {
    const address = [nextDelivery.locality, nextDelivery.address, nextDelivery.zip].filter(Boolean).join(", ");
    const message = rewriteDeliveryLine(row.message, newOwn, address);
    if (message !== row.message) data.message = message;
  }

  const hasStage = typeof stage === "string";
  const hasStatus = typeof status === "string";
  const hasArchive = typeof body.archived === "boolean";
  if (Object.keys(data).length === 0 && !hasStage && !hasStatus && !hasArchive) return bad(400, "Nu s-a trimis niciun câmp de modificat.");

  // 1) date (înainte de etapă: la confirmare, AWB-ul se creează din adresa și greutatea de acum)
  if (Object.keys(data).length > 0) {
    const updated = await prisma.contactMessage.update({ where: { id: row.id }, data });
    if (touchedTelegram) await syncOrderTelegramMessage(updated);
  }

  // 2) etapa operațională (confirmată → pregătire + AWB; gata de ridicare → curier; anulată) — aceleași efecte ca în Telegram / admin
  let evs: { ok: boolean; description: string } | null = null;
  if (hasStage) {
    const result = await advanceOrderStageReport(row.id, stage as OrderStage);
    evs = result.evs ?? null;
    if (result.failure) {
      return bad(409, result.failure, Object.keys(data).length > 0 ? ["Celelalte modificări trimise au fost salvate."] : undefined);
    }
  }

  // 3) statusul comenzii (în așteptare … achitat / anulat) — ca în admin: „achitat" crește vânzările produselor și încearcă AWB
  if (hasStatus && status !== row.status) {
    const updated = await prisma.contactMessage.update({ where: { id: row.id }, data: { status: status as string, read: true } });
    await applySalesCountForStatusChange(row.status, status as string, row.productIds);
    if (status === "achitat") {
      const shipment = await maybeCreateEvsShipment(updated);
      if (shipment) evs = shipment;
    }
  }

  // 4) arhivare / dezarhivare (comenzile nu se șterg niciodată: fac parte din registrul permanent)
  if (hasArchive && Boolean(row.archivedAt) !== body.archived) await setOrderArchived(row.id, body.archived as boolean, actor);

  const out = await loadOut(row.id);
  return out ? good({ ...out, evs }) : bad(500, "Comanda a fost modificată, dar nu a putut fi citită.");
}

/** DELETE pe o comandă = arhivare (ca în admin): dispare din lista implicită, dar rămâne în registru și în exporturi. */
export async function archiveOrder(ref: string, actor: Actor): Promise<ApiResult<ReturnType<typeof orderOut>>> {
  const found = await findOrderRow(ref);
  if (!found.ok) return found;
  if (!found.data.archivedAt) await setOrderArchived(found.data.id, true, actor);
  const out = await loadOut(found.data.id);
  return out ? good(out) : bad(404, "Comanda nu a fost găsită.");
}
