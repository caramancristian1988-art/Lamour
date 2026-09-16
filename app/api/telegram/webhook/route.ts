import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { MESSAGE_STATUSES } from "@/lib/messageStatuses";
import { applySalesCountForStatusChange, maybeCreateEvsShipment, advanceOrderStage } from "@/lib/adminMessageActions";
import { MOODS } from "@/lib/moods";
import {
  editTelegramMessage,
  editTelegramReplyMarkup,
  answerCallbackQuery,
  buildContactMessageText,
  buildMessageButtons,
  buildConfirmButtons,
  buildOrderStageButtons,
  buildOrderCancelConfirmButtons,
  getSiteUrl,
  STATUSES_REQUIRING_CONFIRMATION,
} from "@/lib/telegram";

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

  if (!id) {
    await answerCallbackQuery(callbackQuery.id, "Acțiune necunoscută.");
    return NextResponse.json({ ok: true });
  }

  // Pressing "Achitat" or "Anulat" first asks for confirmation instead of applying immediately.
  if (prefix === "status" && MESSAGE_STATUSES.some((s) => s.value === value) && STATUSES_REQUIRING_CONFIRMATION.includes(value)) {
    try {
      const message = await prisma.contactMessage.findUnique({ where: { id } });
      if (message?.telegramMessageId) {
        await editTelegramReplyMarkup(message.telegramMessageId, buildConfirmButtons(id, value));
      }
      await answerCallbackQuery(callbackQuery.id);
    } catch {
      await answerCallbackQuery(callbackQuery.id, "Mesajul nu mai există.");
    }
    return NextResponse.json({ ok: true });
  }

  if (prefix === "cancel") {
    try {
      const message = await prisma.contactMessage.findUnique({ where: { id } });
      if (message?.telegramMessageId) {
        await editTelegramReplyMarkup(message.telegramMessageId, buildMessageButtons(id));
      }
      await answerCallbackQuery(callbackQuery.id, "Anulat.");
    } catch {
      await answerCallbackQuery(callbackQuery.id, "Mesajul nu mai există.");
    }
    return NextResponse.json({ ok: true });
  }

  // Fluxul separat pentru comenzi din coș (operator -> depozitar -> curier).
  // advanceOrderStage se ocupă și de editarea mesajului din Telegram, deci
  // aici doar apelăm tranziția și răspundem la callback.
  if (prefix === "ord_confirm" || prefix === "ord_ready" || prefix === "ord_cancel_yes") {
    const nextStage = prefix === "ord_confirm" ? "confirmata" : prefix === "ord_ready" ? "predata_curier" : "anulata";
    const confirmText = prefix === "ord_confirm" ? "Comandă confirmată." : prefix === "ord_ready" ? "Predată curierului." : "Comandă anulată.";
    try {
      await advanceOrderStage(id, nextStage);
      await answerCallbackQuery(callbackQuery.id, confirmText);
    } catch {
      await answerCallbackQuery(callbackQuery.id, "Comanda nu mai există.");
    }
    return NextResponse.json({ ok: true });
  }

  if (prefix === "ord_cancel") {
    try {
      const message = await prisma.contactMessage.findUnique({ where: { id } });
      if (message?.telegramMessageId) {
        await editTelegramReplyMarkup(message.telegramMessageId, buildOrderCancelConfirmButtons(id));
      }
      await answerCallbackQuery(callbackQuery.id);
    } catch {
      await answerCallbackQuery(callbackQuery.id, "Comanda nu mai există.");
    }
    return NextResponse.json({ ok: true });
  }

  if (prefix === "ord_cancel_no") {
    try {
      const message = await prisma.contactMessage.findUnique({ where: { id } });
      if (message?.telegramMessageId && message.orderStage) {
        const editUrl = `${getSiteUrl()}/editare-comanda?token=${message.editToken ?? ""}`;
        await editTelegramReplyMarkup(message.telegramMessageId, buildOrderStageButtons(id, message.orderStage, editUrl));
      }
      await answerCallbackQuery(callbackQuery.id, "Renunțat.");
    } catch {
      await answerCallbackQuery(callbackQuery.id, "Comanda nu mai există.");
    }
    return NextResponse.json({ ok: true });
  }

  const isStatus = prefix === "status" && MESSAGE_STATUSES.some((s) => s.value === value);
  const isConfirm = prefix === "confirm" && MESSAGE_STATUSES.some((s) => s.value === value);
  const isMood = prefix === "mood" && MOODS.some((m) => m.value === value);

  if (!isStatus && !isConfirm && !isMood) {
    await answerCallbackQuery(callbackQuery.id, "Acțiune necunoscută.");
    return NextResponse.json({ ok: true });
  }

  try {
    let updated;
    if (isStatus || isConfirm) {
      const previous = await prisma.contactMessage.findUnique({ where: { id }, select: { status: true, productIds: true } });
      updated = await prisma.contactMessage.update({ where: { id }, data: { status: value, read: true } });
      if (previous) await applySalesCountForStatusChange(previous.status, value, previous.productIds);
      if (value === "achitat") await maybeCreateEvsShipment(updated);
    } else {
      updated = await prisma.contactMessage.update({ where: { id }, data: { mood: value } });
    }

    const statusLabel = MESSAGE_STATUSES.find((s) => s.value === updated.status)?.label ?? updated.status;
    const moodLabel = MOODS.find((m) => m.value === updated.mood)?.label ?? null;
    const text = buildContactMessageText({
      name: updated.name,
      phone: updated.phone,
      email: updated.email,
      message: updated.message,
      source: updated.source,
      statusLabel,
      moodLabel,
    });

    if (updated.telegramMessageId) {
      // A confirmed Achitat/Anulat is final — clear all buttons instead of restoring the full set.
      const buttons = isConfirm ? [] : buildMessageButtons(updated.id);
      await editTelegramMessage(updated.telegramMessageId, text, buttons);
    }
    const confirmText = isMood ? `Reacție: ${moodLabel}` : `Status: ${statusLabel}`;
    await answerCallbackQuery(callbackQuery.id, confirmText);
    revalidatePath("/admin/mesaje");
    if (isStatus || isConfirm) {
      revalidatePath("/admin/produse");
      revalidatePath("/produse");
    }
  } catch {
    await answerCallbackQuery(callbackQuery.id, "Mesajul nu mai există.");
  }

  return NextResponse.json({ ok: true });
}
