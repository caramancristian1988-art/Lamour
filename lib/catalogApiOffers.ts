// OFERTELE din catalog. Pe site există două feluri, ambele stau pe produs:
//  - REDUCERE: `oldPrice` (prețul vechi, tăiat) mai mare decât `price` → apare insigna „−X%” și suma economisită;
//  - OFERTĂ LA CANTITATE: `priceTiers` ([{ minQty, price }]) → „de la 10 buc.: 11,5 MDL/buc”, aplicat automat în coș.
// API-ul de oferte le schimbă fără să trimiți tot produsul: setezi / ștergi reducerea și pragurile, individual sau în masă.
import type { Prisma } from "@prisma/client";
import { prisma } from "./prisma";
import { normalizeTiers, parseDecimalInput, type PriceTier } from "./pricing";
import {
  addProductFamily,
  bad,
  categoryWithChildrenIds,
  findCategoryByRef,
  findProductByRef,
  good,
  round2,
  type ApiResult,
  type Refresh,
} from "./catalogApi";

type OfferProduct = Prisma.ProductGetPayload<{ include: { category: { select: { id: true; name: true; slug: true } } } }>;

export function offerOut(p: OfferProduct) {
  const hasDiscount = p.oldPrice !== null && p.oldPrice > p.price;
  return {
    id: p.id,
    code: p.code,
    slug: p.slug,
    name: p.name,
    url: `/produse/${p.slug}`,
    category: p.category,
    hidden: p.hidden === true,
    price: p.price,
    oldPrice: hasDiscount ? p.oldPrice : null,
    discountPercent: hasDiscount ? Math.round((1 - p.price / (p.oldPrice as number)) * 100) : 0,
    discountAmount: hasDiscount ? round2((p.oldPrice as number) - p.price) : 0,
    quantityOffers: normalizeTiers(p),
    hasDiscount,
    hasQuantityOffer: normalizeTiers(p).length > 0,
  };
}

const include = { category: { select: { id: true, name: true, slug: true } } } as const;

/** tip: reducere | cantitate | toate (implicit toate = produse cu cel puțin o ofertă). */
export async function listOffers(opts: { tip?: string | null; categorie?: string | null }): Promise<ApiResult<unknown>> {
  const where: Prisma.ProductWhereInput = {};
  if (opts.categorie) {
    const cat = await findCategoryByRef(opts.categorie);
    if (!cat) return bad(404, `Categoria „${opts.categorie}” nu există.`);
    where.categoryId = { in: await categoryWithChildrenIds(cat.id) };
  }
  const rows = await prisma.product.findMany({ where, include, orderBy: { createdAt: "desc" } });
  const tip = opts.tip === "reducere" || opts.tip === "cantitate" ? opts.tip : "toate";
  const offers = rows
    .map(offerOut)
    .filter((o) => (tip === "reducere" ? o.hasDiscount : tip === "cantitate" ? o.hasQuantityOffer : o.hasDiscount || o.hasQuantityOffer));
  return good({
    total: offers.length,
    laReducere: offers.filter((o) => o.hasDiscount).length,
    laCantitate: offers.filter((o) => o.hasQuantityOffer).length,
    oferte: offers,
  });
}

export async function getOffer(ref: string): Promise<ApiResult<ReturnType<typeof offerOut>>> {
  const p = await findProductByRef(ref);
  if (!p) return bad(404, `Produsul „${ref}” nu a fost găsit (se caută după id, slug sau cod).`);
  const full = await prisma.product.findUnique({ where: { id: p.id }, include });
  return full ? good(offerOut(full)) : bad(404, `Produsul „${ref}” nu a fost găsit.`);
}

/** Prețul „de bază” al reducerii: prețul vechi dacă există (ca aplicarea repetată să nu schimbe nimic), altfel prețul curent. */
function discountBase(p: { price: number; oldPrice: number | null }): number {
  return p.oldPrice !== null && p.oldPrice > p.price ? p.oldPrice : p.price;
}

/**
 * Specificația unei oferte:
 *  reducere: { procent }                      → prețul scade cu X% față de baza (prețul vechi sau cel curent), iar baza devine „preț vechi”
 *            { pretNou }                      → prețul devine pretNou; baza devine „preț vechi”
 *            { pretVechi, pretNou? }          → setează direct prețul vechi (și, opțional, noul preț)
 *            null                             → șterge reducerea (cu `restabilestePretul: true`, prețul revine la cel vechi)
 *  cantitate: [{ minQty, price }, …]          → înlocuiește pragurile; [] sau null → le șterge
 */
export interface OfferSpec {
  reducere?: unknown;
  cantitate?: unknown;
  restabilestePretul?: boolean;
}

