"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { cn } from "@/lib/utils";

export default function CopyableId({
  id,
  label,
  copyValue,
  prefix = "ID",
  className,
}: {
  id: string;
  label?: string;
  copyValue?: string;
  prefix?: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);

  async function handleCopy(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(copyValue ?? id);
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
      title={`Copiază ${prefix}`}
      aria-label={copied ? `${prefix} copiat` : `Copiază ${prefix.toLowerCase()}-ul ${copyValue ?? id}`}
      className={cn(
        className ??
          "inline-flex items-center gap-1.5 font-mono text-xs text-muted-foreground hover:text-accent transition-colors shrink-0"
      )}
    >
      <span className="truncate">{prefix}: {label ?? id}</span>
      {copied ? (
        <Check className="w-3.5 h-3.5 text-success shrink-0" aria-hidden />
      ) : (
        <Copy className="w-3.5 h-3.5 shrink-0" aria-hidden />
      )}
    </button>
  );
}
