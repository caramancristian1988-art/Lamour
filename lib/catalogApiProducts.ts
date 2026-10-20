// Operațiile API-ului de catalog pentru PRODUSE: validare, creare, editare, ștergere, listare. Aceleași reguli ca în adminul site-ului
// (lib/adminProductActions.ts): slug normalizat și unic, cod produs unic, prag unic de cantitate cu ambele câmpuri, variante grupate
// sub un produs principal. Câmpurile JSON au numele din baza de date (name, price, oldPrice, priceTiers, hidden …).
import type { Prisma } from "@prisma/client";
import { prisma } from "./prisma";
import { slugify } from "./slugify";
import { PRODUCT_CODE_HELP, PRODUCT_CODE_RE, normalizeProductCode, randomProductCode } from "./productCode";
import { normalizeTiers, parseDecimalInput, type PriceTier } from "./pricing";
import {
  addProductFamily,
  bad,
  categoryWithChildrenIds,
  findCategoryByRef,
  findProductByRef,
  good,
  isObjectId,
  parsePositiveInt,
  round2,
  type ApiResult,
  type Refresh,
} from "./catalogApi";

export const HIGHLIGHT_VALUES = ["none", "bestseller", "popular", "nou", "sezon", "util"];

// Câmpuri pe care API-ul le primește la scriere. Cele de mai jos din IGNORED apar în răspunsuri (citire) și sunt acceptate și
// ignorate la scriere, ca un obiect citit cu GET să poată fi trimis înapoi cu PATCH fără să fie curățat de mână.
const WRITABLE = new Set([
  "name", "slug", "code", "description", "price", "oldPrice", "bulkMinQty", "bulkPrice", "priceTiers", "image", "images",
  "packageQuantity", "weightKg", "brand", "badge", "availability", "salesCount", "popupEnabled", "installmentsEnabled",
  "warrantyEnabled", "hidden", "recommended", "isNewProduct", "highlight", "specifications", "variantLabel",
  "category", "categoryId", "variantGroup", "variantGroupId",
]);
const IGNORED = new Set(["id", "createdAt", "rating", "reviewCount", "variants", "url", "discountPercent", "quantityOffers"]);

export interface ProductFields {
  name?: string;
  slug?: string;
  description?: string | null;
  price?: number;
  oldPrice?: number | null;
  bulkMinQty?: number | null;
  bulkPrice?: number | null;
  priceTiers?: PriceTier[];
  image?: string | null;
  images?: string[];
  packageQuantity?: string | null;
  weightKg?: number | null;
  brand?: string | null;
  badge?: string | null;
  availability?: string;
  salesCount?: number;
  popupEnabled?: boolean;
  installmentsEnabled?: boolean;
  warrantyEnabled?: boolean;
  hidden?: boolean;
  recommended?: boolean;
  isNewProduct?: boolean;
  highlight?: string | null;
  specifications?: { label: string; value: string }[];
  variantLabel?: string | null;
}

interface ParsedProduct {
  fields: ProductFields;
  code?: string;
  /** undefined = nu s-a trimis; string = id/slug de categorie */
  categoryRef?: string;
  /** undefined = nu s-a trimis; null = scoate din grupul de variante; string = produsul principal */
  variantRef?: string | null;
}

function refFrom(value: unknown): string | null | undefined {
  if (value === undefined) return undefined;
  if (value === null || value === "") return null;
  if (typeof value === "string") return value.trim();
  if (typeof value === "object") {
    const o = value as Record<string, unknown>;
    const inner = o.id ?? o.slug;
    if (typeof inner === "string" && inner.trim()) return inner.trim();
  }
  return undefined;
}

