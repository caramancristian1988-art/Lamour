"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { Label } from "@/app/components/ui/label";
import { Input } from "@/app/components/ui/input";

interface Spec {
  label: string;
  value: string;
}

const DEFAULT_SPEC_TEMPLATE: Spec[] = [
  { label: "Compoziție / Material", value: "" },
  { label: "Cantitate / Ambalaj", value: "" },
  { label: "Țara de fabricație", value: "" },
  { label: "Garanție", value: "" },
  { label: "Dimensiuni", value: "" },
  { label: "Greutate", value: "" },
];

export default function SpecificationsEditor({
  defaultValue,
  template = DEFAULT_SPEC_TEMPLATE,
  label = "Specificații tehnice (opțional)",
}: {
  defaultValue?: Spec[];
  template?: Spec[];
  label?: string;
}) {
  const [rows, setRows] = useState<Spec[]>(
    defaultValue && defaultValue.length > 0 ? defaultValue : template
  );

  function updateRow(i: number, field: "label" | "value", val: string) {
    setRows((prev) => prev.map((r, idx) => (idx === i ? { ...r, [field]: val } : r)));
  }

  function addRow() {
    setRows((prev) => [...prev, { label: "", value: "" }]);
  }

  function removeRow(i: number) {
    setRows((prev) => prev.filter((_, idx) => idx !== i));
  }

  function resetToTemplate() {
    setRows(template);
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-2">
        <Label>{label}</Label>
        <button
          type="button"
          onClick={resetToTemplate}
          className="text-xs font-bold text-muted-foreground hover:text-accent transition-colors"
        >
          Structură standard
        </button>
      </div>
      <p className="text-sm text-muted-foreground -mt-1">
        Rândurile rămase fără valoare nu se salvează — șterge-le pe cele care nu se aplică acestui produs.
      </p>
      <div className="flex flex-col gap-2">
        {rows.map((row, i) => (
          <div key={i} className="flex items-center gap-2">
            <Input
              name="specLabel"
              value={row.label}
              onChange={(e) => updateRow(i, "label", e.target.value)}
              placeholder="ex: Nivel de zgomot"
              aria-label={`Denumire specificație ${i + 1}`}
              className="flex-1 h-10"
            />
            <Input
              name="specValue"
              value={row.value}
              onChange={(e) => updateRow(i, "value", e.target.value)}
              placeholder="ex: 19 dB"
              aria-label={`Valoare specificație ${i + 1}`}
              className="flex-1 h-10"
            />
            <button
              type="button"
              onClick={() => removeRow(i)}
              aria-label={`Șterge specificația ${row.label || i + 1}`}
              className="shrink-0 text-muted-foreground hover:text-accent transition-colors p-1.5"
            >
              <X className="w-4 h-4" aria-hidden />
            </button>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={addRow}
        className="self-start text-xs font-bold text-accent hover:text-brand-red-dark transition-colors"
      >
        + Adaugă specificație
      </button>
    </div>
  );
}
