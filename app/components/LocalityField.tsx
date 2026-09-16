"use client";

import { useEffect, useRef, useState } from "react";
import { AlertTriangle, Check } from "lucide-react";
import { Input } from "@/app/components/ui/input";
import { matchLocality, suggestLocalities, normalizeLocality } from "@/lib/localityMatch";
import { cn } from "@/lib/utils";

type ValidationState = "idle" | "valid" | "suggest" | "invalid";

interface Props {
  value: string;
  onChange: (value: string) => void;
  onValidityChange?: (valid: boolean) => void;
}

// Câmp de localitate cu autocomplete + corectare typo-uri, verificat contra
// listei oficiale de localități EVS Express (lib/moldovaLocalities.ts) —
// nu doar Chișinău, orice localitate din Moldova. Trei stări posibile după
// ce operatorul termină de scris: recunoscută direct, aproape recunoscută
// (sugestii "ai vrut să spui...") sau nerecunoscută (blochează trimiterea,
// vezi validarea din CheckoutPanel).
export default function LocalityField({ value, onChange, onValidityChange }: Props) {
  const [open, setOpen] = useState(false);
  const [liveSuggestions, setLiveSuggestions] = useState<string[]>([]);
  const [state, setState] = useState<ValidationState>("idle");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  function reportValidity(next: ValidationState) {
    setState(next);
    onValidityChange?.(next === "valid" || next === "idle");
  }

  function handleChange(next: string) {
    onChange(next);
    setState("idle");
    onValidityChange?.(true); // nu blocăm până nu termină de scris (blur)
    setLiveSuggestions(next.trim() ? suggestLocalities(next) : []);
    setOpen(Boolean(next.trim()));
  }

  function pick(name: string) {
    onChange(name);
    setOpen(false);
    setLiveSuggestions([]);
    reportValidity("valid");
  }

  function handleBlur() {
    // Puțină întârziere ca un click pe o sugestie din dropdown să apuce să
    // se înregistreze înainte ca dropdown-ul să dispară la blur.
    window.setTimeout(() => {
      setOpen(false);
      const trimmed = value.trim();
      if (!trimmed) {
        reportValidity("idle");
        return;
      }
      const { exact, suggestions: near } = matchLocality(trimmed);
      if (exact) {
        if (normalizeLocality(exact) !== normalizeLocality(trimmed)) onChange(exact);
        reportValidity("valid");
      } else if (near.length > 0) {
        setSuggestions(near);
        reportValidity("suggest");
      } else {
        setSuggestions([]);
        reportValidity("invalid");
      }
    }, 150);
  }

  return (
    <div ref={ref} className="relative flex flex-col gap-1.5">
      <div className="relative">
        <Input
          type="text"
          name="locality"
          required
          placeholder="Localitate"
          aria-label="Localitate"
          autoComplete="off"
          value={value}
          onChange={(e) => handleChange(e.target.value)}
          onFocus={() => value.trim() && setOpen(liveSuggestions.length > 0)}
          onBlur={handleBlur}
          className={cn(
            state === "valid" && "border-success focus-visible:border-success",
            state === "invalid" && "border-destructive focus-visible:border-destructive"
          )}
        />
        {state === "valid" && (
          <Check className="w-4 h-4 text-success absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" aria-hidden />
        )}

        {open && liveSuggestions.length > 0 && (
          <div
            role="listbox"
            className="absolute left-0 right-0 top-full mt-1 bg-card border border-border rounded-xl shadow-xl py-1.5 z-20 max-h-56 overflow-y-auto"
          >
            {liveSuggestions.map((name) => (
              <button
                key={name}
                type="button"
                role="option"
                aria-selected={normalizeLocality(name) === normalizeLocality(value)}
                // onMouseDown (nu onClick) ca să apuce înaintea blur-ului de pe input.
                onMouseDown={(e) => {
                  e.preventDefault();
                  pick(name);
                }}
                className="w-full text-left text-sm px-3.5 py-2 hover:bg-muted transition-colors text-foreground"
              >
                {name}
              </button>
            ))}
          </div>
        )}
      </div>

      {state === "suggest" && (
        <p className="text-xs text-accent flex items-start gap-1.5">
          <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" aria-hidden />
          <span>
            Localitate nerecunoscută. Ai vrut să spui:{" "}
            {suggestions.map((name, i) => (
              <span key={name}>
                <button type="button" className="underline font-bold hover:no-underline" onClick={() => pick(name)}>
                  {name}
                </button>
                {i < suggestions.length - 1 ? ", " : "?"}
              </span>
            ))}
          </span>
        </p>
      )}

      {state === "invalid" && (
        <p className="text-xs text-destructive flex items-center gap-1.5">
          <AlertTriangle className="w-3.5 h-3.5 shrink-0" aria-hidden />
          Nu am găsit această localitate în Moldova. Verifică scrierea sau alege din listă.
        </p>
      )}
    </div>
  );
}