export function parseProductBody(body: Record<string, unknown>): { parsed: ParsedProduct } | { errors: string[] } {
  const errors: string[] = [];
  const fields: ProductFields = {};
  const has = (k: string) => Object.prototype.hasOwnProperty.call(body, k) && body[k] !== undefined;

  for (const key of Object.keys(body)) {
    if (!WRITABLE.has(key) && !IGNORED.has(key)) errors.push(`Câmp necunoscut: „${key}”.`);
  }

  const text = (key: string, opts: { nullable?: boolean; max?: number } = {}): string | null | undefined => {
    if (!has(key)) return undefined;
    const v = body[key];
    if (v === null) {
      if (opts.nullable) return null;
      errors.push(`„${key}” nu poate fi null.`);
      return undefined;
    }
    if (typeof v !== "string") {
      errors.push(`„${key}” trebuie să fie text.`);
      return undefined;
    }
    const t = v.trim();
    if (t.length > (opts.max ?? 5000)) {
      errors.push(`„${key}” este prea lung (maxim ${opts.max ?? 5000} caractere).`);
      return undefined;
    }
    if (t === "") {
      if (opts.nullable) return null;
      errors.push(`„${key}” nu poate fi gol.`);
      return undefined;
    }
    return t;
  };

  const num = (key: string, opts: { nullable?: boolean; min?: number; int?: boolean } = {}): number | null | undefined => {
    if (!has(key)) return undefined;
    const v = body[key];
    if (v === null || v === "") {
      if (opts.nullable) return null;
      errors.push(`„${key}” nu poate fi gol.`);
      return undefined;
    }
    const n = typeof v === "number" ? v : parseDecimalInput(v);
    if (!Number.isFinite(n)) {
      errors.push(`„${key}” trebuie să fie un număr.`);
      return undefined;
    }
    if (opts.int && !Number.isInteger(n)) {
      errors.push(`„${key}” trebuie să fie un număr întreg.`);
      return undefined;
    }
    if (opts.min !== undefined && n < opts.min) {
      errors.push(`„${key}” trebuie să fie cel puțin ${opts.min}.`);
      return undefined;
    }
    return n;
  };

  const bool = (key: string): boolean | undefined => {
    if (!has(key)) return undefined;
    const v = body[key];
    if (typeof v === "boolean") return v;
    if (v === null) return false;
    errors.push(`„${key}” trebuie să fie true sau false.`);
    return undefined;
  };

  const name = text("name", { max: 300 });
  if (name !== undefined && name !== null) fields.name = name;
  const slug = text("slug", { max: 200 });
  if (slug !== undefined && slug !== null) {
    const clean = slugify(slug);
    if (!clean) errors.push("„slug” trebuie să conțină cel puțin o literă sau o cifră.");
    else fields.slug = clean;
  }
  const description = text("description", { nullable: true, max: 20000 });
  if (description !== undefined) fields.description = description;
  const image = text("image", { nullable: true, max: 1000 });
  if (image !== undefined) fields.image = image;
  const packageQuantity = text("packageQuantity", { nullable: true, max: 200 });
  if (packageQuantity !== undefined) fields.packageQuantity = packageQuantity;
  const brand = text("brand", { nullable: true, max: 200 });
  if (brand !== undefined) fields.brand = brand;
  const badge = text("badge", { nullable: true, max: 100 });
  if (badge !== undefined) fields.badge = badge;
  const availability = text("availability", { max: 100 });
  if (availability !== undefined && availability !== null) fields.availability = availability;
  const variantLabel = text("variantLabel", { nullable: true, max: 100 });
  if (variantLabel !== undefined) fields.variantLabel = variantLabel;

  const price = num("price", { min: 0.01 });
  if (price !== undefined && price !== null) fields.price = price;
  const oldPrice = num("oldPrice", { nullable: true, min: 0.01 });
  if (oldPrice !== undefined) fields.oldPrice = oldPrice;
  const bulkMinQty = num("bulkMinQty", { nullable: true, min: 2, int: true });
  if (bulkMinQty !== undefined) fields.bulkMinQty = bulkMinQty;
  const bulkPrice = num("bulkPrice", { nullable: true, min: 0.01 });
  if (bulkPrice !== undefined) fields.bulkPrice = bulkPrice;
  const weightKg = num("weightKg", { nullable: true, min: 0.001 });
  if (weightKg !== undefined) fields.weightKg = weightKg === null ? null : Math.round(weightKg * 1000) / 1000;
  const salesCount = num("salesCount", { min: 0, int: true });
  if (salesCount !== undefined && salesCount !== null) fields.salesCount = salesCount;

  for (const key of ["popupEnabled", "installmentsEnabled", "warrantyEnabled", "hidden", "recommended", "isNewProduct"] as const) {
    const v = bool(key);
    if (v !== undefined) fields[key] = v;
  }

  if (has("highlight")) {
    const v = body.highlight;
    if (v === null || v === "") fields.highlight = null;
    else if (typeof v === "string" && HIGHLIGHT_VALUES.includes(v)) fields.highlight = v;
    else errors.push(`„highlight” trebuie să fie unul dintre: ${HIGHLIGHT_VALUES.join(", ")} (sau null pentru automat).`);
  }

  if (has("images")) {
    const v = body.images;
    if (Array.isArray(v) && v.every((x) => typeof x === "string")) fields.images = v.map((x: string) => x.trim()).filter(Boolean);
    else errors.push("„images” trebuie să fie o listă de adrese (text).");
  }

  if (has("priceTiers")) {
    const v = body.priceTiers;
    if (!Array.isArray(v)) errors.push("„priceTiers” trebuie să fie o listă de { minQty, price }.");
    else {
      const tiers: PriceTier[] = [];
      v.forEach((t, i) => {
        const o = (t ?? {}) as Record<string, unknown>;
        const minQty = Number(o.minQty);
        const p = parseDecimalInput(o.price);
        if (!Number.isInteger(minQty) || minQty < 2 || !Number.isFinite(p) || p <= 0) {
          errors.push(`priceTiers[${i}]: „minQty” trebuie să fie un întreg ≥ 2 și „price” un număr > 0.`);
        } else tiers.push({ minQty, price: p });
      });
      fields.priceTiers = normalizeTiers({ priceTiers: tiers });
    }
  }

  if (has("specifications")) {
    const v = body.specifications;
    if (!Array.isArray(v)) errors.push("„specifications” trebuie să fie o listă de { label, value }.");
    else {
      const specs: { label: string; value: string }[] = [];
      v.forEach((s, i) => {
        const o = (s ?? {}) as Record<string, unknown>;
        const label = typeof o.label === "string" ? o.label.trim() : "";
        const value = typeof o.value === "string" || typeof o.value === "number" ? String(o.value).trim() : "";
        if (!label || !value) errors.push(`specifications[${i}]: „label” și „value” sunt obligatorii.`);
        else specs.push({ label, value });
      });
      fields.specifications = specs;
    }
  }

  const parsed: ParsedProduct = { fields };
  if (has("code")) {
    const c = body.code;
    if (typeof c === "string") parsed.code = c.trim();
    else if (c !== null) errors.push("„code” trebuie să fie text.");
  }
  const cat = refFrom(has("categoryId") ? body.categoryId : has("category") ? body.category : undefined);
  if (cat === null) errors.push("Produsul trebuie să aibă o categorie („category”: id sau slug).");
  else if (cat !== undefined) parsed.categoryRef = cat;
  const variant = refFrom(has("variantGroupId") ? body.variantGroupId : has("variantGroup") ? body.variantGroup : undefined);
  if (variant !== undefined) parsed.variantRef = variant;

  return errors.length > 0 ? { errors } : { parsed };
}

