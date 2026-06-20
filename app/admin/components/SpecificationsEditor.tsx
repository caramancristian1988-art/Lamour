"use client";

import { useState } from "react";

interface Spec {
  label: string;
  value: string;
}

export default function SpecificationsEditor({ defaultValue }: { defaultValue?: Spec[] }) {
  const [rows, setRows] = useState<Spec[]>(
    defaultValue && defaultValue.length > 0 ? defaultValue : [{ label: "", value: "" }]
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

  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-bold text-[#1d2353]">Specificații tehnice (opțional)</label>
      <div className="flex flex-col gap-2">
        {rows.map((row, i) => (
          <div key={i} className="flex items-center gap-2">
            <input
              name="specLabel"
              value={row.label}
              onChange={(e) => updateRow(i, "label", e.target.value)}
              placeholder="ex: Nivel de zgomot"
              className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#c7092b]/20 focus:border-[#c7092b]"
            />
            <input
              name="specValue"
              value={row.value}
              onChange={(e) => updateRow(i, "value", e.target.value)}
              placeholder="ex: 19 dB"
              className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#c7092b]/20 focus:border-[#c7092b]"
            />
            <button
              type="button"
              onClick={() => removeRow(i)}
              aria-label="Șterge specificația"
              className="shrink-0 text-gray-400 hover:text-[#c7092b] transition-colors p-1.5"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={addRow}
        className="self-start text-xs font-bold text-[#c7092b] hover:text-[#a5071f] transition-colors"
      >
        + Adaugă specificație
      </button>
    </div>
  );
}
