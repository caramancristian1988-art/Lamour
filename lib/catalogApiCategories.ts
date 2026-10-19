// Operațiile API-ului de catalog pentru CATEGORII și SUBCATEGORII (o subcategorie e tot o categorie, cu `parentId`).
// Reguli ca pe site: structura are cel mult două niveluri (categorie → subcategorie), slug unic (și față de produse),
// ordinea de afișare e un număr întreg (mai mic = mai sus).
import type { Prisma } from "@prisma/client";
import { prisma } from "./prisma";
import { slugify } from "./slugify";
import { sortCategories } from "./categoryOrder";
import { bad, findCategoryByRef, good, type ApiResult, type Refresh } from "./catalogApi";
import { slugConflict } from "./catalogApiProducts";

const WRITABLE = new Set(["name", "slug", "description", "image", "parent", "parentId", "displayOrder"]);
const IGNORED = new Set(["id", "createdAt", "productCount", "childrenCount", "url", "parentSlug", "children"]);

type CategoryRow = Prisma.CategoryGetPayload<object>;

export function categoryOut(c: CategoryRow, extra: { productCount: number; childrenCount: number; parentSlug?: string | null }) {
  return {
    id: c.id,
    name: c.name,
    slug: c.slug,
    description: c.description,
    image: c.image,
    parentId: c.parentId,
    parentSlug: extra.parentSlug ?? null,
    displayOrder: c.displayOrder ?? 0,
    createdAt: c.createdAt,
    productCount: extra.productCount,
    childrenCount: extra.childrenCount,
    url: `/produse/${c.slug}`,
  };
}

async function countsFor(categories: CategoryRow[]) {
  const grouped = await prisma.product.groupBy({ by: ["categoryId"], _count: { _all: true } });
  const products = new Map(grouped.map((g) => [g.categoryId, g._count._all]));
  const children = new Map<string, number>();
  for (const c of categories) if (c.parentId) children.set(c.parentId, (children.get(c.parentId) ?? 0) + 1);
  const slugById = new Map(categories.map((c) => [c.id, c.slug]));
  return (c: CategoryRow) =>
    categoryOut(c, { productCount: products.get(c.id) ?? 0, childrenCount: children.get(c.id) ?? 0, parentSlug: c.parentId ? slugById.get(c.parentId) : null });
}

/** `tree` = categoriile cu subcategoriile în `children`; altfel listă plată. `parent`: slug/id (doar subcategoriile lui) sau „radacina”. */
export async function listCategories(opts: { tree?: boolean; parent?: string | null }): Promise<ApiResult<unknown>> {
  const all = sortCategories(await prisma.category.findMany({ orderBy: { createdAt: "asc" } }));
  const out = await countsFor(all);

  if (opts.tree) {
    const rows = all.map(out);
    const roots = rows.filter((c) => !c.parentId).map((c) => ({ ...c, children: rows.filter((x) => x.parentId === c.id) }));
    return good({ total: all.length, categorii: roots });
  }

  let list = all;
  if (opts.parent === "radacina") list = all.filter((c) => !c.parentId);
  else if (opts.parent) {
    const parent = await findCategoryByRef(opts.parent);
    if (!parent) return bad(404, `Categoria „${opts.parent}” nu există.`);
    list = all.filter((c) => c.parentId === parent.id);
  }
  return good({ total: list.length, categorii: list.map(out) });
}

export async function getCategory(ref: string): Promise<ApiResult<unknown>> {
  const c = await findCategoryByRef(ref);
  if (!c) return bad(404, `Categoria „${ref}” nu a fost găsită (se caută după id sau slug).`);
  const all = await prisma.category.findMany();
  const out = await countsFor(all);
  const self = out(c);
  const children = sortCategories(all.filter((x) => x.parentId === c.id)).map(out);
  return good({ ...self, children });
}

interface ParsedCategory {
  name?: string;
  slug?: string;
  description?: string | null;
  image?: string | null;
  displayOrder?: number | null;
  /** undefined = nu s-a trimis; null = categorie principală; string = id/slug al părintelui */
  parentRef?: string | null;
}