// ── Coduri și slug-uri ──
async function freshCode(): Promise<string> {
  for (;;) {
    const code = randomProductCode();
    if (!(await prisma.product.findUnique({ where: { code }, select: { id: true } }))) return code;
  }
}

async function resolveCode(raw: string | undefined, excludeId?: string): Promise<ApiResult<string | undefined>> {
  if (raw === undefined) return good(undefined);
  if (raw === "") return good(await freshCode());
  const code = normalizeProductCode(raw);
  if (!PRODUCT_CODE_RE.test(code)) return bad(422, `„code” poate conține doar ${PRODUCT_CODE_HELP}; nu poate începe sau se termina cu separator.`);
  const existing = await prisma.product.findUnique({ where: { code }, select: { id: true } });
  if (existing && existing.id !== excludeId) return bad(409, `Există deja un produs cu codul „${code}”.`);
  return good(code);
}

// Pagina /produse/[slug] servește și produse, și categorii: un slug trebuie să fie unic între ambele.
export async function slugConflict(slug: string, except: { productId?: string; categoryId?: string } = {}): Promise<string | null> {
  const [product, category] = await Promise.all([
    prisma.product.findUnique({ where: { slug }, select: { id: true } }),
    prisma.category.findUnique({ where: { slug }, select: { id: true } }),
  ]);
  if (product && product.id !== except.productId) return `Există deja un produs cu slug-ul „${slug}”.`;
  if (category && category.id !== except.categoryId) return `Există deja o categorie cu slug-ul „${slug}” (pagina /produse/${slug} ar fi ambiguă).`;
  return null;
}

