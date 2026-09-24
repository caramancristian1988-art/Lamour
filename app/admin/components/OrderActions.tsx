"use client";

import { useState } from "react";
import { Pencil, Receipt, Check } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { sendInvoiceAction } from "@/lib/adminMessageActions";

// Acțiunile pe care operatorul le are în Telegram și care lipseau din admin: "✏️ Editează" și "🧾 Trimite factura".
// (Confirmă / Gata de ridicare / Anulează sunt în OrderStageBadge, etichetele AWB în EvsShipmentPanel.)
export default function OrderActions({
  id,
  stage,
  message,
  editToken,
  invoiceSentAt,
  onInvoiceSent,
}: {
  id: string;
  stage: string | null;
  message: string | null;
  editToken: string | null;
  invoiceSentAt: Date | string | null;
  onInvoiceSent?: () => void;
}) {
  const [pending, setPending] = useState(false);
  const [feedback, setFeedback] = useState<{ ok: boolean; text: string } | null>(null);
  const [sent, setSent] = useState(Boolean(invoiceSentAt));

  const needsInvoice = Boolean(message?.includes("🧾 CERE FACTURĂ"));
  const isActive = stage === "noua" || stage === "confirmata" || stage === "predata_curier";
  // Linkul de editare funcționează doar cât comanda e nouă (după confirmare, token-ul nu mai e valid).
  const canEdit = stage === "noua" && Boolean(editToken);

  if (!canEdit && !(needsInvoice && isActive)) return null;

  function sendInvoice() {
    setPending(true);
    setFeedback(null);
    const formData = new FormData();
    formData.set("id", id);
    sendInvoiceAction(formData)
      .then((result) => {
        setFeedback({ ok: result.ok, text: result.message });
        if (result.ok) {
          setSent(true);
          onInvoiceSent?.();
        }
      })
      .catch(() => setFeedback({ ok: false, text: "Nu am putut trimite factura. Încearcă din nou." }))
      .finally(() => setPending(false));
  }

  return (
    <div className="flex items-center gap-2 flex-wrap mt-2">
      {canEdit && (
        <Button asChild variant="outline" size="sm">
          <a href={`/editare-comanda?token=${editToken}`} target="_blank" rel="noopener noreferrer">
            <Pencil className="w-3.5 h-3.5" aria-hidden />
            Editează comanda
          </a>
        </Button>
      )}

      {needsInvoice && isActive &&
        (sent ? (
          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-muted-foreground border border-border rounded-full px-3 py-1.5">
            <Check className="w-3.5 h-3.5 text-accent" aria-hidden />
            Factură trimisă contabilului
          </span>
        ) : (
          <Button variant="outline" size="sm" onClick={sendInvoice} disabled={pending}>
            <Receipt className="w-3.5 h-3.5" aria-hidden />
            {pending ? "Se trimite..." : "Trimite factura"}
          </Button>
        ))}

      {feedback && (
        <p className={`basis-full text-xs ${feedback.ok ? "text-muted-foreground" : "text-destructive"}`} role={feedback.ok ? "status" : "alert"}>
          {feedback.text}
        </p>
      )}
    </div>
  );
}
