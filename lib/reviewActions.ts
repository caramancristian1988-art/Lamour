"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "./prisma";

export interface ReviewFormState {
  error?: string;
  success?: boolean;
}

export async function submitReviewAction(_prevState: ReviewFormState, formData: FormData): Promise<ReviewFormState> {
  const productSlug = String(formData.get("productSlug") ?? "").trim();
  const productName = String(formData.get("productName") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const rating = Number(formData.get("rating") ?? 0);
  const pros = String(formData.get("pros") ?? "").trim();
  const cons = String(formData.get("cons") ?? "").trim();
  const text = String(formData.get("text") ?? "").trim();

  if (!productSlug || !productName) {
    return { error: "Produsul nu a putut fi identificat." };
  }
  if (!name) {
    return { error: "Completează numele și prenumele." };
  }
  if (!rating || rating < 1 || rating > 5) {
    return { error: "Selectează un rating de la 1 la 5 stele." };
  }
  if (email && (!email.includes("@") || !email.includes("."))) {
    return { error: "Adresa de email nu este validă." };
  }
  if (!text) {
    return { error: "Scrie un comentariu." };
  }

  try {
    await prisma.review.create({
      data: {
        name,
        email: email || null,
        rating,
        text,
        pros: pros || null,
        cons: cons || null,
        product: productName,
        approved: false,
      },
    });

    revalidatePath("/admin/recenzii");
  } catch {
    return { error: "Nu am putut salva recenzia. Încearcă din nou." };
  }

  return { success: true };
}
