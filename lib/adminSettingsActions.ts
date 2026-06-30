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
