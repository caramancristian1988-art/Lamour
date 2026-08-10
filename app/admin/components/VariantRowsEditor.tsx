"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { Label } from "@/app/components/ui/label";
import { Input } from "@/app/components/ui/input";

interface VariantRow {
  qty: string;
  unit: string;
  price: string;
  oldPrice: string;
}

const EMPTY_ROW: VariantRow = { qty: "", unit: "", price: "", oldPrice: "" };

export default function VariantRowsEditor({ unitOptions }: { unitOptions: string[] }) {
  const [rows, setRows] = useState<VariantRow[]>([]);

  function updateRow(i: number, field: keyof VariantRow, val: string) {
    setRows((prev) => prev.map((r, idx) => (idx === i ? { ...r, [field]: val } : r)));
  }

  function addRow() {
    // Most products only vary by quantity within the same unit (1 L, 2 L, 5
    // L...), so a new row starts with whatever unit was last picked instead
    // of making the admin reselect it every time.
    setRows((prev) => [...prev, { ...EMPTY_ROW, unit: prev[prev.length - 1]?.unit ?? "" }]);
  }

  function removeRow(i: number) {
    setRows((prev) => prev.filter((_, idx) => idx !== i));
  }

  return (
    <div className="flex flex-col gap-2">
      <Label>Variante suplimentare (opțional)</Label>
      <p className="text-sm text-muted-foreground -mt-1">
        Dacă acest produs are și alte mărimi/cantități, le adaugi direct aici — se creează automat
        ca produse separate, legate de acesta, fără să mai revii după salvare.
      </p>

      {rows.length > 0 && (
        <div className="flex flex-col gap-2">
          {rows.map((row, i) => (
            <div key={i} className="flex items-end gap-2 flex-wrap border border-border rounded-xl p-3">
              <div className="flex flex-col gap-1">
                <Label htmlFor={`variant-row-qty-${i}`} className="text-xs">Număr</Label>
                <Input
                  id={`variant-row-qty-${i}`}
                  name="variantRowQty"
                  value={row.qty}
                  onChange={(e) => updateRow(i, "qty", e.target.value)}
                  placeholder="ex: 2"
                  aria-label={`Cantitate variantă ${i + 1}`}
                  className="h-10 w-20"
                />
              </div>
              <div className="flex flex-col gap-1">
                <Label htmlFor={`variant-row-unit-${i}`} className="text-xs">Unitate</Label>
                <select
                  id={`variant-row-unit-${i}`}
                  name="variantRowUnit"
                  value={row.unit}
                  onChange={(e) => updateRow(i, "unit", e.target.value)}
                  aria-label={`Unitate variantă ${i + 1}`}
                  className="h-10 rounded-xl border-2 border-input bg-card px-3 text-sm text-foreground transition-colors focus-visible:outline-none focus-visible:border-accent focus-visible:ring-3 focus-visible:ring-accent/20"
                >
                  <option value="">—</option>
                  {unitOptions.map((u) => (
                    <option key={u} value={u}>{u}</option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <Label htmlFor={`variant-row-price-${i}`} className="text-xs">Preț (MDL)</Label>
                <Input
                  id={`variant-row-price-${i}`}
                  name="variantRowPrice"
                  type="number"
                  value={row.price}
                  onChange={(e) => updateRow(i, "price", e.target.value)}
                  placeholder="ex: 199"
                  aria-label={`Preț variantă ${i + 1}`}
                  className="h-10 w-28"
                />
              </div>
              <div className="flex flex-col gap-1">
                <Label htmlFor={`variant-row-oldprice-${i}`} className="text-xs">Preț vechi</Label>
                <Input
                  id={`variant-row-oldprice-${i}`}
                  name="variantRowOldPrice"
                  type="number"
                  value={row.oldPrice}
                  onChange={(e) => updateRow(i, "oldPrice", e.target.value)}
                  placeholder="opțional"
                  aria-label={`Preț vechi variantă ${i + 1}`}
                  className="h-10 w-28"
                />
              </div>
              <button
                type="button"
                onClick={() => removeRow(i)}
                aria-label={`Șterge varianta ${i + 1}`}
                className="shrink-0 text-muted-foreground hover:text-accent transition-colors p-2 mb-0.5"
              >
                <X className="w-4 h-4" aria-hidden />
              </button>
            </div>
          ))}
        </div>
      )}

      <button
        type="button"
        onClick={addRow}
        className="self-start text-xs font-bold text-accent hover:text-brand-red-dark transition-colors"
      >
        + Adaugă variantă
      </button>
    </div>
  );
}