// ── Ieșire ──
export const productInclude = {
  category: { select: { id: true, name: true, slug: true, parentId: true } },
  variants: { select: { id: true, slug: true, code: true, variantLabel: true, price: true, oldPrice: true } },
} satisfies Prisma.ProductInclude;

type ProductWithRelations = Prisma.ProductGetPayload<{ include: typeof productInclude }>;

export function productOut(p: ProductWithRelations) {
  const tiers = normalizeTiers(p);
  const discountPercent = p.oldPrice && p.oldPrice > p.price ? Math.round((1 - p.price / p.oldPrice) * 100) : 0;
  return { ...p, url: `/produse/${p.slug}`, discountPercent, quantityOffers: tiers };
}

async function loadOut(id: string) {
  const p = await prisma.product.findUnique({ where: { id }, include: productInclude });
  return p ? productOut(p) : null;
}

// ── Citire ──
export interface ProductListParams {
  q?: string | null;
  categorie?: string | null;
  ascuns?: string | null; // da | nu | (gol = toate)
  principale?: string | null; // 1 = doar produsele principale (fără variantele lor)
  disponibilitate?: string | null;
  sortare?: string | null; // nou | vechi | pret | pret-desc | nume
  pagina?: string | null;
  perPagina?: string | null; // număr sau „toate”
}

export async function listProducts(params: ProductListParams): Promise<ApiResult<{ total: number; pagina: number; perPagina: number; pagini: number; produse: ReturnType<typeof productOut>[] }>> {
  const and: Prisma.ProductWhereInput[] = [];
  const q = params.q?.trim();
  if (q) {
    and.push({
      OR: [
        { name: { contains: q, mode: "insensitive" } },
        { slug: { contains: q, mode: "insensitive" } },
        { code: { contains: q.toUpperCase() } },
        { brand: { contains: q, mode: "insensitive" } },
      ],
    });
  }
  if (params.categorie) {
    const cat = await findCategoryByRef(params.categorie);
    if (!cat) return bad(404, `Categoria „${params.categorie}” nu există.`);
    and.push({ categoryId: { in: await categoryWithChildrenIds(cat.id) } });
  }
  if (params.ascuns === "da") and.push({ hidden: true });
  else if (params.ascuns === "nu") and.push({ OR: [{ hidden: { isSet: false } }, { hidden: null }, { hidden: false }] });
  if (params.principale === "1") and.push({ OR: [{ variantGroupId: { isSet: false } }, { variantGroupId: null }] });
  if (params.disponibilitate) and.push({ availability: params.disponibilitate });

  const where: Prisma.ProductWhereInput = and.length > 0 ? { AND: and } : {};
  const orderBy: Prisma.ProductOrderByWithRelationInput =
    params.sortare === "vechi" ? { createdAt: "asc" } :
    params.sortare === "pret" ? { price: "asc" } :
    params.sortare === "pret-desc" ? { price: "desc" } :
    params.sortare === "nume" ? { name: "asc" } : { createdAt: "desc" };

  const all = params.perPagina === "toate";
  const perPagina = all ? 5000 : parsePositiveInt(params.perPagina ?? null, 100, 500);
  const pagina = all ? 1 : parsePositiveInt(params.pagina ?? null, 1, 100000);

  const [total, rows] = await Promise.all([
    prisma.product.count({ where }),
    prisma.product.findMany({ where, orderBy, skip: (pagina - 1) * perPagina, take: perPagina, include: productInclude }),
  ]);
  return good({ total, pagina, perPagina, pagini: Math.max(1, Math.ceil(total / perPagina)), produse: rows.map(productOut) });
}

