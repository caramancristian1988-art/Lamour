"use client";

import { Accessibility } from "lucide-react";
import { useAccessibility } from "./AccessibilityProvider";
import { cn } from "@/lib/utils";

export default function AccessibilityToggle({ className }: { className?: string }) {
  const { enabled, toggle } = useAccessibility();

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={enabled}
      aria-label="Comută modul de accesibilitate (text mărit și contrast crescut)"
      className={cn(
        "flex items-center gap-2 px-3 h-11 rounded-xl text-sm transition-colors whitespace-nowrap",
        enabled ? "bg-primary text-white" : "text-foreground hover:bg-muted hover:text-primary",
        className
      )}
    >
      <Accessibility className="w-5 h-5 shrink-0" aria-hidden />
      <span className="font-semibold">Accesibilitate</span>
    </button>
  );
}
