"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "./prisma";
import { requireAdmin } from "./adminAuth";

function parseImages(formData: FormData): string[] {
  return String(formData.get("images") ?? "")
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);
}

export async function createProjectAction(formData: FormData) {
  await requireAdmin();

  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const images = parseImages(formData);

  if (!title || !description) return;

  await prisma.project.create({ data: { title, description, images } });
  revalidatePath("/admin/proiecte");
  revalidatePath("/proiecte");
  redirect("/admin/proiecte");
}

export async function updateProjectAction(formData: FormData) {
  await requireAdmin();

  const id = String(formData.get("id") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const images = parseImages(formData);

  if (!id || !title || !description) return;

  await prisma.project.update({ where: { id }, data: { title, description, images } });
  revalidatePath("/admin/proiecte");
  revalidatePath("/proiecte");
  redirect("/admin/proiecte");
}

export async function deleteProjectAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  await prisma.project.delete({ where: { id } });
  revalidatePath("/admin/proiecte");
  revalidatePath("/proiecte");
}