export async function applyOffer(ref: string | OfferProduct, spec: OfferSpec, refresh: Refresh): Promise<ApiResult<ReturnType<typeof offerOut>>> {
  const base = typeof ref === "string" ? await findProductByRef(ref) : ref;
  if (!base) return bad(404, `Produsul „${String(ref)}” nu a fost găsit (se caută după id, slug sau cod).`);
  if (spec.reducere === undefined && spec.cantitate === undefined) {
    return bad(400, "Trimite „reducere” și / sau „cantitate” (null = șterge oferta).");
  }

  const data: Prisma.ProductUncheckedUpdateInput = {};
  let price = base.price;

  if (spec.reducere !== undefined) {
    const r = spec.reducere;
    if (r === null) {
      data.oldPrice = null;
      if (spec.restabilestePretul && base.oldPrice !== null && base.oldPrice > base.price) {
        data.price = base.oldPrice;
        price = base.oldPrice;
      }
    } else if (typeof r === "object" && !Array.isArray(r)) {
      const o = r as Record<string, unknown>;
      const keys = Object.keys(o);
      const unknown = keys.filter((k) => !["procent", "pretNou", "pretVechi"].includes(k));
      if (unknown.length > 0) return bad(422, `„reducere”: câmpuri necunoscute (${unknown.join(", ")}). Folosește procent, pretNou sau pretVechi.`);
      if (keys.length === 0) return bad(422, "„reducere” trebuie să conțină procent, pretNou sau pretVechi.");

      if (o.procent !== undefined) {
        if (o.pretNou !== undefined || o.pretVechi !== undefined) return bad(422, "„procent” nu se combină cu pretNou / pretVechi.");
        const pct = parseDecimalInput(o.procent);
        if (!Number.isFinite(pct) || pct <= 0 || pct > 95) return bad(422, "„procent” trebuie să fie un număr între 0 și 95.");
        const from = discountBase(base);
        price = round2(from * (1 - pct / 100));
        if (price <= 0) return bad(422, "Prețul rezultat ar fi 0.");
        data.price = price;
        data.oldPrice = from;
      } else {
        const newPrice = o.pretNou !== undefined ? parseDecimalInput(o.pretNou) : undefined;
        const oldPrice = o.pretVechi !== undefined ? parseDecimalInput(o.pretVechi) : undefined;
        if (newPrice !== undefined && (!Number.isFinite(newPrice) || newPrice <= 0)) return bad(422, "„pretNou” trebuie să fie un număr > 0.");
        if (oldPrice !== undefined && (!Number.isFinite(oldPrice) || oldPrice <= 0)) return bad(422, "„pretVechi” trebuie să fie un număr > 0.");
        const finalPrice = newPrice ?? base.price;
        const finalOld = oldPrice ?? discountBase(base);
        if (finalOld <= finalPrice) return bad(422, `Prețul vechi (${finalOld}) trebuie să fie mai mare decât cel nou (${finalPrice}).`);
        data.price = finalPrice;
        data.oldPrice = finalOld;
        price = finalPrice;
      }
    } else {
      return bad(422, "„reducere” trebuie să fie un obiect ({ procent } / { pretNou } / { pretVechi, pretNou }) sau null.");
    }
  }

  if (spec.cantitate !== undefined) {
    const c = spec.cantitate;
    if (c === null || (Array.isArray(c) && c.length === 0)) {
      data.priceTiers = { set: [] };
      data.bulkMinQty = null;
      data.bulkPrice = null;
    } else if (Array.isArray(c)) {
      const tiers: PriceTier[] = [];
      const errors: string[] = [];
      c.forEach((t, i) => {
        const o = (t ?? {}) as Record<string, unknown>;
        const minQty = Number(o.minQty);
        const p = parseDecimalInput(o.price);
        if (!Number.isInteger(minQty) || minQty < 2 || !Number.isFinite(p) || p <= 0) errors.push(`cantitate[${i}]: „minQty” întreg ≥ 2 și „price” > 0.`);
        else if (p >= price) errors.push(`cantitate[${i}]: prețul ${p} trebuie să fie mai mic decât prețul de bază (${price}).`);
        else tiers.push({ minQty, price: p });
      });
      if (errors.length > 0) return bad(422, "Praguri de cantitate invalide.", errors);
      data.priceTiers = { set: normalizeTiers({ priceTiers: tiers }) };
      data.bulkMinQty = null; // pragul unic vechi nu se mai folosește când există praguri noi
      data.bulkPrice = null;
    } else {
      return bad(422, "„cantitate” trebuie să fie o listă de { minQty, price } sau null.");
    }
  } else if (data.price !== undefined) {
    // Dacă prețul de bază scade, pragurile existente trebuie să rămână sub el (altfel „oferta la cantitate” ar fi mai scumpă).
    const tiers = normalizeTiers(base);
    if (tiers.some((t) => t.price >= price)) {
      return bad(422, "Noul preț este sub sau egal cu un prag de cantitate existent. Trimite și „cantitate” cu praguri actualizate (sau null).", tiers.map((t) => `de la ${t.minQty} buc.: ${t.price}`));
    }
  }

  await addProductFamily(refresh, base.id);
  refresh.slugs.add(base.slug);
  refresh.categoryIds.add(base.categoryId);
  await prisma.product.update({ where: { id: base.id }, data });
  const full = await prisma.product.findUnique({ where: { id: base.id }, include });
  return full ? good(offerOut(full)) : bad(500, "Oferta a fost salvată, dar produsul nu a putut fi citit.");
}

