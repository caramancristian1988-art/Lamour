"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { cn } from "@/lib/utils";

export default function CopyableId({ id, label, className }: { id: string; label?: string; className?: string }) {
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
      aria-label={copied ? "ID copiat" : `Copiază ID-ul ${id}`}
      className={cn(
        className ??
          "inline-flex items-center gap-1.5 font-mono text-xs text-muted-foreground hover:text-accent transition-colors shrink-0"
      )}
    >
      <span className="truncate">ID: {label ?? id}</span>
      {copied ? (
        <Check className="w-3.5 h-3.5 text-success shrink-0" aria-hidden />
      ) : (
        <Copy className="w-3.5 h-3.5 shrink-0" aria-hidden />
      )}
    </button>
  );
}
