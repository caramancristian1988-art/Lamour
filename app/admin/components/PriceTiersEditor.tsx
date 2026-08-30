"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { Label } from "@/app/components/ui/label";
import { Input } from "@/app/components/ui/input";
import { parseDecimalInput, savingsPercent, type PriceTier } from "@/lib/pricing";

interface Row {
  minQty: string;
  price: string;
}

export default function PriceTiersEditor({
  defaultValue,
  basePrice,
}: {
  defaultValue?: PriceTier[];
  /** Prețul de listă, doar ca să putem arăta procentul de reducere în timp real. */
  basePrice?: number | null;
}) {
  const [rows, setRows] = useState<Row[]>(
    defaultValue && defaultValue.length > 0
      ? defaultValue.map((t) => ({ minQty: String(t.minQty), price: String(t.price) }))
      : []
  );

  function updateRow(i: number, field: keyof Row, val: string) {
    setRows((prev) => prev.map((r, idx) => (idx === i ? { ...r, [field]: val } : r)));
  }

  function addRow() {
    setRows((prev) => [...prev, { minQty: "", price: "" }]);
  }

  function removeRow(i: number) {
    setRows((prev) => prev.filter((_, idx) => idx !== i));
  }

  return (
    <div className="flex flex-col gap-2">
      <Label>Praguri de preț pe cantitate (opțional)</Label>
      <p className="text-sm text-muted-foreground -mt-1">
        Ex: de la <b>10</b> buc. prețul devine <b>25</b> lei/bucată. Se aplică automat în coș, în funcție de câte
        bucăți din acest produs comandă clientul. Rândurile incomplete nu se salvează.
      </p>

      <div className="flex flex-col gap-2">
        {rows.map((row, i) => {
          const qty = Number(row.minQty);
          const price = parseDecimalInput(row.price);
          const percent =
            basePrice && Number.isFinite(price) && price > 0 ? savingsPercent(basePrice, price) : 0;

          return (
            <div key={i} className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground shrink-0">de la</span>
              <Input
                name="tierMinQty"
                type="number"
                min="2"
                step="1"
                value={row.minQty}
                onChange={(e) => updateRow(i, "minQty", e.target.value)}
                placeholder="10"
                aria-label={`Cantitate minimă pentru pragul ${i + 1}`}
                className="w-24 h-10"
              />
              <span className="text-sm text-muted-foreground shrink-0">buc. →</span>
              {/* text + inputMode: un input type="number" refuză virgula, iar
                  prețurile se scriu în română cu virgulă ("20,50"). */}
              <Input
                name="tierPrice"
                inputMode="decimal"
                value={row.price}
                onChange={(e) => updateRow(i, "price", e.target.value)}
                placeholder="20,50"
                aria-label={`Preț per bucată pentru pragul ${i + 1}`}
                className="w-32 h-10"
              />
              <span className="text-sm text-muted-foreground shrink-0">lei/bucată</span>

              <span className="text-xs font-bold text-success w-16 shrink-0">
                {percent > 0 ? `−${percent}%` : ""}
              </span>

              <button
                type="button"
                onClick={() => removeRow(i)}
                aria-label={`Șterge pragul de la ${qty || i + 1} bucăți`}
                className="shrink-0 text-muted-foreground hover:text-accent transition-colors p-1.5 ml-auto"
              >
                <X className="w-4 h-4" aria-hidden />
              </button>
            </div>
          );
        })}
      </div>

      <button
        type="button"
        onClick={addRow}
        className="self-start text-xs font-bold text-accent hover:text-brand-red-dark transition-colors"
      >
        + Adaugă prag de cantitate
      </button>
    </div>
  );
}
