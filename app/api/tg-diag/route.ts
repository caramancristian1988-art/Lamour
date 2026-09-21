import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

async function tg(token: string, method: string, body: Record<string, unknown> = {}) {
  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/${method}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    return await res.json();
  } catch (e) {
    return { fetchError: String(e) };
  }
}

// Diagnostic temporar: rulează cu variabilele REALE de pe Vercel și întoarce răspunsurile Telegram.
export async function GET() {
  const user = await getSession();
  if (!user || !user.isAdmin) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const token = process.env.TELEGRAM_BOT_TOKEN ?? "";
  const chatId = process.env.TELEGRAM_CHAT_ID ?? "";
  const out: Record<string, unknown> = {
    tokenPresent: token.length > 0,
    tokenLength: token.length,
    tokenLooksValid: /^\d+:[\w-]{30,}$/.test(token),
    chatId,
    webhookSecretPresent: Boolean(process.env.TELEGRAM_WEBHOOK_SECRET),
    siteUrl: process.env.SITE_URL ?? process.env.NEXT_PUBLIC_SITE_URL ?? null,
  };
  if (!token) return NextResponse.json(out);

  out.getMe = await tg(token, "getMe");
  out.getWebhookInfo = await tg(token, "getWebhookInfo");
  if (chatId) {
    out.getChat = await tg(token, "getChat", { chat_id: chatId });
    out.sendMessage = await tg(token, "sendMessage", {
      chat_id: chatId,
      text: "🔧 Test diagnostic Telegram (Claude) — dacă vezi acest mesaj, botul poate scrie aici.",
    });
  }
  return NextResponse.json(out);
}
