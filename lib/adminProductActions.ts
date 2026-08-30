"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "./prisma";
import { requireAdmin } from "./adminAuth";
import { parseDecimalInput } from "./pricing";

export interface ProductFormState {
  error?: string;
}

function parseImageLines(formData: FormData): string[] {
  return String(formData.get("images") ?? "")
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);
}

// Praguri de preț pe cantitate, din rândurile editorului (tierMinQty/tierPrice).
// Rândurile incomplete sau invalide se ignoră, ca la specificații.
function parsePriceTiers(formData: FormData): { minQty: number; price: number }[] {
  const qtys = formData.getAll("tierMinQty").map((v) => String(v).trim());
  const prices = formData.getAll("tierPrice").map((v) => String(v).trim());
  const byQty = new Map<number, number>();
  for (let i = 0; i < qtys.length; i++) {
    if (qtys[i] === "" || prices[i] === "" || prices[i] === undefined) continue;
    const minQty = Math.floor(Number(qtys[i]));
    const price = parseDecimalInput(prices[i]);
    if (!Number.isFinite(minQty) || !Number.isFinite(price)) continue;
    if (minQty < 2 || price <= 0) continue;
    byQty.set(minQty, price);
  }
  return [...byQty.entries()]
    .map(([minQty, price]) => ({ minQty, price }))
    .sort((a, b) => a.minQty - b.minQty);
}

function parseSpecifications(formData: FormData): { label: string; value: string }[] {
  const labels = formData.getAll("specLabel").map((v) => String(v).trim());
  const values = formData.getAll("specValue").map((v) => String(v).trim());
  const specs: { label: string; value: string }[] = [];
  for (let i = 0; i < labels.length; i++) {
    if (labels[i] && values[i]) specs.push({ label: labels[i], value: values[i] });
  }
  return specs;
}

interface VariantRowInput {
  qty: string;
  unit: string;
  price: number;
  oldPrice: number | null;
}

