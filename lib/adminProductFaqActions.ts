"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "./prisma";
import { requireAdmin } from "./adminAuth";

async function revalidateProductPage(productId: string) {
  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (product?.slug) revalidatePath(`/produse/${product.slug}`);
}

export async function createProductFaqAction(formData: FormData) {
  await requireAdmin();

  const productId = String(formData.get("productId") ?? "");
  const question = String(formData.get("question") ?? "").trim();
  const answer = String(formData.get("answer") ?? "").trim();
  const order = Number(formData.get("order") ?? 0) || 0;

  if (!productId || !question || !answer) return;

  await prisma.productFaq.create({ data: { productId, question, answer, order } });
  await revalidateProductPage(productId);
  revalidatePath(`/admin/produse/${productId}`);
  redirect(`/admin/produse/${productId}`);
}

export async function updateProductFaqAction(formData: FormData) {
  await requireAdmin();

  const id = String(formData.get("id") ?? "");
  const productId = String(formData.get("productId") ?? "");
  const question = String(formData.get("question") ?? "").trim();
  const answer = String(formData.get("answer") ?? "").trim();
  const order = Number(formData.get("order") ?? 0) || 0;

  if (!id || !productId || !question || !answer) return;

  await prisma.productFaq.update({ where: { id }, data: { question, answer, order } });
  await revalidateProductPage(productId);
  revalidatePath(`/admin/produse/${productId}`);
  redirect(`/admin/produse/${productId}`);
}

export async function deleteProductFaqAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const item = await prisma.productFaq.delete({ where: { id } });
  await revalidateProductPage(item.productId);
  revalidatePath(`/admin/produse/${item.productId}`);
}
