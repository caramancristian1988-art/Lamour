"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "./prisma";
import { requireAdmin } from "./adminAuth";
import { sendMail } from "./mailer";
import { SITE_NAME } from "./constants";

export interface NewsletterFormState {
  error?: string;
  success?: boolean;
}

export async function subscribeAction(
  _prevState: NewsletterFormState,
  formData: FormData
): Promise<NewsletterFormState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();

  if (!email || !email.includes("@") || !email.includes(".")) {
    return { error: "Adresa de email nu este validă." };
  }

  try {
    await prisma.newsletterSubscriber.create({ data: { email } });
  } catch (err) {
    // P2002 = unique constraint violation — already subscribed, treat as success.
    const isDuplicate = typeof err === "object" && err !== null && "code" in err && err.code === "P2002";
    if (!isDuplicate) {
      return { error: "Nu am putut salva adresa. Încearcă din nou." };
    }
  }

  revalidatePath("/admin/newsletter");
  return { success: true };
}

export interface NewsletterCampaignState {
  error?: string;
  success?: boolean;
  sentCount?: number;
}

export async function sendNewsletterCampaignAction(
  _prevState: NewsletterCampaignState,
  formData: FormData
): Promise<NewsletterCampaignState> {
  await requireAdmin();

  const subject = String(formData.get("subject") ?? "").trim();
  const message = String(formData.get("message") ?? "").trim();

  if (!subject || !message) {
    return { error: "Completează subiectul și mesajul." };
  }

  const subscribers = await prisma.newsletterSubscriber.findMany({ select: { email: true } });
  if (subscribers.length === 0) {
    return { error: "Nu există niciun abonat momentan." };
  }

  const html = `
    <div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:24px">
      <h2 style="color:#6b100f;margin-bottom:16px">${escapeHtml(subject)}</h2>
      <div style="color:#241615;line-height:1.6;white-space:pre-wrap">${escapeHtml(message)}</div>
      <p style="color:#746663;font-size:12px;margin-top:32px">${SITE_NAME}</p>
    </div>
  `;

  const sent = await sendMail({
    bcc: subscribers.map((s) => s.email),
    subject,
    html,
  });

  if (!sent) {
    return { error: "Trimiterea de email-uri nu este configurată (lipsesc GMAIL_USER/GMAIL_APP_PASSWORD)." };
  }

  return { success: true, sentCount: subscribers.length };
}

export async function deleteSubscriberAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  await prisma.newsletterSubscriber.delete({ where: { id } });
  revalidatePath("/admin/newsletter");
}

function escapeHtml(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
