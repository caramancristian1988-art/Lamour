"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "./prisma";
import { requireAdmin } from "./adminAuth";
import { createShipment, getShipmentStatus, type CreateShipmentInput } from "./evsExpress";

export interface ShipmentActionState {
  ok?: boolean;
  description?: string;
  awb?: string | null;
}

function readShipmentInput(formData: FormData): CreateShipmentInput {
  return {
    receiver: {
      name: String(formData.get("name") ?? "").trim(),
      phone: String(formData.get("phone") ?? "").trim(),
      email: String(formData.get("email") ?? "").trim() || undefined,
      line1: String(formData.get("line1") ?? "").trim(),
      line2: String(formData.get("line2") ?? "").trim() || undefined,
      zip: String(formData.get("zip") ?? "").trim(),
      comment: String(formData.get("comment") ?? "").trim() || undefined,
    },
    weight: Math.max(0.1, Number(formData.get("weight")) || 1),
    codAmount: Math.max(0, Number(formData.get("codAmount")) || 0),
  };
}

export async function validateShipmentAction(
  _prevState: ShipmentActionState,
  formData: FormData
): Promise<ShipmentActionState> {
  await requireAdmin();
  const input = readShipmentInput(formData);
  const result = await createShipment(input, { validateOnly: true });
  return { ok: result.ok, description: result.description, awb: result.awb };
}

export async function createRealShipmentAction(
  _prevState: ShipmentActionState,
  formData: FormData
): Promise<ShipmentActionState> {
  await requireAdmin();
  const messageId = String(formData.get("messageId") ?? "");
  const input = readShipmentInput(formData);
  const result = await createShipment(input, { validateOnly: false });

  if (result.ok && result.awb && messageId) {
    await prisma.contactMessage.update({
      where: { id: messageId },
      data: { awbCode: result.awb, awbStatus: null, awbCreatedAt: new Date() },
    });
    revalidatePath("/admin/mesaje");
  }

  return { ok: result.ok, description: result.description, awb: result.awb };
}

export async function refreshShipmentStatusAction(
  _prevState: ShipmentActionState,
  formData: FormData
): Promise<ShipmentActionState> {
  await requireAdmin();
  const messageId = String(formData.get("messageId") ?? "");
  const awb = String(formData.get("awb") ?? "").trim();
  if (!awb) return { ok: false, description: "Lipsește AWB-ul." };

  const result = await getShipmentStatus(awb);
  const entries = Array.isArray(result.raw) ? result.raw : [];
  const lastStatus = entries.length > 0 ? (entries[entries.length - 1]?.Status ?? null) : null;

  if (result.ok && lastStatus && messageId) {
    await prisma.contactMessage.update({ where: { id: messageId }, data: { awbStatus: lastStatus } });
    revalidatePath("/admin/mesaje");
  }

  return { ok: result.ok, description: lastStatus ?? result.description, awb };
}
