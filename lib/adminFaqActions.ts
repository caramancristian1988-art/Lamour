"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "./prisma";
import { requireAdmin } from "./adminAuth";

export async function createFaqAction(formData: FormData) {
  await requireAdmin();

  const question = String(formData.get("question") ?? "").trim();
  const answer = String(formData.get("answer") ?? "").trim();
  const order = Number(formData.get("order") ?? 0) || 0;

  if (!question || !answer) return;

  await prisma.faq.create({ data: { question, answer, order } });
  revalidatePath("/admin/faq");
  revalidatePath("/faq");
  revalidatePath("/contact");
}

export async function updateFaqAction(formData: FormData) {
  await requireAdmin();

  const id = String(formData.get("id") ?? "");
  const question = String(formData.get("question") ?? "").trim();
  const answer = String(formData.get("answer") ?? "").trim();
  const order = Number(formData.get("order") ?? 0) || 0;

  if (!id || !question || !answer) return;

  await prisma.faq.update({ where: { id }, data: { question, answer, order } });
  revalidatePath("/admin/faq");
  revalidatePath("/faq");
  revalidatePath("/contact");
  redirect("/admin/faq");
}

export async function deleteFaqAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  await prisma.faq.delete({ where: { id } });
  revalidatePath("/admin/faq");
  revalidatePath("/faq");
  revalidatePath("/contact");
}
