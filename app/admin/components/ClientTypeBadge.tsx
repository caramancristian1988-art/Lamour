"use client";

import { useEffect, useRef, useState } from "react";
import { setClientTypeAction } from "@/lib/adminMessageActions";
import { CLIENT_TYPES } from "@/lib/clientTypes";

export default function ClientTypeBadge({ id, clientType }: { id: string; clientType: string | null }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const current = CLIENT_TYPES.find((c) => c.value === clientType) ?? null;

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  async function handleSelect(value: string) {
    setOpen(false);
    if (value === current?.value) return;
    const formData = new FormData();
    formData.set("id", id);
    formData.set("clientType", value);
    await setClientTypeAction(formData);
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="text-xs font-bold px-3 py-1.5 rounded-full border transition-all active:scale-95 flex items-center gap-1.5 bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100"
      >
        {current ? (
          <>
            <span>{current.emoji}</span>
            {current.label}
          </>
        ) : (
          "Tip client"
        )}
        <svg className={`w-3 h-3 transition-transform ${open ? "rotate-180" : ""}`} fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      <div
        className={`absolute right-0 top-full mt-1.5 bg-white border border-gray-100 rounded-xl shadow-xl py-1.5 min-w-[170px] z-10 origin-top-right transition-all duration-150 ${
          open ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none"
        }`}
      >
        {CLIENT_TYPES.map((c) => (
          <button
            key={c.value}
            type="button"
            onClick={() => handleSelect(c.value)}
            className={`w-full text-left text-xs font-semibold px-3 py-2 hover:bg-gray-50 transition-colors flex items-center gap-2 ${
              c.value === current?.value ? "text-[#1d2353]" : "text-gray-600"
            }`}
          >
            <span>{c.emoji}</span>
            {c.label}
          </button>
        ))}
      </div>
    </div>
  );
}
