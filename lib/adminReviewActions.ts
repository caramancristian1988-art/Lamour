"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "./prisma";
import { requireAdmin } from "./adminAuth";

export async function createAdminReviewAction(formData: FormData) {
  await requireAdmin();

  const name = String(formData.get("name") ?? "").trim();
  const text = String(formData.get("text") ?? "").trim();
  const rating = Number(formData.get("rating") ?? 0);
  const image = String(formData.get("image") ?? "").trim() || null;

  if (!name || !text || !rating || rating < 1 || rating > 5) return;

  await prisma.review.create({ data: { name, text, rating, image, product: null } });
  revalidatePath("/admin/recenzii");
}

export async function deleteAdminReviewAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  await prisma.review.delete({ where: { id } });
  revalidatePath("/admin/recenzii");
}
