"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "./prisma";
import { requireAdmin } from "./adminAuth";

async function revalidateServiceHref(serviceId: string) {
  const service = await prisma.service.findUnique({ where: { id: serviceId } });
  if (service?.href) revalidatePath(service.href);
}

export async function createServiceStepAction(formData: FormData) {
  await requireAdmin();

  const serviceId = String(formData.get("serviceId") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const image = String(formData.get("image") ?? "").trim() || null;
  const order = Number(formData.get("order") ?? 0);

  if (!serviceId || !title || !description) return;

  await prisma.serviceStep.create({ data: { serviceId, title, description, image, order } });
  await revalidateServiceHref(serviceId);
  revalidatePath(`/admin/servicii/${serviceId}`);
  redirect(`/admin/servicii/${serviceId}`);
}

export async function updateServiceStepAction(formData: FormData) {
  await requireAdmin();

  const id = String(formData.get("id") ?? "");
  const serviceId = String(formData.get("serviceId") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const image = String(formData.get("image") ?? "").trim() || null;
  const order = Number(formData.get("order") ?? 0);

  if (!id || !serviceId || !title || !description) return;

  await prisma.serviceStep.update({ where: { id }, data: { title, description, image, order } });
  await revalidateServiceHref(serviceId);
  revalidatePath(`/admin/servicii/${serviceId}`);
  redirect(`/admin/servicii/${serviceId}`);
}

export async function deleteServiceStepAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const step = await prisma.serviceStep.delete({ where: { id } });
  await revalidateServiceHref(step.serviceId);
  revalidatePath(`/admin/servicii/${step.serviceId}`);
}
