"use client";

import { useEffect, useRef, useState } from "react";
import { setMoodAction } from "@/lib/adminMessageActions";
import { MOODS } from "@/lib/moods";

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
        className="text-xs font-bold px-3 py-1.5 rounded-full border transition-all active:scale-95 flex items-center gap-1.5 bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100"
      >
        {current ? <span>{current.emoji}</span> : "Reacție"}
        <svg className={`w-3 h-3 transition-transform ${open ? "rotate-180" : ""}`} fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      <div
        className={`absolute right-0 top-full mt-1.5 bg-white border border-gray-100 rounded-xl shadow-xl py-1.5 min-w-[170px] z-10 origin-top-right transition-all duration-150 ${
          open ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none"
        }`}
      >
        {MOODS.map((m) => (
          <button
            key={m.value}
            type="button"
            onClick={() => handleSelect(m.value)}
            className={`w-full text-left text-xs font-semibold px-3 py-2 hover:bg-gray-50 transition-colors flex items-center gap-2 ${
              m.value === current?.value ? "text-[#1d2353]" : "text-gray-600"
            }`}
          >
            <span>{m.emoji}</span>
            {m.label}
          </button>
        ))}
      </div>
    </div>
  );
}
