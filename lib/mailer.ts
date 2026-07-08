import nodemailer from "nodemailer";

interface SendMailInput {
  to?: string;
  bcc?: string[];
  subject: string;
  html: string;
}

function getTransporter() {
  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD;
  if (!user || !pass) return null;

  return nodemailer.createTransport({
    service: "gmail",
    auth: { user, pass },
  });
}

/** Sends an email via Gmail SMTP. Returns false (without throwing) if Gmail isn't configured. */
export async function sendMail({ to, bcc, subject, html }: SendMailInput): Promise<boolean> {
  const transporter = getTransporter();
  if (!transporter) return false;

  await transporter.sendMail({
    from: process.env.GMAIL_USER,
    to,
    bcc,
    subject,
    html,
  });
  return true;
}
