"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "./prisma";
import { requireAdmin } from "./adminAuth";

export async function createBannerAction(formData: FormData) {
  await requireAdmin();

  const image = String(formData.get("image") ?? "").trim();
  const alt = String(formData.get("alt") ?? "").trim();
  const title = String(formData.get("title") ?? "").trim() || null;
  const subtitle = String(formData.get("subtitle") ?? "").trim() || null;
  const ctaLabel = String(formData.get("ctaLabel") ?? "").trim() || null;
  const ctaPosition = String(formData.get("ctaPosition") ?? "").trim() || "stanga";
  const link = String(formData.get("link") ?? "").trim() || null;
  const order = Math.max(0, Number(formData.get("order")) || 0);

  if (!image || !alt) return;

  await prisma.banner.create({ data: { image, alt, title, subtitle, ctaLabel, ctaPosition, link, order } });
  revalidatePath("/admin/bannere");
  revalidatePath("/");
  redirect("/admin/bannere");
}

export async function updateBannerAction(formData: FormData) {
  await requireAdmin();

  const id = String(formData.get("id") ?? "");
  const image = String(formData.get("image") ?? "").trim();
  const alt = String(formData.get("alt") ?? "").trim();
  const title = String(formData.get("title") ?? "").trim() || null;
  const subtitle = String(formData.get("subtitle") ?? "").trim() || null;
  const ctaLabel = String(formData.get("ctaLabel") ?? "").trim() || null;
  const ctaPosition = String(formData.get("ctaPosition") ?? "").trim() || "stanga";
  const link = String(formData.get("link") ?? "").trim() || null;
  const order = Math.max(0, Number(formData.get("order")) || 0);

  if (!id || !image || !alt) return;

  await prisma.banner.update({ where: { id }, data: { image, alt, title, subtitle, ctaLabel, ctaPosition, link, order } });
  revalidatePath("/admin/bannere");
  revalidatePath("/");
  redirect("/admin/bannere");
}

export async function deleteBannerAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  await prisma.banner.delete({ where: { id } });
  revalidatePath("/admin/bannere");
  revalidatePath("/");
}
