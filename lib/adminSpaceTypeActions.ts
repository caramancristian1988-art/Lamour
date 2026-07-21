"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "./prisma";
import { requireAdmin } from "./adminAuth";

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function createSpaceTypeInlineAction(
  formData: FormData
): Promise<{ type?: { id: string; name: string }; error?: string }> {
  await requireAdmin();

  const name = String(formData.get("name") ?? "").trim();
  if (!name) return { error: "Numele tipului este obligatoriu." };

  const slug = slugify(name);
  if (!slug) return { error: "Numele trebuie să conțină cel puțin o literă." };

  try {
    const type = await prisma.spaceType.create({ data: { name, slug } });
    revalidatePath("/admin/chirie/categorii");
    revalidatePath("/spatii-comerciale");
    revalidatePath("/produse");
    return { type: { id: type.id, name: type.name } };
  } catch {
    return { error: "Există deja un tip cu un nume foarte similar." };
  }
}

export async function deleteSpaceTypeInlineAction(id: string): Promise<{ success?: boolean; error?: string }> {
  await requireAdmin();
  if (!id) return { error: "Tip invalid." };

  const listingCount = await prisma.spaceListing.count({ where: { typeId: id } });
  if (listingCount > 0) {
    return { error: "Tipul este folosit de anunțuri existente și nu poate fi șters." };
  }

  await prisma.spaceType.delete({ where: { id } });
  revalidatePath("/admin/chirie/categorii");
  revalidatePath("/spatii-comerciale");
  revalidatePath("/produse");
  return { success: true };
}

export async function createSpaceTypeAction(formData: FormData) {
  await requireAdmin();

  const name = String(formData.get("name") ?? "").trim();
  if (!name) return;
  const slug = slugify(name);
  if (!slug) return;

  await prisma.spaceType.create({ data: { name, slug } });
  revalidatePath("/admin/chirie/categorii");
  revalidatePath("/spatii-comerciale");
  revalidatePath("/produse");
}

export async function updateSpaceTypeAction(formData: FormData) {
  await requireAdmin();

  const id = String(formData.get("id") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  if (!id || !name) return;
  const slug = slugify(name);
  if (!slug) return;

  await prisma.spaceType.update({ where: { id }, data: { name, slug } });
  revalidatePath("/admin/chirie/categorii");
  revalidatePath("/spatii-comerciale");
  revalidatePath("/produse");
  redirect("/admin/chirie/categorii");
}

export async function deleteSpaceTypeAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const listingCount = await prisma.spaceListing.count({ where: { typeId: id } });
  if (listingCount > 0) return;

  await prisma.spaceType.delete({ where: { id } });
  revalidatePath("/admin/chirie/categorii");
  revalidatePath("/spatii-comerciale");
  revalidatePath("/produse");
}