export async function getProduct(ref: string): Promise<ApiResult<ReturnType<typeof productOut>>> {
  const p = await findProductByRef(ref);
  if (!p) return bad(404, `Produsul „${ref}” nu a fost găsit (se caută după id, slug sau cod).`);
  const out = await loadOut(p.id);
  return out ? good(out) : bad(404, `Produsul „${ref}” nu a fost găsit.`);
}

// ── Reguli comune la scriere ──
async function resolveCategoryId(ref: string): Promise<ApiResult<string>> {
  const cat = await findCategoryByRef(ref);
  return cat ? good(cat.id) : bad(422, `Categoria „${ref}” nu există (id sau slug).`);
}

async function resolveVariantParent(ref: string, selfId?: string): Promise<ApiResult<string>> {
  const parent = await findProductByRef(ref);
  if (!parent) return bad(422, `Produsul principal „${ref}” nu există.`);
  if (parent.id === selfId) return bad(422, "Un produs nu poate fi variantă a lui însuși.");
  if (parent.variantGroupId) return bad(422, `„${ref}” este el însuși o variantă; alege produsul principal al grupului.`);
  return good(parent.id);
}

function checkPricing(price: number, tiers: PriceTier[], bulkMinQty: number | null | undefined, bulkPrice: number | null | undefined): string[] {
  const errors: string[] = [];
  if ((bulkMinQty && !bulkPrice) || (!bulkMinQty && bulkPrice)) {
    errors.push("„bulkMinQty” și „bulkPrice” se completează împreună (sau amândouă null).");
  }
  for (const t of tiers) {
    if (t.price >= price) errors.push(`Prag de cantitate invalid: ${t.price} (de la ${t.minQty} buc.) trebuie să fie mai mic decât prețul de bază (${price}).`);
  }
  if (bulkPrice && bulkPrice >= price) errors.push(`„bulkPrice” (${bulkPrice}) trebuie să fie mai mic decât prețul de bază (${price}).`);
  return errors;
}

// ── Creare ──
export async function createProduct(body: Record<string, unknown>, refresh: Refresh): Promise<ApiResult<ReturnType<typeof productOut>>> {
  const parsedResult = parseProductBody(body);
  if ("errors" in parsedResult) return bad(422, "Date invalide.", parsedResult.errors);
  const { fields, code, categoryRef, variantRef } = parsedResult.parsed;

  const missing: string[] = [];
  if (!fields.name) missing.push("„name” este obligatoriu.");
  if (fields.price === undefined) missing.push("„price” este obligatoriu.");
  if (!categoryRef) missing.push("„category” (id sau slug) este obligatoriu.");
  if (missing.length > 0) return bad(422, "Date incomplete.", missing);

  const price = fields.price as number;
  const slug = fields.slug ?? slugify(fields.name as string);
  if (!slug) return bad(422, "Nu se poate genera un slug din nume; trimite „slug”.");
  const conflict = await slugConflict(slug);
  if (conflict) return bad(409, conflict);

  const pricingErrors = checkPricing(price, fields.priceTiers ?? [], fields.bulkMinQty, fields.bulkPrice);
  if (pricingErrors.length > 0) return bad(422, "Prețuri invalide.", pricingErrors);

  const cat = await resolveCategoryId(categoryRef as string);
  if (!cat.ok) return cat;
  const codeResult = await resolveCode(code ?? "");
  if (!codeResult.ok) return codeResult;

  let variantGroupId: string | null = null;
  if (variantRef) {
    const parent = await resolveVariantParent(variantRef);
    if (!parent.ok) return parent;
    variantGroupId = parent.data;
  }

  const created = await prisma.product.create({
    data: {
      name: fields.name as string,
      slug,
      code: codeResult.data,
      description: fields.description ?? null,
      price,
      oldPrice: fields.oldPrice ?? null,
      bulkMinQty: fields.bulkMinQty ?? null,
      bulkPrice: fields.bulkPrice ?? null,
      priceTiers: fields.priceTiers ?? [],
      image: fields.image ?? null,
      images: fields.images ?? [],
      packageQuantity: fields.packageQuantity ?? null,
      weightKg: fields.weightKg ?? null,
      brand: fields.brand ?? null,
      badge: fields.badge ?? null,
      availability: fields.availability ?? "În stoc",
      salesCount: fields.salesCount ?? 0,
      popupEnabled: fields.popupEnabled ?? false,
      installmentsEnabled: fields.installmentsEnabled ?? true,
      warrantyEnabled: fields.warrantyEnabled ?? true,
      hidden: fields.hidden ?? false,
      recommended: fields.recommended ?? false,
      isNewProduct: fields.isNewProduct ?? false,
      highlight: fields.highlight ?? null,
      specifications: fields.specifications ?? [],
      categoryId: cat.data,
      variantGroupId,
      variantLabel: fields.variantLabel ?? null,
    },
  });

  refresh.slugs.add(created.slug);
  refresh.categoryIds.add(created.categoryId);
  await addProductFamily(refresh, created.id);
  const out = await loadOut(created.id);
  return out ? good(out) : bad(500, "Produsul a fost creat, dar nu a putut fi citit.");
}

