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

  await prisma.review.create({ data: { name, text, rating, image, product: null, approved: true } });
  revalidatePath("/admin/recenzii");
}

async function recomputeProductRating(productName: string | null) {
  if (!productName) return;

  const reviews = await prisma.review.findMany({ where: { product: productName, approved: true } });
  const product = await prisma.product.findFirst({ where: { name: productName } });
  if (!product) return;

  const avgRating = reviews.length > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : 0;
  await prisma.product.update({ where: { id: product.id }, data: { rating: avgRating, reviewCount: reviews.length } });
}

export async function approveReviewAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const review = await prisma.review.update({ where: { id }, data: { approved: true } });
  await recomputeProductRating(review.product);

  revalidatePath("/admin/recenzii");
  if (review.product) {
    revalidatePath("/produse");
  }
}

export async function rejectReviewAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  await prisma.review.delete({ where: { id } });
  revalidatePath("/admin/recenzii");
}

export async function deleteAdminReviewAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const review = await prisma.review.delete({ where: { id } });
  await recomputeProductRating(review.product);

  revalidatePath("/admin/recenzii");
}
