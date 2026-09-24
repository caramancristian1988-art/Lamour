"use client";

import { useState } from "react";
import { Truck, XCircle } from "lucide-react";
import { setOrderStageAction } from "@/lib/adminMessageActions";
import { ORDER_STAGES, type OrderStage } from "@/lib/orderStages";
import { Button } from "@/app/components/ui/button";
import { cn } from "@/lib/utils";

const STAGE_STYLES: Record<string, { badge: string; dot: string }> = {
  noua: { badge: "bg-amber-50 text-amber-700 border-amber-200", dot: "bg-amber-400" },
  confirmata: { badge: "bg-indigo-50 text-indigo-700 border-indigo-200", dot: "bg-indigo-400" },
  predata_curier: { badge: "bg-teal-50 text-teal-700 border-teal-200", dot: "bg-teal-400" },
  anulata: { badge: "bg-muted text-muted-foreground border-border", dot: "bg-muted-foreground" },
};

// Spre deosebire de MessageStatusBadge (dropdown liber între orice status),
// fluxul comenzilor e strict secvențial — arătăm doar eticheta etapei
// curente și, dacă are sens, un singur buton spre etapa următoare (aceleași
// tranziții ca butoanele din Telegram, prin advanceOrderStage).
export default function OrderStageBadge({
  id,
  stage,
  onChange,
}: {
  id: string;
  stage: string | null;
  onChange?: (value: string) => void;
}) {
  const [pending, setPending] = useState<OrderStage | null>(null);
  const [error, setError] = useState<string | null>(null);
  const current = ORDER_STAGES.find((s) => s.value === stage) ?? ORDER_STAGES[0];
  const styles = STAGE_STYLES[current.value] ?? STAGE_STYLES.noua;

  function advance(next: OrderStage) {
    if (next === "anulata" && !confirm("Sigur anulezi această comandă?")) return;
    if (
      next === "predata_curier" &&
      !confirm("Marchezi comanda gata de ridicare? Curierul EVS va fi anunțat să vină să o ia.")
    ) {
      return;
    }
    const previous = current.value;
    setPending(next);
    setError(null);
    onChange?.(next);
    const formData = new FormData();
    formData.set("id", id);
    formData.set("stage", next);
    setOrderStageAction(formData)
      .then((result) => {
        // Refuzat (ex. EVS a respins ridicarea): revenim la etapa de dinainte și arătăm motivul.
        if (!result.ok) {
          onChange?.(previous);
          setError(result.error ?? "Etapa nu a putut fi schimbată.");
        }
      })
      .catch(() => {
        onChange?.(previous);
        setError("Etapa nu a putut fi schimbată. Încearcă din nou.");
      })
      .finally(() => setPending(null));
  }

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-bold uppercase tracking-wide",
          styles.badge
        )}
      >
        <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", styles.dot)} aria-hidden />
        {current.label}
      </span>

      {current.value === "noua" && (
        <>
          <Button variant="outline" size="sm" disabled={pending !== null} onClick={() => advance("confirmata")}>
            ✅ Confirmă
          </Button>
          <Button variant="outline" size="sm" disabled={pending !== null} onClick={() => advance("predata_curier")}>
            <Truck className="w-3.5 h-3.5" aria-hidden />
            Gata de ridicare
          </Button>
          <Button variant="ghost" size="sm" disabled={pending !== null} onClick={() => advance("anulata")}>
            <XCircle className="w-3.5 h-3.5" aria-hidden />
            Anulează
          </Button>
        </>
      )}

      {current.value === "confirmata" && (
        <>
          <Button variant="outline" size="sm" disabled={pending !== null} onClick={() => advance("predata_curier")}>
            <Truck className="w-3.5 h-3.5" aria-hidden />
            Gata de ridicare
          </Button>
          <Button variant="ghost" size="sm" disabled={pending !== null} onClick={() => advance("anulata")}>
            <XCircle className="w-3.5 h-3.5" aria-hidden />
            Anulează
          </Button>
        </>
      )}

      {error && (
        <p className="basis-full text-xs text-destructive" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
