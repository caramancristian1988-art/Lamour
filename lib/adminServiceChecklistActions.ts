"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "./prisma";
import { requireAdmin } from "./adminAuth";

async function revalidateServiceHref(serviceId: string) {
  const service = await prisma.service.findUnique({ where: { id: serviceId } });
  if (service?.href) revalidatePath(service.href);
}

export async function createServiceChecklistItemAction(formData: FormData) {
  await requireAdmin();

  const serviceId = String(formData.get("serviceId") ?? "");
  const text = String(formData.get("text") ?? "").trim();
  const order = Number(formData.get("order") ?? 0);

  if (!serviceId || !text) return;

  await prisma.serviceChecklistItem.create({ data: { serviceId, text, order } });
  await revalidateServiceHref(serviceId);
  revalidatePath(`/admin/servicii/${serviceId}`);
  redirect(`/admin/servicii/${serviceId}`);
}

export async function updateServiceChecklistItemAction(formData: FormData) {
  await requireAdmin();

  const id = String(formData.get("id") ?? "");
  const serviceId = String(formData.get("serviceId") ?? "");
  const text = String(formData.get("text") ?? "").trim();
  const order = Number(formData.get("order") ?? 0);

  if (!id || !serviceId || !text) return;

  await prisma.serviceChecklistItem.update({ where: { id }, data: { text, order } });
  await revalidateServiceHref(serviceId);
  revalidatePath(`/admin/servicii/${serviceId}`);
  redirect(`/admin/servicii/${serviceId}`);
}

export async function deleteServiceChecklistItemAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const item = await prisma.serviceChecklistItem.delete({ where: { id } });
  await revalidateServiceHref(item.serviceId);
  revalidatePath(`/admin/servicii/${item.serviceId}`);
}
