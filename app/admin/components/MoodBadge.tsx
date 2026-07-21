"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { setMoodAction } from "@/lib/adminMessageActions";
import { MOODS } from "@/lib/moods";
import { cn } from "@/lib/utils";

export default function MoodBadge({
  id,
  mood,
  onChange,
}: {
  id: string;
  mood: string | null;
  onChange?: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const current = MOODS.find((m) => m.value === mood) ?? null;

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  function handleSelect(value: string) {
    setOpen(false);
    if (value === current?.value) return;
    // Optimistic: reflect the change instantly, persist in the background.
    onChange?.(value);
    const formData = new FormData();
    formData.set("id", id);
    formData.set("mood", value);
    setMoodAction(formData);
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={current ? `Reacție client: ${current.label}. Schimbă reacția` : "Alege o reacție a clientului"}
        className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-bold uppercase tracking-wide bg-muted text-muted-foreground transition-all active:scale-95 hover:bg-muted/70"
      >
        {current ? (
          <>
            <span aria-hidden>{current.emoji}</span>
            {current.label}
          </>
        ) : (
          "Reacție"
        )}
        <ChevronDown className={cn("w-3.5 h-3.5 transition-transform", open && "rotate-180")} aria-hidden />
      </button>

      <div
        role="listbox"
        className={cn(
          "absolute left-0 top-full mt-1.5 bg-card border border-border rounded-xl shadow-xl py-1.5 w-[180px] max-w-[calc(100vw-2.5rem)] z-10 origin-top-left transition-all duration-150",
          open ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none"
        )}
      >
        {MOODS.map((m) => (
          <button
            key={m.value}
            type="button"
            role="option"
            aria-selected={m.value === current?.value}
            onClick={() => handleSelect(m.value)}
            className={cn(
              "w-full text-left text-sm font-semibold px-3 py-2 hover:bg-muted transition-colors flex items-center gap-2",
              m.value === current?.value ? "text-primary" : "text-foreground"
            )}
          >
            <span aria-hidden>{m.emoji}</span>
            {m.label}
          </button>
        ))}
      </div>
    </div>
  );
}