function parseCategoryBody(body: Record<string, unknown>): { parsed: ParsedCategory } | { errors: string[] } {
  const errors: string[] = [];
  const out: ParsedCategory = {};
  const has = (k: string) => Object.prototype.hasOwnProperty.call(body, k) && body[k] !== undefined;
  for (const key of Object.keys(body)) if (!WRITABLE.has(key) && !IGNORED.has(key)) errors.push(`Câmp necunoscut: „${key}”.`);

  const str = (key: string, nullable: boolean, max: number): string | null | undefined => {
    if (!has(key)) return undefined;
    const v = body[key];
    if (v === null) return nullable ? null : (errors.push(`„${key}” nu poate fi null.`), undefined);
    if (typeof v !== "string") return errors.push(`„${key}” trebuie să fie text.`), undefined;
    const t = v.trim();
    if (t.length > max) return errors.push(`„${key}” este prea lung.`), undefined;
    if (t === "") return nullable ? null : (errors.push(`„${key}” nu poate fi gol.`), undefined);
    return t;
  };

  const name = str("name", false, 200);
  if (name) out.name = name;
  const slug = str("slug", false, 200);
  if (slug) {
    const clean = slugify(slug);
    if (!clean) errors.push("„slug” trebuie să conțină cel puțin o literă sau o cifră.");
    else out.slug = clean;
  }
  const description = str("description", true, 5000);
  if (description !== undefined) out.description = description;
  const image = str("image", true, 1000);
  if (image !== undefined) out.image = image;

  if (has("displayOrder")) {
    const v = body.displayOrder;
    if (v === null || v === "") out.displayOrder = null;
    else {
      const n = Number(v);
      if (Number.isInteger(n)) out.displayOrder = n;
      else errors.push("„displayOrder” trebuie să fie un număr întreg (sau null).");
    }
  }

  const rawParent = has("parentId") ? body.parentId : has("parent") ? body.parent : undefined;
  if (rawParent !== undefined) {
    if (rawParent === null || rawParent === "") out.parentRef = null;
    else if (typeof rawParent === "string") out.parentRef = rawParent.trim();
    else errors.push("„parent” trebuie să fie id sau slug (sau null pentru o categorie principală).");
  }
  return errors.length > 0 ? { errors } : { parsed: out };
}

/** Verifică părintele: există, e categorie principală (nu subcategorie) și nu creează o buclă; categoria cu subcategorii nu devine ea însăși subcategorie. */
async function resolveParent(parentRef: string, selfId?: string): Promise<ApiResult<string>> {
  const parent = await findCategoryByRef(parentRef);
  if (!parent) return bad(422, `Categoria părinte „${parentRef}” nu există.`);
  if (selfId && parent.id === selfId) return bad(422, "O categorie nu poate fi propria ei subcategorie.");
  if (parent.parentId) return bad(422, `„${parentRef}” este ea însăși o subcategorie. Structura are doar două niveluri (categorie → subcategorie).`);
  if (selfId && (await prisma.category.count({ where: { parentId: selfId } })) > 0) {
    return bad(422, "Categoria are subcategorii; nu poate deveni ea însăși subcategorie (doar două niveluri).");
  }
  return good(parent.id);
}

export async function createCategory(body: Record<string, unknown>, refresh: Refresh): Promise<ApiResult<unknown>> {
  const r = parseCategoryBody(body);
  if ("errors" in r) return bad(422, "Date invalide.", r.errors);
  const p = r.parsed;
  if (!p.name) return bad(422, "„name” este obligatoriu.");
  const slug = p.slug ?? slugify(p.name);
  if (!slug) return bad(422, "Nu se poate genera un slug din nume; trimite „slug”.");
  const conflict = await slugConflict(slug);
  if (conflict) return bad(409, conflict);

  let parentId: string | null = null;
  if (p.parentRef) {
    const parent = await resolveParent(p.parentRef);
    if (!parent.ok) return parent;
    parentId = parent.data;
  }

  const created = await prisma.category.create({
    data: { name: p.name, slug, description: p.description ?? null, image: p.image ?? null, parentId, displayOrder: p.displayOrder ?? null },
  });
  refresh.categoryIds.add(created.id);
  return getCategory(created.id);
}

export async function updateCategory(ref: string, body: Record<string, unknown>, refresh: Refresh): Promise<ApiResult<unknown>> {
  const existing = await findCategoryByRef(ref);
  if (!existing) return bad(404, `Categoria „${ref}” nu a fost găsită (se caută după id sau slug).`);
  const r = parseCategoryBody(body);
  if ("errors" in r) return bad(422, "Date invalide.", r.errors);
  const p = r.parsed;
  if (Object.keys(p).length === 0) return bad(400, "Nu s-a trimis niciun câmp de modificat.");

  if (p.slug && p.slug !== existing.slug) {
    const conflict = await slugConflict(p.slug, { categoryId: existing.id });
    if (conflict) return bad(409, conflict);
  }
  let parentId: string | null | undefined;
  if (p.parentRef !== undefined) {
    if (p.parentRef === null) parentId = null;
    else {
      const parent = await resolveParent(p.parentRef, existing.id);
      if (!parent.ok) return parent;
      parentId = parent.data;
    }
  }

  // Paginile vechii și noii categorii (și ale părinților) trebuie reîmprospătate; produsele ei își schimbă breadcrumb-ul.
  refresh.categoryIds.add(existing.id);
  if (existing.parentId) refresh.categoryIds.add(existing.parentId);
  const members = await prisma.product.findMany({ where: { categoryId: existing.id }, select: { slug: true } });
  members.forEach((m) => refresh.slugs.add(m.slug));

  const data: Prisma.CategoryUncheckedUpdateInput = {};
  if (p.name !== undefined) data.name = p.name;
  if (p.slug !== undefined) data.slug = p.slug;
  if (p.description !== undefined) data.description = p.description;
  if (p.image !== undefined) data.image = p.image;
  if (p.displayOrder !== undefined) data.displayOrder = p.displayOrder;
  if (parentId !== undefined) data.parentId = parentId;
  await prisma.category.update({ where: { id: existing.id }, data });

  // Vechiul slug trebuie să dispară din site (pagina lui devine 404).
  if (p.slug && p.slug !== existing.slug) refresh.slugs.add(existing.slug);
  if (parentId) refresh.categoryIds.add(parentId);
  return getCategory(existing.id);
}

