"use client";

import { useState } from "react";

export default function CopyableId({ id, className }: { id: string; className?: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(id);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard API unavailable — nothing we can do
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      title="Copiază ID"
      className={
        className ??
        "inline-flex items-center gap-1.5 font-mono text-[10px] text-gray-400 hover:text-[#c7092b] transition-colors shrink-0"
      }
    >
      <span className="truncate">ID: {id}</span>
      {copied ? (
        <svg className="w-3 h-3 text-emerald-500 shrink-0" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      ) : (
        <svg className="w-3 h-3 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      )}
    </button>
  );
}
