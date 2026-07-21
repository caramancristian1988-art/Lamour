"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "./prisma";
import { requireAdmin } from "./adminAuth";

export interface SpaceFormState {
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
  const typeId = String(formData.get("typeId") ?? "").trim();
  const title = String(formData.get("title") ?? "").trim();
  const priceLabel = String(formData.get("priceLabel") ?? "").trim();
  const priceRaw = String(formData.get("price") ?? "").trim();
  const areaRaw = String(formData.get("area") ?? "").trim();
  const location = String(formData.get("location") ?? "").trim();
  const mapAddress = String(formData.get("mapAddress") ?? "").trim() || null;
  const image = String(formData.get("image") ?? "").trim() || null;
  const description = String(formData.get("description") ?? "").trim() || null;
  const characteristics = parseCharacteristics(formData);

  return {
    slug,
    typeId,
    title,
    priceLabel,
    price: priceRaw ? Number(priceRaw) : null,
    area: Number(areaRaw) || 0,
    location,
    mapAddress,
    image,
    description,
    characteristics,
  };
}

export async function createSpaceAction(_prevState: SpaceFormState, formData: FormData): Promise<SpaceFormState> {
  await requireAdmin();

  const data = readFields(formData);
  if (!data.title) return { error: "Completează titlul." };
  if (!data.slug) return { error: "Completează slug-ul." };
  if (!data.typeId) return { error: "Alege un tip." };
  if (!data.priceLabel) return { error: "Completează prețul afișat." };
  if (!data.area || data.area <= 0) return { error: "Introdu o suprafață validă." };
  if (!data.location) return { error: "Completează locația." };

  const existing = await prisma.spaceListing.findUnique({ where: { slug: data.slug } });
  if (existing) return { error: "Există deja un anunț cu acest slug." };

  await prisma.spaceListing.create({ data });
  revalidatePath("/admin/chirie");
  revalidatePath("/spatii-comerciale");
  revalidatePath("/produse");
  revalidatePath(`/spatii-comerciale/${data.slug}`);
  redirect("/admin/chirie");
}

export async function updateSpaceAction(_prevState: SpaceFormState, formData: FormData): Promise<SpaceFormState> {
  await requireAdmin();

  const id = String(formData.get("id") ?? "");
  const data = readFields(formData);

  if (!id) return { error: "Anunț invalid." };
  if (!data.title) return { error: "Completează titlul." };
  if (!data.slug) return { error: "Completează slug-ul." };
  if (!data.typeId) return { error: "Alege un tip." };
  if (!data.priceLabel) return { error: "Completează prețul afișat." };
  if (!data.area || data.area <= 0) return { error: "Introdu o suprafață validă." };
  if (!data.location) return { error: "Completează locația." };

  const existing = await prisma.spaceListing.findUnique({ where: { slug: data.slug } });
  if (existing && existing.id !== id) return { error: "Există deja un anunț cu acest slug." };

  await prisma.spaceListing.update({ where: { id }, data });
  revalidatePath("/admin/chirie");
  revalidatePath("/spatii-comerciale");
  revalidatePath("/produse");
  revalidatePath(`/spatii-comerciale/${data.slug}`);
  redirect("/admin/chirie");
}

export async function deleteSpaceAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  const listing = await prisma.spaceListing.findUnique({ where: { id }, select: { slug: true } });
  await prisma.spaceListing.delete({ where: { id } });
  revalidatePath("/admin/chirie");
  revalidatePath("/spatii-comerciale");
  revalidatePath("/produse");
  if (listing?.slug) revalidatePath(`/spatii-comerciale/${listing.slug}`);
}
