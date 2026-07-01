"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "./prisma";
import { requireAdmin } from "./adminAuth";

async function recomputeProductRating(productName: string | null) {
  if (!productName) return;
  const reviews = await prisma.review.findMany({ where: { product: productName, approved: true } });
  const product = await prisma.product.findFirst({ where: { name: productName } });
  if (!product) return;
  const avgRating = reviews.length > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : 0;
  await prisma.product.update({ where: { id: product.id }, data: { rating: avgRating, reviewCount: reviews.length } });
}

async function revalidateProductPage(productName: string) {
  const product = await prisma.product.findFirst({ where: { name: productName }, select: { slug: true } });
  if (product?.slug) revalidatePath(`/produse/${product.slug}`);
}

export async function createAdminReviewAction(formData: FormData) {
  await requireAdmin();

  const name = String(formData.get("name") ?? "").trim();
  const text = String(formData.get("text") ?? "").trim();
  const rating = Number(formData.get("rating") ?? 0);
  const image = String(formData.get("image") ?? "").trim() || null;
  const product = String(formData.get("product") ?? "").trim() || null;

  if (!name || !text || !rating || rating < 1 || rating > 5) return;

  await prisma.review.create({ data: { name, text, rating, image, product, approved: true } });
  await recomputeProductRating(product);
  revalidatePath("/admin/recenzii");
  revalidatePath("/admin/produse", "layout");
  revalidatePath("/");
  if (product) {
    revalidatePath("/produse");
    await revalidateProductPage(product);
  }
}

export async function updateAdminReviewAction(formData: FormData) {
  await requireAdmin();

  const id = String(formData.get("id") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim() || null;
  const text = String(formData.get("text") ?? "").trim();
  const rating = Number(formData.get("rating") ?? 0);
  const pros = String(formData.get("pros") ?? "").trim() || null;
  const cons = String(formData.get("cons") ?? "").trim() || null;
  const product = String(formData.get("product") ?? "").trim() || null;
  const image = String(formData.get("image") ?? "").trim() || null;

  if (!id || !name || !text || !rating || rating < 1 || rating > 5) return;

  const existing = await prisma.review.findUnique({ where: { id } });
  if (!existing) return;

  await prisma.review.update({ where: { id }, data: { name, email, text, rating, pros, cons, product, image } });

  await recomputeProductRating(existing.product);
  if (product !== existing.product) await recomputeProductRating(product);

  revalidatePath("/admin/recenzii");
  revalidatePath("/admin/produse", "layout");
  revalidatePath("/produse");
  revalidatePath("/");
  if (existing.product) await revalidateProductPage(existing.product);
  if (product && product !== existing.product) await revalidateProductPage(product);
}

export async function approveReviewAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const review = await prisma.review.update({ where: { id }, data: { approved: true } });
  await recomputeProductRating(review.product);

  revalidatePath("/admin/recenzii");
  revalidatePath("/admin/notificari");
  revalidatePath("/admin/produse", "layout");
  revalidatePath("/");
  if (review.product) {
    revalidatePath("/produse");
    await revalidateProductPage(review.product);
  }
}

export async function rejectReviewAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const review = await prisma.review.delete({ where: { id } });
  revalidatePath("/admin/recenzii");
  revalidatePath("/admin/notificari");
  revalidatePath("/admin/produse", "layout");
  revalidatePath("/");
  if (review.product) revalidatePath("/produse");
}

export async function deleteAdminReviewAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const review = await prisma.review.delete({ where: { id } });
  await recomputeProductRating(review.product);

  revalidatePath("/admin/recenzii");
  revalidatePath("/admin/produse", "layout");
  revalidatePath("/");
  if (review.product) {
    revalidatePath("/produse");
    await revalidateProductPage(review.product);
  }
}
