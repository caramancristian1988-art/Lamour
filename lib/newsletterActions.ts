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
  const offerBadge = String(formData.get("offerBadge") ?? "").trim();
  const subscriberIds = String(formData.get("subscriberIds") ?? "")
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean);
  const productIds = String(formData.get("productIds") ?? "")
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean);

  if (!subject || !message) {
    return { error: "Completează subiectul și mesajul." };
  }
  if (subscriberIds.length === 0) {
    return { error: "Selectează cel puțin un abonat." };
  }

  const subscribers = await prisma.newsletterSubscriber.findMany({
    where: { id: { in: subscriberIds } },
    select: { email: true },
  });
  if (subscribers.length === 0) {
    return { error: "Nu există niciun abonat selectat." };
  }

  const products = productIds.length
    ? await prisma.product.findMany({
        where: { id: { in: productIds } },
        select: { id: true, name: true, slug: true, price: true, oldPrice: true, image: true },
      })
    : [];

  const siteUrl = process.env.SITE_URL || "https://lamour-zeta.vercel.app";

  const ctaLink =
    products.length === 1
      ? `${siteUrl}/produse/${products[0].slug}`
      : products.length > 1
        ? `${siteUrl}/produse?oferte=1`
        : `${siteUrl}/produse`;
  const ctaLabel = products.length === 1 ? "Vezi produsul" : products.length > 1 ? "Vezi ofertele" : "Vezi produsele";

  const productsHtml = products.length
    ? products
        .map(
          (p) => `
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:14px;border:1px solid #E9D0CE;border-radius:14px;background:#ffffff">
          <tr>
            <td style="width:56px;padding:12px 0 12px 12px;vertical-align:middle">
              <a href="${siteUrl}/produse/${p.slug}" style="text-decoration:none">
                ${
                  p.image
                    ? `<img src="${p.image}" alt="${escapeHtml(p.name)}" width="56" height="56" style="display:block;border-radius:10px;object-fit:contain;background:#EFEDEB" />`
                    : ""
                }
              </a>
            </td>
            <td style="padding:12px;vertical-align:middle">
              <a href="${siteUrl}/produse/${p.slug}" style="text-decoration:none">
                ${offerBadge ? `<span style="display:inline-block;margin-bottom:5px;background:#710808;color:#ffffff;font-weight:bold;font-size:10px;letter-spacing:0.3px;padding:3px 9px;border-radius:999px">${escapeHtml(offerBadge)}</span><br/>` : ""}
                <span style="display:block;color:#652F37;font-weight:bold;font-size:14px;font-family:Georgia,'Times New Roman',serif">${escapeHtml(p.name)}</span>
                <span style="display:block;margin-top:4px;color:#710808;font-weight:bold;font-size:14px">
                  ${p.price.toLocaleString("ro-MD")} MDL
                  ${p.oldPrice ? `<span style="color:#9D5654;font-weight:normal;text-decoration:line-through;margin-left:6px">${p.oldPrice.toLocaleString("ro-MD")} MDL</span>` : ""}
                </span>
              </a>
            </td>
          </tr>
        </table>`
        )
        .join("")
    : "";

  const html = `
<!doctype html>
<html lang="ro">
  <body style="margin:0;padding:0;background:#EFEDEB">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#EFEDEB;padding:32px 16px">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:20px;overflow:hidden;border:1px solid #D8B2B1">
            <tr>
              <td style="background:#710808;padding:26px 32px;text-align:center">
                <span style="display:block;color:#ffffff;font-size:26px;font-style:italic;font-weight:bold;font-family:Georgia,'Times New Roman',serif">L&rsquo;amour</span>
                <span style="display:block;margin-top:2px;color:#E9D0CE;font-size:11px;letter-spacing:3px;text-transform:uppercase">Cu Dragoste</span>
              </td>
            </tr>
            <tr>
              <td style="padding:32px">
                <h1 style="margin:0 0 14px;color:#710808;font-size:21px;font-family:Georgia,'Times New Roman',serif">${escapeHtml(subject)}</h1>
                <div style="color:#652F37;font-size:15px;line-height:1.7;white-space:pre-wrap">${escapeHtml(message)}</div>
                ${productsHtml}
                <table role="presentation" cellpadding="0" cellspacing="0" style="margin:28px auto 0">
                  <tr>
                    <td style="background:#9D5654;border-radius:999px">
                      <a href="${ctaLink}" style="display:inline-block;padding:14px 34px;color:#ffffff;font-weight:bold;font-size:13px;text-decoration:none;letter-spacing:0.5px;text-transform:uppercase">${ctaLabel}</a>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="background:#F8F2F1;padding:18px 32px;text-align:center;border-top:1px solid #E9D0CE">
                <span style="color:#9D5654;font-size:12px">${SITE_NAME}</span>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;

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
