"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "./prisma";
import { requireAdmin } from "./adminAuth";

export interface FurnitureFormState {
  error?: string;
}

function parseCharacteristics(formData: FormData): { label: string; value: string }[] {
  const labels = formData.getAll("specLabel").map((v) => String(v).trim());
  const values = formData.getAll("specValue").map((v) => String(v).trim());
  const rows: { label: string; value: string }[] = [];
  for (let i = 0; i < labels.length; i++) {
    if (labels[i] && values[i]) rows.push({ label: labels[i], value: values[i] });
  }
  return rows;
}

function readFields(formData: FormData) {
  const slug = String(formData.get("slug") ?? "").trim();
  const type = String(formData.get("type") ?? "").trim();
  const title = String(formData.get("title") ?? "").trim();
  const priceLabel = String(formData.get("priceLabel") ?? "").trim();
  const priceRaw = String(formData.get("price") ?? "").trim();
  const material = String(formData.get("material") ?? "").trim();
  const leadTime = String(formData.get("leadTime") ?? "").trim() || null;
  const image = String(formData.get("image") ?? "").trim() || null;
  const description = String(formData.get("description") ?? "").trim() || null;
  const characteristics = parseCharacteristics(formData);

  return {
    slug,
    type,
    title,
    priceLabel,
    price: priceRaw ? Number(priceRaw) : null,
    material,
    leadTime,
    image,
    description,
    characteristics,
  };
}

export async function createFurnitureAction(_prevState: FurnitureFormState, formData: FormData): Promise<FurnitureFormState> {
  await requireAdmin();

  const data = readFields(formData);
  if (!data.title) return { error: "Completează titlul." };
  if (!data.slug) return { error: "Completează slug-ul." };
  if (!data.type) return { error: "Completează tipul." };
  if (!data.priceLabel) return { error: "Completează prețul afișat." };
  if (!data.material) return { error: "Completează materialul." };

  const existing = await prisma.furnitureListing.findUnique({ where: { slug: data.slug } });
  if (existing) return { error: "Există deja o lucrare cu acest slug." };

  await prisma.furnitureListing.create({ data });
  revalidatePath("/admin/mobila");
  revalidatePath("/mobila");
  revalidatePath("/produse");
  revalidatePath(`/mobila/${data.slug}`);
  redirect("/admin/mobila");
}

export async function updateFurnitureAction(_prevState: FurnitureFormState, formData: FormData): Promise<FurnitureFormState> {
  await requireAdmin();

  const id = String(formData.get("id") ?? "");
  const data = readFields(formData);

  if (!id) return { error: "Lucrare invalidă." };
  if (!data.title) return { error: "Completează titlul." };
  if (!data.slug) return { error: "Completează slug-ul." };
  if (!data.type) return { error: "Completează tipul." };
  if (!data.priceLabel) return { error: "Completează prețul afișat." };
  if (!data.material) return { error: "Completează materialul." };

  const existing = await prisma.furnitureListing.findUnique({ where: { slug: data.slug } });
  if (existing && existing.id !== id) return { error: "Există deja o lucrare cu acest slug." };

  await prisma.furnitureListing.update({ where: { id }, data });
  revalidatePath("/admin/mobila");
  revalidatePath("/mobila");
  revalidatePath("/produse");
  revalidatePath(`/mobila/${data.slug}`);
  redirect("/admin/mobila");
}

export async function deleteFurnitureAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  const listing = await prisma.furnitureListing.findUnique({ where: { id }, select: { slug: true } });
  await prisma.furnitureListing.delete({ where: { id } });
  revalidatePath("/admin/mobila");
  revalidatePath("/mobila");
  revalidatePath("/produse");
  if (listing?.slug) revalidatePath(`/mobila/${listing.slug}`);
}
