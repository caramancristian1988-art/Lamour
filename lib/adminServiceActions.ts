"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "./prisma";
import { requireAdmin } from "./adminAuth";

export async function createServiceAction(formData: FormData) {
  await requireAdmin();

  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const image = String(formData.get("image") ?? "").trim() || null;
  const detailImage = String(formData.get("detailImage") ?? "").trim() || null;
  const heroImageDesktop = String(formData.get("heroImageDesktop") ?? "").trim() || null;
  const href = String(formData.get("href") ?? "").trim() || null;
  const section = String(formData.get("section") ?? "principale").trim();

  if (!title || !description) return;

  await prisma.service.create({ data: { title, description, image, detailImage, heroImageDesktop, href, section } });
  revalidatePath("/admin/servicii");
  revalidatePath("/servicii");
  if (href) revalidatePath(href);
  redirect("/admin/servicii");
}

export async function updateServiceAction(formData: FormData) {
  await requireAdmin();

  const id = String(formData.get("id") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const image = String(formData.get("image") ?? "").trim() || null;
  const detailImage = String(formData.get("detailImage") ?? "").trim() || null;
  const heroImageDesktop = String(formData.get("heroImageDesktop") ?? "").trim() || null;
  const href = String(formData.get("href") ?? "").trim() || null;
  const section = String(formData.get("section") ?? "principale").trim();

  if (!id || !title || !description) return;

  const before = await prisma.service.findUnique({ where: { id }, select: { href: true } });
  await prisma.service.update({ where: { id }, data: { title, description, image, detailImage, heroImageDesktop, href, section } });
  revalidatePath("/admin/servicii");
  revalidatePath("/servicii");
  if (href) revalidatePath(href);
  if (before?.href && before.href !== href) revalidatePath(before.href);
  redirect("/admin/servicii");
}

export async function deleteServiceAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  const service = await prisma.service.findUnique({ where: { id }, select: { href: true } });
  await prisma.service.delete({ where: { id } });
  revalidatePath("/admin/servicii");
  revalidatePath("/servicii");
  if (service?.href) revalidatePath(service.href);
}
