"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { prisma } from "./prisma";
import { createSession, destroySession } from "./auth";
import { requireAdmin } from "./adminAuth";

export interface AuthFormState {
  error?: string;
  success?: boolean;
}

export async function registerAction(_prevState: AuthFormState, formData: FormData): Promise<AuthFormState> {
  await requireAdmin();

  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const isAdmin = formData.get("isAdmin") === "on";

  if (!name || !email || !password) {
    return { error: "Completează toate câmpurile." };
  }
  if (!email.includes("@") || !email.includes(".")) {
    return { error: "Adresa de email nu este validă." };
  }
  if (password.length < 6) {
    return { error: "Parola trebuie să aibă cel puțin 6 caractere." };
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { error: "Există deja un cont cu acest email." };
  }

  const hashed = await bcrypt.hash(password, 10);
  await prisma.user.create({ data: { name, email, password: hashed, isAdmin } });

  // Creating an account for someone else shouldn't switch the admin's own session.
  return { success: true };
}

export async function loginAction(_prevState: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Completează toate câmpurile." };
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return { error: "Email sau parolă incorectă." };
  }

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    return { error: "Email sau parolă incorectă." };
  }

  await createSession(user.id);
  redirect("/cont");
}

export async function logoutAction() {
  await destroySession();
  redirect("/");
}
