import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { MESSAGE_STATUSES } from "@/lib/messageStatuses";
import { applySalesCountForStatusChange, maybeCreateEvsShipment, advanceOrderStage, sendInvoiceToAccountant } from "@/lib/adminMessageActions";
import { MOODS } from "@/lib/moods";
import {
  editTelegramMessage,
  editTelegramReplyMarkup,
  answerCallbackQuery,
  sendTelegramMessage,
  sendTelegramDocument,
  buildContactMessageText,
  buildMessageButtons,
  buildConfirmButtons,
  buildOrderStageButtons,
  buildOrderPrintUrl,
  buildOrderCancelConfirmButtons,
  getSiteUrl,
  extractInvoiceBlock,
  STATUSES_REQUIRING_CONFIRMATION,
} from "@/lib/telegram";
import { linkChatByToken } from "@/lib/telegramRecipients";
import { getAwbLabel } from "@/lib/evsExpress";

// O tranziție de etapă face mai multe apeluri de rețea în serie (EVS + Telegram + bază de date);
// implicitul de 10s al platformei ar putea tăia cererea la mijloc.
export const maxDuration = 30;

export async function POST(request: NextRequest) {
  const secret = request.headers.get("x-telegram-bot-api-secret-token");
  if (secret !== process.env.TELEGRAM_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const update = await request.json().catch(() => null);
  const callbackQuery = update?.callback_query;

  if (!callbackQuery) {
    // "/start <token>" din linkul "Conectează Telegram" (depozitar/contabil) — leagă chatul de cont.
    const text = String(update?.message?.text ?? "");
    const chatId = update?.message?.chat?.id;
    if (text.startsWith("/start ") && chatId !== undefined) {
      try {
        await linkChatByToken(text.slice("/start ".length).trim(), String(chatId));
      } catch (err) {
        console.error("telegram: legarea chatului a eșuat:", err);
      }
    }
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
    const confirmText = prefix === "ord_confirm" ? "Comandă confirmată." : prefix === "ord_ready" ? "Gata de ridicare." : "Comandă anulată.";
    try {
      const after = await advanceOrderStage(id, nextStage);
      // Dacă tranziția a fost refuzată (ex. EVS a respins ridicarea) mesajul de avertizare e deja în grup —
      // nu confirmăm aici o acțiune care nu s-a întâmplat.
      await answerCallbackQuery(
        callbackQuery.id,
        after.orderStage === nextStage ? confirmText : "Nu s-a putut aplica — vezi avertizarea din grup."
      );
    } catch (err) {
      // Orice eroare din tranziție (nu doar "comanda lipsește") ajungea aici mascată.
      console.error(`telegram ${prefix} eșuat pentru ${id}:`, err);
      await answerCallbackQuery(callbackQuery.id, "Comanda nu mai există.");
    }
    return NextResponse.json({ ok: true });
  }

  // Eticheta AWB (PDF cu cod de bare) cerută de depozitar: se trimite în chatul unde a apăsat butonul.
  if (prefix === "ord_label") {
    const chatId = String(callbackQuery.message?.chat?.id ?? "");
    try {
      const order = await prisma.contactMessage.findUnique({ where: { id }, select: { awbCode: true, orderNumber: true } });
      if (!order?.awbCode || !chatId) {
        await answerCallbackQuery(callbackQuery.id, "Comanda nu are încă AWB.");
        return NextResponse.json({ ok: true });
      }
      // Răspundem imediat: descărcarea PDF-ului de la EVS poate dura și butonul ar rămâne "în așteptare".
      await answerCallbackQuery(callbackQuery.id, "Îți trimit eticheta...");
      const size = value === "100" ? "100x100" : "A4";
      const label = await getAwbLabel(order.awbCode, size);
      if (label.ok) {
        const ref = order.orderNumber ? `Comanda #${order.orderNumber}` : "Comanda";
        await sendTelegramDocument(chatId, label.pdf, `AWB-${order.awbCode}-${size}.pdf`, `🏷 ${ref} — AWB ${order.awbCode} (${size})`);
      } else {
        console.error(`evs GetDoc eșuat pentru ${order.awbCode}:`, label.description);
        await sendTelegramMessage(`⚠️ Eticheta AWB ${order.awbCode} nu a putut fi descărcată: ${label.description}`, [], undefined, chatId);
      }
    } catch (err) {
      console.error(`telegram ord_label eșuat pentru ${id}:`, err);
      await answerCallbackQuery(callbackQuery.id, "Nu am putut trimite eticheta.");
    }
    return NextResponse.json({ ok: true });
  }

  if (prefix === "ord_invoice") {
    try {
      const result = await sendInvoiceToAccountant(id);
      await answerCallbackQuery(
        callbackQuery.id,
        result === "sent"
          ? "Factura a fost trimisă."
          : result === "already"
            ? "Factura a fost deja trimisă."
            : result === "failed"
              ? "Nu a ajuns la contabil — vezi avertizarea din grup."
              : "Comanda nu cere factură."
      );
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
        await editTelegramReplyMarkup(message.telegramMessageId, buildOrderStageButtons(id, message.orderStage, editUrl, Boolean(extractInvoiceBlock(message.message)) && !message.invoiceSentAt, buildOrderPrintUrl(id, message.editToken)));
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