// Lets an admin add extra size/quantity variants straight from the "new
// product" form, instead of having to save the product first and add each
// variant separately afterwards. Rows missing a valid price are skipped
// silently (e.g. a blank template row left over from removing others).
function parseVariantRows(formData: FormData): VariantRowInput[] {
  const qtys = formData.getAll("variantRowQty").map((v) => String(v).trim());
  const units = formData.getAll("variantRowUnit").map((v) => String(v).trim());
  const prices = formData.getAll("variantRowPrice").map((v) => String(v).trim());
  const oldPrices = formData.getAll("variantRowOldPrice").map((v) => String(v).trim());

  const rows: VariantRowInput[] = [];
  for (let i = 0; i < qtys.length; i++) {
    const price = parseDecimalInput(prices[i]);
    if (!qtys[i] && !units[i]) continue;
    if (!price || price <= 0) continue;
    const oldPrice = parseDecimalInput(oldPrices[i]);
    rows.push({ qty: qtys[i], unit: units[i], price, oldPrice: Number.isFinite(oldPrice) ? oldPrice : null });
  }
  return rows;
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function uniqueSlug(base: string): Promise<string> {
  let slug = base;
  let n = 2;
  while (await prisma.product.findUnique({ where: { slug } })) {
    slug = `${base}-${n}`;
    n++;
  }
  return slug;
}

function readProductFields(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const slug = String(formData.get("slug") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const price = parseDecimalInput(formData.get("price")) || 0;
  const oldPrice = parseDecimalInput(formData.get("oldPrice"));
  const bulkMinQtyRaw = String(formData.get("bulkMinQty") ?? "").trim();
  const bulkPriceRaw = String(formData.get("bulkPrice") ?? "").trim();
  const image = String(formData.get("image") ?? "").trim() || null;
  const images = parseImageLines(formData);
  const priceTiers = parsePriceTiers(formData);
  const packageQuantity = String(formData.get("packageQuantity") ?? "").trim() || null;
  const brand = String(formData.get("brand") ?? "").trim() || null;
  const badge = String(formData.get("badge") ?? "").trim() || null;
  const availability = String(formData.get("availability") ?? "").trim() || "În stoc";
  const installmentsEnabled = formData.get("installmentsEnabled") === "on";
  const categoryId = String(formData.get("categoryId") ?? "").trim();
  const specifications = parseSpecifications(formData);
  const variantGroupId = String(formData.get("variantGroupId") ?? "").trim() || null;
  const variantQty = String(formData.get("variantQty") ?? "").trim();
  const variantUnit = String(formData.get("variantUnit") ?? "").trim();
  const variantLabel = [variantQty, variantUnit].filter(Boolean).join(" ") || null;
  const salesCountRaw = String(formData.get("salesCount") ?? "").trim();
  const salesCount = Math.max(0, Math.floor(Number(salesCountRaw) || 0));

  return {
    name,
    slug,
    description: description || null,
    price,
    oldPrice: Number.isFinite(oldPrice) ? oldPrice : null,
    bulkMinQty: bulkMinQtyRaw ? Number(bulkMinQtyRaw) : null,
    bulkPrice: bulkPriceRaw ? Number(bulkPriceRaw) : null,
    image,
    images,
    priceTiers,
    packageQuantity,
    brand,
    badge,
    availability,
    installmentsEnabled,
    categoryId,
    specifications,
    variantGroupId,
    variantLabel,
    salesCount,
  };
}

export async function createProductAction(_prevState: ProductFormState, formData: FormData): Promise<ProductFormState> {
  await requireAdmin();

  const data = readProductFields(formData);
  if (!data.name) return { error: "Completează numele produsului." };
  if (!data.slug) return { error: "Completează slug-ul." };
  if (!data.price || data.price <= 0) return { error: "Introdu un preț valid." };
  if (!data.categoryId) return { error: "Selectează o categorie." };
  if ((data.bulkMinQty && !data.bulkPrice) || (!data.bulkMinQty && data.bulkPrice)) {
    return { error: "Completează atât cantitatea minimă, cât și prețul per bucată la cantitate mare (sau lasă-le pe amândouă goale)." };
  }

  const existing = await prisma.product.findUnique({ where: { slug: data.slug } });
  if (existing) return { error: "Există deja un produs cu acest slug." };

  const created = await prisma.product.create({ data });

  // Extra size/quantity variants entered on the same "new product" form —
  // only meaningful when this product isn't itself already a variant of
  // something else.
  if (!data.variantGroupId) {
    for (const row of parseVariantRows(formData)) {
      const label = [row.qty, row.unit].filter(Boolean).join(" ");
      const variantName = `${data.name} ${label}`.trim();
      const slug = await uniqueSlug(slugify(variantName));
      await prisma.product.create({
        data: {
          name: variantName,
          slug,
          description: data.description,
          price: row.price,
          oldPrice: row.oldPrice,
          image: data.image,
          images: data.images,
          packageQuantity: data.packageQuantity,
          brand: data.brand,
          availability: data.availability,
          installmentsEnabled: data.installmentsEnabled,
          categoryId: data.categoryId,
          specifications: data.specifications,
          variantGroupId: created.id,
          variantLabel: label,
        },
      });
    }
  }

  await revalidateVariantFamily(created.id);
  if (data.variantGroupId) await revalidateVariantFamily(data.variantGroupId);
  revalidatePath("/admin/produse");
  revalidatePath("/produse");
  revalidatePath(`/produse/${data.slug}`);
  revalidatePath("/");
  redirect("/admin/produse");
}

// A variant's price/label change affects how the whole family's selector
// renders, so every sibling's (and the primary's) page needs revalidating —
// plus every category page any of them lives in, since that's where the
// merged card + variant pills actually show up in listings.
async function revalidateVariantFamily(anyProductId: string) {
  const product = await prisma.product.findUnique({
    where: { id: anyProductId },
    select: { slug: true, variantGroupId: true },
  });
  if (!product) return;
  const primaryId = product.variantGroupId ?? anyProductId;
  const family = await prisma.product.findMany({
    where: { OR: [{ id: primaryId }, { variantGroupId: primaryId }] },
    select: { slug: true, categoryId: true },
  });
  family.forEach((p) => revalidatePath(`/produse/${p.slug}`));
  await revalidateCategoryPaths(family.map((p) => p.categoryId));
}

async function revalidateCategoryPaths(categoryIds: string[]) {
  const uniqueIds = Array.from(new Set(categoryIds));
  if (uniqueIds.length === 0) return;
  const categories = await prisma.category.findMany({
    where: { id: { in: uniqueIds } },
    select: { slug: true, parentId: true },
  });
  const parentIds = categories.map((c) => c.parentId).filter((id): id is string => !!id);
  const parents = parentIds.length
    ? await prisma.category.findMany({ where: { id: { in: parentIds } }, select: { slug: true } })
    : [];
  categories.forEach((c) => revalidatePath(`/produse/${c.slug}`));
  parents.forEach((c) => revalidatePath(`/produse/${c.slug}`));
}

export async function updateProductAction(_prevState: ProductFormState, formData: FormData): Promise<ProductFormState> {
  await requireAdmin();

  const id = String(formData.get("id") ?? "");
  const data = readProductFields(formData);

  if (!id) return { error: "Produs invalid." };
  if (!data.name) return { error: "Completează numele produsului." };
  if (!data.slug) return { error: "Completează slug-ul." };
  if (!data.price || data.price <= 0) return { error: "Introdu un preț valid." };
  if (!data.categoryId) return { error: "Selectează o categorie." };
  if ((data.bulkMinQty && !data.bulkPrice) || (!data.bulkMinQty && data.bulkPrice)) {
    return { error: "Completează atât cantitatea minimă, cât și prețul per bucată la cantitate mare (sau lasă-le pe amândouă goale)." };
  }
  if (data.variantGroupId === id) return { error: "Un produs nu poate fi variantă a lui însuși." };

  const existing = await prisma.product.findUnique({ where: { slug: data.slug } });
  if (existing && existing.id !== id) return { error: "Există deja un produs cu acest slug." };

  const previous = await prisma.product.findUnique({ where: { id }, select: { variantGroupId: true, categoryId: true } });

  await prisma.product.update({ where: { id }, data });
  await revalidateVariantFamily(id);
  if (previous?.variantGroupId && previous.variantGroupId !== data.variantGroupId) {
    await revalidateVariantFamily(previous.variantGroupId);
  }
  // Moving categories means the old category's listing also needs to drop this product.
  if (previous && previous.categoryId !== data.categoryId) {
    await revalidateCategoryPaths([previous.categoryId]);
  }
  revalidatePath("/admin/produse");
  revalidatePath("/produse");
  revalidatePath(`/produse/${data.slug}`);
  revalidatePath("/");
  redirect("/admin/produse");
}

// Lightweight action for the inline price editor on the variant-list section
// of the product edit page — only touches price/oldPrice, no full form.
export async function updateVariantPriceAction(formData: FormData) {
  await requireAdmin();

  const id = String(formData.get("id") ?? "");
  const returnId = String(formData.get("returnId") ?? "");
  const price = parseDecimalInput(formData.get("price")) || 0;
  const oldPrice = parseDecimalInput(formData.get("oldPrice"));
  if (!id || !price || price <= 0) return;

  await prisma.product.update({
    where: { id },
    data: { price, oldPrice: Number.isFinite(oldPrice) ? oldPrice : null },
  });
  await revalidateVariantFamily(id);
  const product = await prisma.product.findUnique({ where: { id }, select: { slug: true } });
  if (product?.slug) revalidatePath(`/produse/${product.slug}`);
  revalidatePath("/admin/produse");
  if (returnId) revalidatePath(`/admin/produse/${returnId}`);
}

export async function deleteProductAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const variantCount = await prisma.product.count({ where: { variantGroupId: id } });
  if (variantCount > 0) return;

  const product = await prisma.product.findUnique({ where: { id }, select: { slug: true, variantGroupId: true, categoryId: true } });
  await prisma.product.delete({ where: { id } });
  if (product?.variantGroupId) await revalidateVariantFamily(product.variantGroupId);
  if (product?.categoryId) await revalidateCategoryPaths([product.categoryId]);
  revalidatePath("/admin/produse");
  revalidatePath("/produse");
  if (product?.slug) revalidatePath(`/produse/${product.slug}`);
  revalidatePath("/");
}