/** Oferte în masă: aceeași specificație pentru o listă de produse și / sau o categorie întreagă (cu subcategoriile ei). */
export async function applyOffersBulk(
  body: Record<string, unknown>,
  refresh: Refresh
): Promise<ApiResult<{ total: number; reusite: number; esuate: number; rezultate: { ref: string; ok: boolean; error?: string; oferta?: ReturnType<typeof offerOut> }[] }>> {
  const known = ["produse", "categorie", "reducere", "cantitate", "procent", "anuleaza", "tip", "restabilestePretul"];
  const unknown = Object.keys(body).filter((k) => !known.includes(k));
  if (unknown.length > 0) return bad(422, `Câmpuri necunoscute: ${unknown.join(", ")}.`);

  // Prescurtări: { procent: 20 } = reducere de 20%; { anuleaza: true, tip: "reducere"|"cantitate"|"toate" } = șterge oferta.
  const spec: OfferSpec = { restabilestePretul: body.restabilestePretul === true };
  if (body.anuleaza === true) {
    const tip = body.tip === "reducere" || body.tip === "cantitate" ? body.tip : "toate";
    if (tip !== "cantitate") spec.reducere = null;
    if (tip !== "reducere") spec.cantitate = null;
  } else {
    if (body.procent !== undefined) spec.reducere = { procent: body.procent };
    else if (body.reducere !== undefined) spec.reducere = body.reducere;
    if (body.cantitate !== undefined) spec.cantitate = body.cantitate;
  }
  if (spec.reducere === undefined && spec.cantitate === undefined) {
    return bad(422, "Trimite „procent”, „reducere”, „cantitate” sau „anuleaza”: true.");
  }

  const targets = new Map<string, OfferProduct>();
  if (body.produse !== undefined) {
    if (!Array.isArray(body.produse) || !body.produse.every((x) => typeof x === "string")) return bad(422, "„produse” trebuie să fie o listă de id / slug / cod.");
    for (const ref of body.produse as string[]) {
      const p = await findProductByRef(ref);
      if (p) {
        const full = await prisma.product.findUnique({ where: { id: p.id }, include });
        if (full) targets.set(full.id, full);
      }
    }
  }
  if (body.categorie !== undefined) {
    if (typeof body.categorie !== "string") return bad(422, "„categorie” trebuie să fie id sau slug.");
    const cat = await findCategoryByRef(body.categorie);
    if (!cat) return bad(404, `Categoria „${body.categorie}” nu există.`);
    const rows = await prisma.product.findMany({ where: { categoryId: { in: await categoryWithChildrenIds(cat.id) } }, include });
    rows.forEach((p) => targets.set(p.id, p));
  }
  if (body.produse === undefined && body.categorie === undefined) return bad(422, "Trimite „produse” (listă) și / sau „categorie”.");
  if (targets.size === 0) return bad(404, "Nu s-a găsit niciun produs pentru selecția dată.");
  if (targets.size > 1000) return bad(422, `Selecția are ${targets.size} produse; maximum 1000 într-o cerere.`);

  const missingRefs = Array.isArray(body.produse)
    ? (body.produse as string[]).filter((r) => ![...targets.values()].some((p) => p.id === r || p.slug === r || p.code === r.toUpperCase()))
    : [];

  const rezultate: { ref: string; ok: boolean; error?: string; oferta?: ReturnType<typeof offerOut> }[] = missingRefs.map((r) => ({ ref: r, ok: false, error: "Produsul nu a fost găsit." }));
  for (const p of targets.values()) {
    const res = await applyOffer(p, spec, refresh);
    rezultate.push(res.ok ? { ref: p.slug, ok: true, oferta: res.data } : { ref: p.slug, ok: false, error: res.error });
  }
  const reusite = rezultate.filter((r) => r.ok).length;
  return good({ total: rezultate.length, reusite, esuate: rezultate.length - reusite, rezultate });
}
