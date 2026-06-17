"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "./prisma";
import { requireAdmin } from "./adminAuth";

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
