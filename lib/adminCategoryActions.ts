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

export async function createCategoryInlineAction(
  formData: FormData
): Promise<{ category?: { id: string; name: string }; error?: string }> {
  await requireAdmin();

  const name = String(formData.get("name") ?? "").trim();
  if (!name) return { error: "Numele categoriei este obligatoriu." };

  const slug = slugify(name);
  if (!slug) return { error: "Numele categoriei trebuie să conțină cel puțin o literă." };

  try {
    const category = await prisma.category.create({ data: { name, slug } });
    revalidatePath("/admin/produse/categorii");
    revalidatePath("/produse");
    return { category: { id: category.id, name: category.name } };
  } catch {
    return { error: "Există deja o categorie cu un nume foarte similar." };
  }
}

export async function createCategoryAction(formData: FormData) {
  await requireAdmin();

  const name = String(formData.get("name") ?? "").trim();
  const slug = String(formData.get("slug") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim() || null;
  const image = String(formData.get("image") ?? "").trim() || null;

  if (!name || !slug) return;

  await prisma.category.create({ data: { name, slug, description, image } });
  revalidatePath("/admin/produse/categorii");
  revalidatePath("/produse");
}

export async function updateCategoryAction(formData: FormData) {
  await requireAdmin();

  const id = String(formData.get("id") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const slug = String(formData.get("slug") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim() || null;
  const image = String(formData.get("image") ?? "").trim() || null;

  if (!id || !name || !slug) return;

  await prisma.category.update({ where: { id }, data: { name, slug, description, image } });
  revalidatePath("/admin/produse/categorii");
  revalidatePath("/produse");
  redirect("/admin/produse/categorii");
}

export async function deleteCategoryAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const productCount = await prisma.product.count({ where: { categoryId: id } });
  if (productCount > 0) return;

  await prisma.category.delete({ where: { id } });
  revalidatePath("/admin/produse/categorii");
  revalidatePath("/produse");
}
