import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { MESSAGE_STATUSES } from "@/lib/messageStatuses";
import { editTelegramMessage, answerCallbackQuery, buildContactMessageText, buildStatusButtons } from "@/lib/telegram";

export async function POST(request: NextRequest) {
  const secret = request.headers.get("x-telegram-bot-api-secret-token");
  if (secret !== process.env.TELEGRAM_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const update = await request.json().catch(() => null);
  const callbackQuery = update?.callback_query;

  if (!callbackQuery) {
    return NextResponse.json({ ok: true });
  }

  const data = String(callbackQuery.data ?? "");
  const [prefix, id, status] = data.split(":");

  if (prefix !== "status" || !id || !MESSAGE_STATUSES.some((s) => s.value === status)) {
    await answerCallbackQuery(callbackQuery.id, "Acțiune necunoscută.");
    return NextResponse.json({ ok: true });
  }

  try {
    const updated = await prisma.contactMessage.update({ where: { id }, data: { status, read: true } });

    const statusLabel = MESSAGE_STATUSES.find((s) => s.value === status)?.label ?? status;
    const text = buildContactMessageText({
      name: updated.name,
      phone: updated.phone,
      email: updated.email,
      message: updated.message,
      source: updated.source,
      statusLabel,
    });

    if (updated.telegramMessageId) {
      await editTelegramMessage(updated.telegramMessageId, text, buildStatusButtons(updated.id));
    }
    await answerCallbackQuery(callbackQuery.id, `Status: ${statusLabel}`);
    revalidatePath("/admin/mesaje");
  } catch {
    await answerCallbackQuery(callbackQuery.id, "Mesajul nu mai există.");
  }

  return NextResponse.json({ ok: true });
}
