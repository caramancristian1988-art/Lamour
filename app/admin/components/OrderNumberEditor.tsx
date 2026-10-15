"use client";

import { useState } from "react";
import { Pencil, Check, X } from "lucide-react";
import { updateOrderNumberAction } from "@/lib/adminMessageActions";
import { Button } from "@/app/components/ui/button";

// Numărul de comandă (#42) e alocat automat la creare, dar editabil liber —
// un operator poate să-l suprascrie ca să corespundă altui sistem de evidență.
export default function OrderNumberEditor({
  id,
  orderNumber,
  onChange,
}: {
  id: string;
  orderNumber: string | null;
  onChange?: (value: string | null) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(orderNumber ?? "");
  const [pending, setPending] = useState(false);

  function save() {
    const next = value.trim();
    setPending(true);
    const formData = new FormData();
    formData.set("id", id);
    formData.set("orderNumber", next);
    updateOrderNumberAction(formData).finally(() => {
      setPending(false);
      setEditing(false);
      onChange?.(next || null);
    });
  }

  if (editing) {
    return (
      <form
        className="inline-flex items-center gap-1"
        onSubmit={(e) => { e.preventDefault(); save(); }}
      >
        <input
          autoFocus
          value={value}
          onChange={(e) => setValue(e.target.value)}
          disabled={pending}
          placeholder="Nr. comandă"
          className="h-7 w-24 rounded-lg border border-border bg-card px-2 text-xs font-bold text-primary outline-none focus-visible:border-accent"
        />
        <Button type="submit" variant="ghost" size="icon" className="w-6 h-6" disabled={pending} aria-label="Salvează">
          <Check className="w-3.5 h-3.5" aria-hidden />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="w-6 h-6"
          disabled={pending}
          onClick={() => { setValue(orderNumber ?? ""); setEditing(false); }}
          aria-label="Anulează"
        >
          <X className="w-3.5 h-3.5" aria-hidden />
        </Button>
      </form>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setEditing(true)}
      className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:text-accent transition-colors"
    >
      {orderNumber ? `#${orderNumber}` : "Fără număr"}
      <Pencil className="w-3 h-3 opacity-50" aria-hidden />
    </button>
  );
}