// ── Editare ──
export async function updateProduct(ref: string, body: Record<string, unknown>, refresh: Refresh): Promise<ApiResult<ReturnType<typeof productOut>>> {
  const existing = await findProductByRef(ref);
  if (!existing) return bad(404, `Produsul „${ref}” nu a fost găsit (se caută după id, slug sau cod).`);

  const parsedResult = parseProductBody(body);
  if ("errors" in parsedResult) return bad(422, "Date invalide.", parsedResult.errors);
  const { fields, code, categoryRef, variantRef } = parsedResult.parsed;
  if (Object.keys(fields).length === 0 && code === undefined && categoryRef === undefined && variantRef === undefined) {
    return bad(400, "Nu s-a trimis niciun câmp de modificat.");
  }

  const finalPrice = fields.price ?? existing.price;
  const finalTiers = fields.priceTiers ?? existing.priceTiers.map((t) => ({ minQty: t.minQty, price: t.price }));
  const finalBulkMin = fields.bulkMinQty !== undefined ? fields.bulkMinQty : existing.bulkMinQty;
  const finalBulkPrice = fields.bulkPrice !== undefined ? fields.bulkPrice : existing.bulkPrice;
  // Verificăm prețurile doar dacă s-a atins ceva din ele (un produs vechi cu date incomplete nu trebuie să blocheze alte modificări).
  if (["price", "priceTiers", "bulkMinQty", "bulkPrice"].some((k) => k in fields)) {
    const pricingErrors = checkPricing(finalPrice, finalTiers, finalBulkMin, finalBulkPrice);
    if (pricingErrors.length > 0) return bad(422, "Prețuri invalide.", pricingErrors);
  }

  if (fields.slug && fields.slug !== existing.slug) {
    const conflict = await slugConflict(fields.slug, { productId: existing.id });
    if (conflict) return bad(409, conflict);
  }
  const codeResult = await resolveCode(code, existing.id);
  if (!codeResult.ok) return codeResult;

  let categoryId: string | undefined;
  if (categoryRef !== undefined) {
    const cat = await resolveCategoryId(categoryRef);
    if (!cat.ok) return cat;
    categoryId = cat.data;
  }

  let variantGroupId: string | null | undefined;
  if (variantRef !== undefined) {
    if (variantRef === null) variantGroupId = null;
    else {
      const parent = await resolveVariantParent(variantRef, existing.id);
      if (!parent.ok) return parent;
      if ((await prisma.product.count({ where: { variantGroupId: existing.id } })) > 0) {
        return bad(422, "Produsul are el însuși variante; nu poate deveni variantă a altuia.");
      }
      variantGroupId = parent.data;
    }
  }

  // Familia dinainte de modificare (dacă se mută între grupuri / categorii, paginile vechi trebuie reîmprospătate și ele).
  await addProductFamily(refresh, existing.id);
  refresh.slugs.add(existing.slug);
  refresh.categoryIds.add(existing.categoryId);

  const data: Prisma.ProductUncheckedUpdateInput = {};
  const f = fields;
  if (f.name !== undefined) data.name = f.name;
  if (f.slug !== undefined) data.slug = f.slug;
  if (codeResult.data !== undefined) data.code = codeResult.data;
  if (f.description !== undefined) data.description = f.description;
  if (f.price !== undefined) data.price = f.price;
  if (f.oldPrice !== undefined) data.oldPrice = f.oldPrice;
  if (f.bulkMinQty !== undefined) data.bulkMinQty = f.bulkMinQty;
  if (f.bulkPrice !== undefined) data.bulkPrice = f.bulkPrice;
  if (f.priceTiers !== undefined) data.priceTiers = { set: f.priceTiers };
  if (f.image !== undefined) data.image = f.image;
  if (f.images !== undefined) data.images = { set: f.images };
  if (f.packageQuantity !== undefined) data.packageQuantity = f.packageQuantity;
  if (f.weightKg !== undefined) data.weightKg = f.weightKg;
  if (f.brand !== undefined) data.brand = f.brand;
  if (f.badge !== undefined) data.badge = f.badge;
  if (f.availability !== undefined) data.availability = f.availability;
  if (f.salesCount !== undefined) data.salesCount = f.salesCount;
  if (f.popupEnabled !== undefined) data.popupEnabled = f.popupEnabled;
  if (f.installmentsEnabled !== undefined) data.installmentsEnabled = f.installmentsEnabled;
  if (f.warrantyEnabled !== undefined) data.warrantyEnabled = f.warrantyEnabled;
  if (f.hidden !== undefined) data.hidden = f.hidden;
  if (f.recommended !== undefined) data.recommended = f.recommended;
  if (f.isNewProduct !== undefined) data.isNewProduct = f.isNewProduct;
  if (f.highlight !== undefined) data.highlight = f.highlight;
  if (f.specifications !== undefined) data.specifications = { set: f.specifications };
  if (f.variantLabel !== undefined) data.variantLabel = f.variantLabel;
  if (categoryId !== undefined) data.categoryId = categoryId;
  if (variantGroupId !== undefined) data.variantGroupId = variantGroupId;

  await prisma.product.update({ where: { id: existing.id }, data });

  const after = await prisma.product.findUnique({ where: { id: existing.id }, select: { slug: true, categoryId: true } });
  if (after) {
    refresh.slugs.add(after.slug);
    refresh.categoryIds.add(after.categoryId);
  }
  await addProductFamily(refresh, existing.id);
  const out = await loadOut(existing.id);
  return out ? good(out) : bad(500, "Produsul a fost modificat, dar nu a putut fi citit.");
}