/**
 * Șterge o categorie. Implicit refuză dacă are produse sau subcategorii (409, cu numerele).
 *  - moveTo=<categorie>  : mută produsele și subcategoriile în altă categorie, apoi șterge
 *  - cascade=1           : șterge TOT: subcategoriile și produsele lor (cu variante și întrebările frecvente ale produselor)
 */
export async function deleteCategory(ref: string, opts: { moveTo?: string | null; cascade?: boolean }, refresh: Refresh): Promise<ApiResult<unknown>> {
  const existing = await findCategoryByRef(ref);
  if (!existing) return bad(404, `Categoria „${ref}” nu a fost găsită (se caută după id sau slug).`);

  const children = await prisma.category.findMany({ where: { parentId: existing.id }, select: { id: true, slug: true } });
  const subtree = [existing.id, ...children.map((c) => c.id)];
  const ownProducts = await prisma.product.count({ where: { categoryId: existing.id } });
  const subProducts = children.length ? await prisma.product.count({ where: { categoryId: { in: children.map((c) => c.id) } } }) : 0;

  refresh.categoryIds.add(existing.id);
  if (existing.parentId) refresh.categoryIds.add(existing.parentId);

  if (opts.moveTo) {
    const target = await findCategoryByRef(opts.moveTo);
    if (!target) return bad(422, `Categoria de destinație „${opts.moveTo}” nu există.`);
    if (subtree.includes(target.id)) return bad(422, "Destinația nu poate fi categoria ștearsă sau una dintre subcategoriile ei.");
    if (children.length > 0 && target.parentId) {
      return bad(422, "Subcategoriile nu se pot muta sub o subcategorie (doar două niveluri). Alege o categorie principală ca destinație.");
    }
    const moved = await prisma.product.findMany({ where: { categoryId: { in: subtree } }, select: { slug: true } });
    moved.forEach((m) => refresh.slugs.add(m.slug));
    await prisma.product.updateMany({ where: { categoryId: { in: subtree } }, data: { categoryId: target.id } });
    await prisma.category.updateMany({ where: { parentId: existing.id }, data: { parentId: target.id } });
    await prisma.category.delete({ where: { id: existing.id } });
    refresh.categoryIds.add(target.id);
    refresh.slugs.add(existing.slug);
    return good({ deleted: existing.slug, produseMutate: ownProducts + subProducts, subcategoriiMutate: children.length, destinatie: target.slug });
  }

  if (ownProducts + subProducts + children.length > 0 && !opts.cascade) {
    return bad(
      409,
      "Categoria nu este goală. Mută conținutul cu ?moveTo=<categorie>, sau șterge tot cu ?cascade=1.",
      [`${ownProducts} produse în ea`, `${children.length} subcategorii`, `${subProducts} produse în subcategorii`]
    );
  }

  if (opts.cascade) {
    const products = await prisma.product.findMany({ where: { categoryId: { in: subtree } }, select: { id: true, slug: true } });
    const ids = products.map((p) => p.id);
    products.forEach((p) => refresh.slugs.add(p.slug));
    children.forEach((c) => refresh.slugs.add(c.slug));
    await prisma.productFaq.deleteMany({ where: { productId: { in: ids } } });
    // variantele întâi (au referință către produsul principal), apoi restul
    await prisma.product.deleteMany({ where: { id: { in: ids }, variantGroupId: { not: null } } });
    await prisma.product.deleteMany({ where: { id: { in: ids } } });
    await prisma.category.deleteMany({ where: { parentId: existing.id } });
  }
  await prisma.category.delete({ where: { id: existing.id } });
  refresh.slugs.add(existing.slug);
  return good({ deleted: existing.slug, produseSterse: ownProducts + subProducts, subcategoriiSterse: children.length });
}
