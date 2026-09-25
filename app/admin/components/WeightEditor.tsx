"use client";

import { useState } from "react";
import { Scale, Check, X } from "lucide-react";
import { updateProductWeightAction } from "@/lib/adminProductActions";
import { Button } from "@/app/components/ui/button";
import { formatKg } from "@/lib/orderWeight";

// Greutatea unei bucăți (kg), editabilă direct din lista de produse — sunt sute de produse de completat, iar greutatea
// comenzii (pentru AWB) se calculează din ea. Fără greutate, produsul se socotește la 1 kg/buc.
export default function WeightEditor({ id, weightKg }: { id: string; weightKg: number | null }) {
  const [saved, setSaved] = useState<number | null>(weightKg);
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(weightKg != null ? String(weightKg).replace(".", ",") : "");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function save() {
    setPending(true);
    setError(null);
    const formData = new FormData();
    formData.set("id", id);
    formData.set("weightKg", value.trim());
    updateProductWeightAction(formData)
      .then((result) => {
        if (!result.ok) {
          setError(result.error ?? "Nu am putut salva greutatea.");
          return;
        }
        setSaved(result.weightKg);
        setEditing(false);
      })
      .catch(() => setError("Nu am putut salva greutatea."))
      .finally(() => setPending(false));
  }

  if (editing) {
    return (
      <span className="inline-flex flex-col gap-0.5">
        <form
          className="inline-flex items-center gap-1"
          onSubmit={(e) => {
            e.preventDefault();
            save();
          }}
        >
          <input
            autoFocus
            inputMode="decimal"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            disabled={pending}
            placeholder="kg, ex. 0,35"
            aria-label="Greutate în kg"
            className="h-7 w-24 rounded-lg border border-border bg-card px-2 text-xs font-bold text-primary outline-none focus-visible:border-accent"
          />
          <Button type="submit" variant="ghost" size="icon" className="w-6 h-6" disabled={pending} aria-label="Salvează greutatea">
            <Check className="w-3.5 h-3.5" aria-hidden />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="w-6 h-6"
            disabled={pending}
            onClick={() => {
              setValue(saved != null ? String(saved).replace(".", ",") : "");
              setError(null);
              setEditing(false);
            }}
            aria-label="Renunță"
          >
            <X className="w-3.5 h-3.5" aria-hidden />
          </Button>
        </form>
        {error && <span className="text-[11px] text-destructive" role="alert">{error}</span>}
      </span>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setEditing(true)}
      title="Editează greutatea (kg / bucată)"
      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-bold transition-colors hover:border-accent hover:text-accent ${
        saved != null ? "border-border text-muted-foreground" : "border-amber-300 bg-amber-50 text-amber-700"
      }`}
    >
      <Scale className="w-3 h-3" aria-hidden />
      {saved != null ? formatKg(saved) : "Fără greutate"}
    </button>
  );
}
