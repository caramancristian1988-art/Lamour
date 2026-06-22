"use client";

import { useEffect, useRef, useState } from "react";
import { setMessageStatusAction } from "@/lib/adminMessageActions";
import { MESSAGE_STATUSES } from "@/lib/messageStatuses";

const STATUS_STYLES: Record<string, { badge: string; dot: string }> = {
  in_asteptare: { badge: "bg-amber-50 text-amber-700 border-amber-200", dot: "bg-amber-400" },
  sunat: { badge: "bg-blue-50 text-blue-700 border-blue-200", dot: "bg-blue-400" },
  nu_raspunde: { badge: "bg-orange-50 text-orange-700 border-orange-200", dot: "bg-orange-400" },
  se_gandeste: { badge: "bg-yellow-50 text-yellow-700 border-yellow-200", dot: "bg-yellow-400" },
  programat: { badge: "bg-indigo-50 text-indigo-700 border-indigo-200", dot: "bg-indigo-400" },
  in_lucru: { badge: "bg-sky-50 text-sky-700 border-sky-200", dot: "bg-sky-400" },
  achitat: { badge: "bg-teal-50 text-teal-700 border-teal-200", dot: "bg-teal-400" },
  anulat: { badge: "bg-gray-100 text-gray-500 border-gray-200", dot: "bg-gray-400" },
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
        className={`animate-pop text-xs font-bold px-3 py-1.5 rounded-full border transition-all active:scale-95 flex items-center gap-1.5 ${styles.badge}`}
      >
        <span className={`w-1.5 h-1.5 rounded-full ${styles.dot}`} />
        {current.label}
        <svg className={`w-3 h-3 transition-transform ${open ? "rotate-180" : ""}`} fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      <div
        className={`absolute right-0 top-full mt-1.5 bg-white border border-gray-100 rounded-xl shadow-xl py-1.5 min-w-[170px] z-10 origin-top-right transition-all duration-150 ${
          open ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none"
        }`}
      >
        {MESSAGE_STATUSES.map((s) => (
          <button
            key={s.value}
            type="button"
            onClick={() => handleSelect(s.value)}
            className={`w-full text-left text-xs font-semibold px-3 py-2 hover:bg-gray-50 transition-colors flex items-center gap-2 ${
              s.value === current.value ? "text-[#1d2353]" : "text-gray-600"
            }`}
          >
            <span className={`w-2 h-2 rounded-full shrink-0 ${STATUS_STYLES[s.value].dot}`} />
            {s.label}
          </button>
        ))}
      </div>
    </div>
  );
}
