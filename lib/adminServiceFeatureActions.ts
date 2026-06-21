"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "./prisma";
import { requireAdmin } from "./adminAuth";

async function revalidateServiceHref(serviceId: string) {
  const service = await prisma.service.findUnique({ where: { id: serviceId } });
  if (service?.href) revalidatePath(service.href);
}

export async function createServiceFeatureAction(formData: FormData) {
  await requireAdmin();

  const serviceId = String(formData.get("serviceId") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const icon = String(formData.get("icon") ?? "award").trim() || "award";
  const order = Number(formData.get("order") ?? 0);

  if (!serviceId || !title || !description) return;

  await prisma.serviceFeature.create({ data: { serviceId, title, description, icon, order } });
  await revalidateServiceHref(serviceId);
  revalidatePath(`/admin/servicii/${serviceId}`);
  redirect(`/admin/servicii/${serviceId}`);
}

export async function updateServiceFeatureAction(formData: FormData) {
  await requireAdmin();

  const id = String(formData.get("id") ?? "");
  const serviceId = String(formData.get("serviceId") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const icon = String(formData.get("icon") ?? "award").trim() || "award";
  const order = Number(formData.get("order") ?? 0);

  if (!id || !serviceId || !title || !description) return;

  await prisma.serviceFeature.update({ where: { id }, data: { title, description, icon, order } });
  await revalidateServiceHref(serviceId);
  revalidatePath(`/admin/servicii/${serviceId}`);
  redirect(`/admin/servicii/${serviceId}`);
}

export async function deleteServiceFeatureAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const feature = await prisma.serviceFeature.delete({ where: { id } });
  await revalidateServiceHref(feature.serviceId);
  revalidatePath(`/admin/servicii/${feature.serviceId}`);
}
