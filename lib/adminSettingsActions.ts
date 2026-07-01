"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "./prisma";
import { requireAdmin } from "./adminAuth";

export async function updateSettingsAction(formData: FormData) {
  await requireAdmin();

  const data = {
    produseEnabled: formData.get("produseEnabled") === "on",
    serviciiEnabled: formData.get("serviciiEnabled") === "on",
    proiecteEnabled: formData.get("proiecteEnabled") === "on",
    despreEnabled: formData.get("despreEnabled") === "on",
    blogEnabled: formData.get("blogEnabled") === "on",
    contactEnabled: formData.get("contactEnabled") === "on",
    ratesEnabled: formData.get("ratesEnabled") === "on",
    installmentMonths: Math.max(1, Math.min(60, Number(formData.get("installmentMonths")) || 4)),
    popupCountdownMinutes: Math.max(1, Math.min(120, Number(formData.get("popupCountdownMinutes")) || 10)),
    facebook: String(formData.get("facebook") ?? "").trim() || null,
    instagram: String(formData.get("instagram") ?? "").trim() || null,
    tiktok: String(formData.get("tiktok") ?? "").trim() || null,
    phone: String(formData.get("phone") ?? "").trim() || null,
    email: String(formData.get("email") ?? "").trim() || null,
    address: String(formData.get("address") ?? "").trim() || null,
  };

  const existing = await prisma.settings.findFirst();
  if (existing) {
    await prisma.settings.update({ where: { id: existing.id }, data });
  } else {
    await prisma.settings.create({ data });
  }

  revalidatePath("/admin/setari");
  revalidatePath("/", "layout");
}
