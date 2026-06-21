"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "./prisma";
import { requireAdmin } from "./adminAuth";

async function revalidateServiceHref(serviceId: string) {
  const service = await prisma.service.findUnique({ where: { id: serviceId } });
  if (service?.href) revalidatePath(service.href);
}

export async function createServiceTestimonialAction(formData: FormData) {
  await requireAdmin();

  const serviceId = String(formData.get("serviceId") ?? "");
  const text = String(formData.get("text") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();
  const city = String(formData.get("city") ?? "").trim();
  const initials = String(formData.get("initials") ?? "").trim();
  const order = Number(formData.get("order") ?? 0);

  if (!serviceId || !text || !name || !city || !initials) return;

  await prisma.serviceTestimonial.create({ data: { serviceId, text, name, city, initials, order } });
  await revalidateServiceHref(serviceId);
  revalidatePath(`/admin/servicii/${serviceId}`);
  redirect(`/admin/servicii/${serviceId}`);
}

export async function updateServiceTestimonialAction(formData: FormData) {
  await requireAdmin();

  const id = String(formData.get("id") ?? "");
  const serviceId = String(formData.get("serviceId") ?? "");
  const text = String(formData.get("text") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();
  const city = String(formData.get("city") ?? "").trim();
  const initials = String(formData.get("initials") ?? "").trim();
  const order = Number(formData.get("order") ?? 0);

  if (!id || !serviceId || !text || !name || !city || !initials) return;

  await prisma.serviceTestimonial.update({ where: { id }, data: { text, name, city, initials, order } });
  await revalidateServiceHref(serviceId);
  revalidatePath(`/admin/servicii/${serviceId}`);
  redirect(`/admin/servicii/${serviceId}`);
}

export async function deleteServiceTestimonialAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const testimonial = await prisma.serviceTestimonial.delete({ where: { id } });
  await revalidateServiceHref(testimonial.serviceId);
  revalidatePath(`/admin/servicii/${testimonial.serviceId}`);
}
