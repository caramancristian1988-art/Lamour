"use client";

import { useActionState, useState } from "react";
import { CheckCircle2, XCircle, Truck } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import {
  validateShipmentAction,
  createRealShipmentAction,
  refreshShipmentStatusAction,
  type ShipmentActionState,
} from "@/lib/adminShipmentActions";

const inputClass =
  "w-full border-2 border-input rounded-lg px-3 py-2 text-sm bg-card text-foreground focus-visible:outline-none focus-visible:border-accent focus-visible:ring-3 focus-visible:ring-accent/20";

interface Props {
  messageId: string;
  defaultName: string;
  defaultPhone: string;
  defaultEmail: string | null;
  defaultAddress: string;
  awbCode: string | null;
  awbStatus: string | null;
}

const EMPTY_STATE: ShipmentActionState = {};

export default function EvsShipmentPanel({
  messageId,
  defaultName,
  defaultPhone,
  defaultEmail,
  defaultAddress,
  awbCode,
  awbStatus,
}: Props) {
  const [open, setOpen] = useState(false);
  const [validateState, validateAction, validatePending] = useActionState(validateShipmentAction, EMPTY_STATE);
  const [createState, createAction, createPending] = useActionState(createRealShipmentAction, EMPTY_STATE);
  const [statusState, statusAction, statusPending] = useActionState(refreshShipmentStatusAction, EMPTY_STATE);

  if (awbCode) {
    return (
      <div className="mt-3 border border-border rounded-xl p-3 bg-muted flex items-center gap-3 flex-wrap">
        <Truck className="w-4 h-4 text-accent shrink-0" aria-hidden />
        <div className="min-w-0">
          <p className="text-xs font-bold text-primary">AWB: {awbCode}</p>
          <p className="text-[11px] text-muted-foreground">
            Status: {statusState.description ?? awbStatus ?? "necunoscut"}
          </p>
        </div>
        <div className="ml-auto flex items-center gap-2 flex-wrap">
          {/* Eticheta AWB (PDF cu cod de bare) — se lipește pe colet. A4 = fișă completă, 100×100 = imprimantă termică. */}
          <Button asChild variant="outline" size="sm">
            <a href={`/api/admin/awb-label?id=${messageId}&size=A4`} target="_blank" rel="noopener noreferrer">
              Etichetă A4
            </a>
          </Button>
          <Button asChild variant="outline" size="sm">
            <a href={`/api/admin/awb-label?id=${messageId}&size=100x100`} target="_blank" rel="noopener noreferrer">
              Etichetă 100×100
            </a>
          </Button>
          <form action={statusAction}>
            <input type="hidden" name="messageId" value={messageId} />
            <input type="hidden" name="awb" value={awbCode} />
            <Button type="submit" variant="outline" size="sm" disabled={statusPending}>
              {statusPending ? "Verific..." : "Verifică status"}
            </Button>
          </form>
        </div>
      </div>
    );
  }

  if (!open) {
    return (
      <Button variant="outline" size="sm" className="mt-3" onClick={() => setOpen(true)}>
        <Truck className="w-3.5 h-3.5" aria-hidden />
        Generează livrare EVS Express
      </Button>
    );
  }

  const lastResult = createState.description ? createState : validateState;

  return (
    <form className="mt-3 border border-border rounded-xl p-3.5 bg-muted flex flex-col gap-2.5">
      <input type="hidden" name="messageId" value={messageId} />
      <p className="text-xs font-extrabold uppercase tracking-wide text-primary">Livrare EVS Express</p>

      <div className="grid grid-cols-2 gap-2">
        <input className={inputClass} name="name" defaultValue={defaultName} placeholder="Nume destinatar" required />
        <input className={inputClass} name="phone" defaultValue={defaultPhone} placeholder="Telefon" required />
      </div>
      <input className={inputClass} name="email" defaultValue={defaultEmail ?? ""} placeholder="Email (opțional)" type="email" />
      <input className={inputClass} name="line1" defaultValue={defaultAddress} placeholder="Adresă (stradă, nr., localitate, raion)" required />
      <div className="grid grid-cols-3 gap-2">
        <input className={inputClass} name="line2" placeholder="Bloc / apartament" />
        <input className={inputClass} name="zip" placeholder="Cod poștal (ZIP)" required />
        <input className={inputClass} name="weight" type="number" min="0.1" step="0.1" defaultValue="1" placeholder="Greutate (kg)" required />
      </div>
      <input className={inputClass} name="codAmount" type="number" min="0" step="0.01" defaultValue="0" placeholder="Ramburs la livrare (MDL, 0 = fără)" />

      {lastResult.description && (
        <div
          className={`flex items-start gap-2 text-xs rounded-lg px-3 py-2 ${
            lastResult.ok ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"
          }`}
        >
          {lastResult.ok ? (
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" aria-hidden />
          ) : (
            <XCircle className="w-4 h-4 shrink-0 mt-0.5" aria-hidden />
          )}
          <span>
            {lastResult.description}
            {lastResult.awb ? ` (AWB: ${lastResult.awb})` : ""}
          </span>
        </div>
      )}

      <div className="flex items-center gap-2 flex-wrap">
        <Button type="submit" formAction={validateAction} variant="outline" size="sm" disabled={validatePending}>
          {validatePending ? "Verific..." : "Verifică datele"}
        </Button>
        <Button
          type="submit"
          formAction={createAction}
          variant="accent"
          size="sm"
          disabled={createPending}
          onClick={(e) => {
            if (!confirm("Se creează o livrare REALĂ la EVS Express, cu costuri reale. Continui?")) {
              e.preventDefault();
            }
          }}
        >
          {createPending ? "Se creează..." : "Creează livrarea (AWB real)"}
        </Button>
        <Button type="button" variant="ghost" size="sm" className="ml-auto" onClick={() => setOpen(false)}>
          Anulează
        </Button>
      </div>
    </form>
  );
}
