"use client";

import { useState } from "react";
import { Plus, Trash2, X } from "lucide-react";
import { Label } from "@/app/components/ui/label";
import { Input } from "@/app/components/ui/input";
import { Button } from "@/app/components/ui/button";

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
        <Label htmlFor={`managed-select-${name}`}>
          {label} {required && <span className="text-accent">*</span>}
        </Label>
        <div className="flex items-center gap-3 shrink-0">
          {selectedOption && onDelete && (
            <button
              type="button"
              onClick={handleDelete}
              disabled={busy}
              className="text-muted-foreground hover:text-accent disabled:opacity-50 transition-colors"
              aria-label={`Șterge opțiunea ${selectedOption.label}`}
            >
              <Trash2 className="w-3.5 h-3.5" aria-hidden />
            </button>
          )}
          {!adding && (
            <button
              type="button"
              onClick={() => setAdding(true)}
              className="inline-flex items-center gap-1 text-xs font-bold text-accent hover:underline"
            >
              <Plus className="w-3.5 h-3.5" aria-hidden />
              Adaugă
            </button>
          )}
        </div>
      </div>

      <select
        id={`managed-select-${name}`}
        name={name}
        required={required}
        value={selected}
        onChange={(e) => setSelected(e.target.value)}
        className="w-full min-w-0 rounded-xl border-2 border-input bg-card px-4 py-3 text-base text-foreground transition-colors focus-visible:outline-none focus-visible:border-accent focus-visible:ring-3 focus-visible:ring-accent/20"
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
          <Input
            type="text"
            value={newLabel}
            onChange={(e) => setNewLabel(e.target.value)}
            placeholder={addPlaceholder}
            aria-label={addPlaceholder}
            className="min-w-0 flex-1 h-10"
          />
          <div className="flex items-center gap-2 shrink-0">
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={handleAdd}
              disabled={busy || !newLabel.trim()}
              className="flex-1 sm:flex-none"
            >
              {busy ? "Se adaugă..." : "Adaugă"}
            </Button>
            <button
              type="button"
              onClick={() => {
                setAdding(false);
                setNewLabel("");
                setError(null);
              }}
              className="text-muted-foreground hover:text-accent transition-colors shrink-0"
              aria-label="Anulează adăugarea opțiunii"
            >
              <X className="w-4 h-4" aria-hidden />
            </button>
          </div>
        </div>
      )}
      {error && <p className="text-sm text-accent">{error}</p>}
    </div>
  );
}
