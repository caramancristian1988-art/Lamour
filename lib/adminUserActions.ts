"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "./prisma";
import { requireAdmin } from "./adminAuth";

export async function toggleAdminAction(formData: FormData) {
  const me = await requireAdmin();

  const id = String(formData.get("id") ?? "");
  const makeAdmin = formData.get("makeAdmin") === "true";
  if (!id) return;

  // Don't let an admin strip their own admin rights — avoids accidental lockout.
  if (id === me.id && !makeAdmin) return;

  if (!makeAdmin) {
    const target = await prisma.user.findUnique({ where: { id } });
    if (target?.isAdmin) {
      const adminCount = await prisma.user.count({ where: { isAdmin: true } });
      if (adminCount <= 1) return; // keep at least one admin in the system
    }
  }

  await prisma.user.update({ where: { id }, data: { isAdmin: makeAdmin } });
  revalidatePath("/admin/utilizatori");
}

export async function deleteUserAction(formData: FormData) {
  const me = await requireAdmin();

  const id = String(formData.get("id") ?? "");
  if (!id || id === me.id) return; // can't delete your own account

  await prisma.session.deleteMany({ where: { userId: id } });
  await prisma.user.delete({ where: { id } });
  revalidatePath("/admin/utilizatori");
}
