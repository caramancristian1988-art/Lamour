"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "./prisma";
import { requireAdmin } from "./adminAuth";

const HEX_COLOR_RE = /^#[0-9a-fA-F]{6}$/;

function parseHexColor(value: FormDataEntryValue | null): string | null {
  const trimmed = String(value ?? "").trim();
  return HEX_COLOR_RE.test(trimmed) ? trimmed : null;
}

export async function updateSettingsAction(formData: FormData) {
  await requireAdmin();

  const data = {
    produseEnabled: formData.get("produseEnabled") === "on",
    despreEnabled: formData.get("despreEnabled") === "on",
    blogEnabled: formData.get("blogEnabled") === "on",
    contactEnabled: formData.get("contactEnabled") === "on",
    ratesEnabled: formData.get("ratesEnabled") === "on",
    installmentMonths: Math.max(1, Math.min(60, Number(formData.get("installmentMonths")) || 4)),
    popupCountdownMinutes: Math.max(1, Math.min(120, Number(formData.get("popupCountdownMinutes")) || 10)),
    popupButtonColor:
      formData.get("popupColorsEnabled") === "on" ? parseHexColor(formData.get("popupButtonColor")) : null,
    popupBannerColor:
      formData.get("popupColorsEnabled") === "on" ? parseHexColor(formData.get("popupBannerColor")) : null,
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
  redirect("/admin/setari?salvat=1");
}
