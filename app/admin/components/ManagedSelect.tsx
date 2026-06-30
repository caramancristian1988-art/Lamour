"use client";

import { useState } from "react";

export interface ManagedOption {
  value: string;
  label: string;
}

interface ManagedSelectProps {
  name: string;
  label: string;
  required?: boolean;
  defaultOptions: ManagedOption[];
  defaultValue?: string;
  addPlaceholder: string;
  emptyOptionLabel?: string;
  deleteConfirmText?: string;
  onAdd: (label: string) => Promise<{ option?: ManagedOption; error?: string }>;
  onDelete?: (option: ManagedOption) => Promise<{ error?: string } | void>;
}

export default function ManagedSelect({
  name,
  label,
  required,
  defaultOptions,
  defaultValue,
  addPlaceholder,
  emptyOptionLabel = "—",
  deleteConfirmText = "Sigur vrei să ștergi această opțiune?",
  onAdd,
  onDelete,
}: ManagedSelectProps) {
  const [options, setOptions] = useState(defaultOptions);
  const [selected, setSelected] = useState(defaultValue ?? "");
  const [adding, setAdding] = useState(false);
  const [newLabel, setNewLabel] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedOption = options.find((o) => o.value === selected);

  async function handleAdd() {
    const label = newLabel.trim();
    if (!label) return;

    setBusy(true);
    setError(null);
    const result = await onAdd(label);
    setBusy(false);

    if (result.error || !result.option) {
      setError(result.error ?? "Nu am putut adăuga opțiunea.");
      return;
    }

    setOptions((prev) => [...prev, result.option!]);
    setSelected(result.option.value);
    setNewLabel("");
    setAdding(false);
  }

  async function handleDelete() {
    if (!selectedOption || !onDelete) return;
    if (!confirm(deleteConfirmText)) return;

    setBusy(true);
    setError(null);
    const result = await onDelete(selectedOption);
    setBusy(false);

    if (result?.error) {
      setError(result.error);
      return;
    }

    setOptions((prev) => prev.filter((o) => o.value !== selectedOption.value));
    setSelected("");
  }

  return (
    <div className="flex flex-col gap-1.5 min-w-0">
      <div className="flex items-center justify-between gap-3">
        <span className="text-xs font-bold text-gray-600">
          {label} {required && <span className="text-[#c7092b]">*</span>}
        </span>
        <div className="flex items-center gap-3 shrink-0">
          {selectedOption && onDelete && (
            <button
              type="button"
              onClick={handleDelete}
              disabled={busy}
              className="text-gray-400 hover:text-[#c7092b] disabled:opacity-50 transition-colors"
              aria-label="Șterge opțiunea selectată"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          )}
          {!adding && (
            <button
              type="button"
              onClick={() => setAdding(true)}
              className="text-xs font-bold text-[#c7092b] hover:underline"
            >
              + Adaugă
            </button>
          )}
        </div>
      </div>

      <select
        name={name}
        required={required}
        value={selected}
        onChange={(e) => setSelected(e.target.value)}
        className="w-full min-w-0 border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#c7092b] bg-white"
      >
        <option value="" disabled={required}>
          {emptyOptionLabel}
        </option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>

      {adding && (
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 mt-1.5">
          <input
            type="text"
            value={newLabel}
            onChange={(e) => setNewLabel(e.target.value)}
            placeholder={addPlaceholder}
            className="min-w-0 flex-1 border border-gray-300 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-[#c7092b]"
          />
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleAdd}
              disabled={busy || !newLabel.trim()}
              className="flex-1 sm:flex-none bg-[#1d2353] hover:bg-[#2a3470] disabled:opacity-60 text-white text-xs font-bold px-4 py-2 rounded-xl transition-colors"
            >
              {busy ? "Se adaugă..." : "Adaugă"}
            </button>
            <button
              type="button"
              onClick={() => {
                setAdding(false);
                setNewLabel("");
                setError(null);
              }}
              className="text-gray-400 hover:text-[#c7092b] transition-colors shrink-0"
              aria-label="Anulează"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}
      {error && <p className="text-xs text-[#c7092b]">{error}</p>}
    </div>
  );
}
