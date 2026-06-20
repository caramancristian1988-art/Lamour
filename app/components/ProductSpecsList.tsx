"use client";

import { useState } from "react";

interface Spec {
  label: string;
  value: string;
}

export default function ProductSpecsList({
  availability,
  inStock,
  generalSpecs,
  extraSpecs,
}: {
  availability: string;
  inStock: boolean;
  generalSpecs: Spec[];
  extraSpecs: Spec[];
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="border border-gray-100 rounded-2xl divide-y divide-gray-100 overflow-hidden -mt-2">
      <div className="flex items-center justify-between px-5 py-3.5 bg-[#f6f8fb]">
        <span className="text-sm font-bold text-[#1d2353]">Disponibilitate</span>
        <span className={`text-sm font-bold flex items-center gap-1.5 ${inStock ? "text-green-600" : "text-gray-400"}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${inStock ? "bg-green-500" : "bg-gray-400"}`} />
          {availability}
        </span>
      </div>
      {generalSpecs.map((spec, i) => (
        <div key={`${spec.label}-${i}`} className={`flex items-center justify-between px-5 py-3.5 ${i % 2 === 1 ? "bg-[#fafbfc]" : ""}`}>
          <span className="text-sm text-gray-500">{spec.label}</span>
          <span className="text-sm font-bold text-[#1d2353] text-right">{spec.value}</span>
        </div>
      ))}

      {expanded && extraSpecs.map((spec, i) => (
        <div key={`${spec.label}-${i}`} className={`flex items-center justify-between px-5 py-3.5 ${(generalSpecs.length + i) % 2 === 1 ? "bg-[#fafbfc]" : ""}`}>
          <span className="text-sm text-gray-500">{spec.label}</span>
          <span className="text-sm font-bold text-[#1d2353] text-right">{spec.value}</span>
        </div>
      ))}

      {extraSpecs.length > 0 && (
        <button
          onClick={() => setExpanded((v) => !v)}
          className="w-full flex items-center justify-center gap-1.5 px-5 py-3 text-sm font-bold text-[#c7092b] hover:bg-[#fdf2f3] transition-colors"
        >
          {expanded ? "Vezi mai puține specificații" : "Vezi mai multe specificații"}
          <svg className={`w-3.5 h-3.5 transition-transform ${expanded ? "rotate-180" : ""}`} fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      )}
    </div>
  );
}
