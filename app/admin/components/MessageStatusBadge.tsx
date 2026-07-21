"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { setMessageStatusAction } from "@/lib/adminMessageActions";
import { MESSAGE_STATUSES } from "@/lib/messageStatuses";
import { cn } from "@/lib/utils";

const STATUS_STYLES: Record<string, { badge: string; dot: string }> = {
  in_asteptare: { badge: "bg-amber-50 text-amber-700 border-amber-200", dot: "bg-amber-400" },
  sunat: { badge: "bg-blue-50 text-blue-700 border-blue-200", dot: "bg-blue-400" },
  nu_raspunde: { badge: "bg-orange-50 text-orange-700 border-orange-200", dot: "bg-orange-400" },
  se_gandeste: { badge: "bg-yellow-50 text-yellow-700 border-yellow-200", dot: "bg-yellow-400" },
  programat: { badge: "bg-indigo-50 text-indigo-700 border-indigo-200", dot: "bg-indigo-400" },
  in_lucru: { badge: "bg-sky-50 text-sky-700 border-sky-200", dot: "bg-sky-400" },
  achitat: { badge: "bg-teal-50 text-teal-700 border-teal-200", dot: "bg-teal-400" },
  anulat: { badge: "bg-muted text-muted-foreground border-border", dot: "bg-muted-foreground" },
};

export default function MessageStatusBadge({
  id,
  status,
  onChange,
}: {
  id: string;
  status: string;
  onChange?: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const current = MESSAGE_STATUSES.find((s) => s.value === status) ?? MESSAGE_STATUSES[0];
  const styles = STATUS_STYLES[current.value] ?? STATUS_STYLES.in_asteptare;

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  function handleSelect(value: string) {
    setOpen(false);
    if (value === current.value) return;
    // Optimistic: reflect the change instantly, persist in the background.
    onChange?.(value);
    const formData = new FormData();
    formData.set("id", id);
    formData.set("status", value);
    setMessageStatusAction(formData);
  }

  return (
    <div ref={ref} className="relative">
      <button
        key={current.value}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`Stare cerere: ${current.label}. Schimbă starea`}
        className={cn(
          "animate-pop inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-bold uppercase tracking-wide transition-all active:scale-95",
          styles.badge
        )}
      >
        <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", styles.dot)} aria-hidden />
        {current.label}
        <ChevronDown className={cn("w-3.5 h-3.5 transition-transform", open && "rotate-180")} aria-hidden />
      </button>

      <div
        role="listbox"
        className={cn(
          "absolute left-0 top-full mt-1.5 bg-card border border-border rounded-xl shadow-xl py-1.5 w-[180px] max-w-[calc(100vw-2.5rem)] z-10 origin-top-left transition-all duration-150",
          open ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none"
        )}
      >
        {MESSAGE_STATUSES.map((s) => (
          <button
            key={s.value}
            type="button"
            role="option"
            aria-selected={s.value === current.value}
            onClick={() => handleSelect(s.value)}
            className={cn(
              "w-full text-left text-sm font-semibold px-3 py-2 hover:bg-muted transition-colors flex items-center gap-2",
              s.value === current.value ? "text-primary" : "text-foreground"
            )}
          >
            <span className={cn("w-2 h-2 rounded-full shrink-0", STATUS_STYLES[s.value].dot)} aria-hidden />
            {s.label}
          </button>
        ))}
      </div>
    </div>
  );
}