// ── Ștergere ──
export async function deleteProduct(ref: string, opts: { withVariants: boolean }, refresh: Refresh): Promise<ApiResult<{ deleted: { id: string; slug: string; name: string }[] }>> {
  const existing = await findProductByRef(ref);
  if (!existing) return bad(404, `Produsul „${ref}” nu a fost găsit (se caută după id, slug sau cod).`);

  const variants = await prisma.product.findMany({ where: { variantGroupId: existing.id }, select: { id: true, slug: true, name: true, categoryId: true } });
  if (variants.length > 0 && !opts.withVariants) {
    return bad(409, `Produsul are ${variants.length} variante. Șterge-le mai întâi, sau folosește ?cuVariante=1 ca să le ștergi împreună.`, variants.map((v) => `${v.slug} (${v.name})`));
  }

  await addProductFamily(refresh, existing.id);
  refresh.slugs.add(existing.slug);
  refresh.categoryIds.add(existing.categoryId);

  const toDelete = [...variants, { id: existing.id, slug: existing.slug, name: existing.name, categoryId: existing.categoryId }];
  const ids = toDelete.map((p) => p.id);
  // Întrebările frecvente legate de produs rămân orfane dacă nu se șterg odată cu el. Recenziile se păstrează (sunt ale clienților).
  await prisma.productFaq.deleteMany({ where: { productId: { in: ids } } });
  await prisma.product.deleteMany({ where: { id: { in: ids.filter((id) => id !== existing.id) } } });
  await prisma.product.delete({ where: { id: existing.id } });

  for (const p of toDelete) {
    refresh.slugs.add(p.slug);
    refresh.categoryIds.add(p.categoryId);
  }
  return good({ deleted: toDelete.map((p) => ({ id: p.id, slug: p.slug, name: p.name })) });
}

export { round2, isObjectId };
