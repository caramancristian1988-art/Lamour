import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { MESSAGE_STATUSES } from "@/lib/messageStatuses";
import { CLIENT_TYPES } from "@/lib/clientTypes";
import { MOODS } from "@/lib/moods";
import { editTelegramMessage, answerCallbackQuery, buildContactMessageText, buildMessageButtons } from "@/lib/telegram";

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
  const [prefix, id, value] = data.split(":");

  const isStatus = prefix === "status" && MESSAGE_STATUSES.some((s) => s.value === value);
  const isClientType = prefix === "client" && CLIENT_TYPES.some((c) => c.value === value);
  const isMood = prefix === "mood" && MOODS.some((m) => m.value === value);

  if (!id || (!isStatus && !isClientType && !isMood)) {
    await answerCallbackQuery(callbackQuery.id, "Acțiune necunoscută.");
    return NextResponse.json({ ok: true });
  }

  try {
    const updated = isStatus
      ? await prisma.contactMessage.update({ where: { id }, data: { status: value, read: true } })
      : isClientType
      ? await prisma.contactMessage.update({ where: { id }, data: { clientType: value } })
      : await prisma.contactMessage.update({ where: { id }, data: { mood: value } });

    const statusLabel = MESSAGE_STATUSES.find((s) => s.value === updated.status)?.label ?? updated.status;
    const clientTypeLabel = CLIENT_TYPES.find((c) => c.value === updated.clientType)?.label ?? null;
    const moodLabel = MOODS.find((m) => m.value === updated.mood)?.label ?? null;
    const text = buildContactMessageText({
      name: updated.name,
      phone: updated.phone,
      email: updated.email,
      message: updated.message,
      source: updated.source,
      statusLabel,
      clientTypeLabel,
      moodLabel,
    });

    if (updated.telegramMessageId) {
      await editTelegramMessage(updated.telegramMessageId, text, buildMessageButtons(updated.id));
    }
    const confirmText = isStatus ? `Status: ${statusLabel}` : isClientType ? `Tip client: ${clientTypeLabel}` : `Reacție: ${moodLabel}`;
    await answerCallbackQuery(callbackQuery.id, confirmText);
    revalidatePath("/admin/mesaje");
  } catch {
    await answerCallbackQuery(callbackQuery.id, "Mesajul nu mai există.");
  }

  return NextResponse.json({ ok: true });
}
