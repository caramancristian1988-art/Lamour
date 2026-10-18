"use client";

import { Accessibility, Contrast, Link2, MousePointer2, PauseCircle, RotateCcw, Space, Type } from "lucide-react";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "./ui/sheet";
import { Switch } from "./ui/switch";
import { useAccessibility } from "./AccessibilityProvider";
import { TEXT_LEVELS, type A11yToggleKey } from "@/lib/a11y";
import { cn } from "@/lib/utils";

const TEXT_OPTIONS = [
  { label: "Normal", sample: "text-[14px]" },
  { label: "Mare", sample: "text-[19px]" },
  { label: "Foarte mare", sample: "text-[25px]" },
  { label: "Maxim", sample: "text-[31px]" },
] as const;

const TOGGLES: { key: A11yToggleKey; title: string; hint: string; icon: typeof Contrast }[] = [
  { key: "contrast", title: "Contrast ridicat", hint: "Text mai închis și margini mai vizibile", icon: Contrast },
  { key: "links", title: "Subliniază linkurile", hint: "Linkurile din text se văd dintr-o privire", icon: Link2 },
  { key: "font", title: "Font ușor de citit", hint: "Literă simplă, fără decorațiuni (util și la dislexie)", icon: Type },
  { key: "spacing", title: "Spațiere mai mare", hint: "Mai mult aer între litere, cuvinte și rânduri", icon: Space },
  { key: "motion", title: "Oprește animațiile", hint: "Fără frunze căzătoare, tranziții sau derulări automate", icon: PauseCircle },
  { key: "cursor", title: "Cursor mare", hint: "Săgeată mărită, mai ușor de urmărit pe ecran", icon: MousePointer2 },
];

export default function AccessibilityToggle({ className, labelClassName }: { className?: string; labelClassName?: string }) {
  const { settings, active, update, reset } = useAccessibility();

  return (
    <Sheet>
      <SheetTrigger asChild>
        <button
          type="button"
          aria-label={active ? "Accesibilitate: setări active, deschide panoul" : "Accesibilitate: deschide panoul de setări"}
          className={cn(
            "relative flex h-12 items-center justify-center gap-2 whitespace-nowrap rounded-xl px-3 text-sm transition-colors",
            active ? "bg-primary text-white hover:bg-brand-maroon-dark" : "text-foreground hover:bg-muted hover:text-primary",
            className
          )}
        >
          <Accessibility className="h-6 w-6 shrink-0" aria-hidden />
          <span className={cn("font-semibold", labelClassName)}>Accesibilitate</span>
          {active && <span aria-hidden className="absolute right-1.5 top-1.5 h-2.5 w-2.5 rounded-full bg-amber-300 ring-2 ring-primary" />}
        </button>
      </SheetTrigger>

      <SheetContent
        side="right"
        closeLabel="Închide setările de accesibilitate"
        overlayClassName="bg-black/20"
        className="max-w-md gap-0 overflow-y-auto p-0"
        closeClassName="right-3 top-3 bg-muted p-2.5"
      >
        <SheetHeader className="border-b border-border px-5 pb-4 pt-5">
          <SheetTitle className="flex items-center gap-2 text-xl">
            <Accessibility className="h-6 w-6 text-primary" aria-hidden />
            Accesibilitate
          </SheetTitle>
          <SheetDescription>Schimbările se văd imediat și rămân salvate pe acest dispozitiv.</SheetDescription>
        </SheetHeader>

        <div className="flex flex-col gap-6 px-5 py-5">
          <section aria-labelledby="a11y-text-title">
            <h3 id="a11y-text-title" className="mb-2 font-sans text-sm font-bold uppercase tracking-wide text-primary">
              Mărimea textului
            </h3>
            <div className="grid grid-cols-4 gap-2">
              {TEXT_OPTIONS.slice(0, TEXT_LEVELS).map((o, i) => (
                <button
                  key={o.label}
                  type="button"
                  aria-pressed={settings.text === i}
                  onClick={() => update({ text: i })}
                  className={cn(
                    "flex min-h-[4.25rem] flex-col items-center justify-center gap-0.5 rounded-xl border-2 px-1 py-2 transition-colors",
                    settings.text === i ? "border-primary bg-primary text-white" : "border-border bg-card text-foreground hover:border-primary/60 hover:bg-muted"
                  )}
                >
                  <span aria-hidden className={cn("font-bold leading-none", o.sample)}>
                    A
                  </span>
                  <span className="text-[11px] font-semibold leading-tight">{o.label}</span>
                </button>
              ))}
            </div>
          </section>

          <section aria-labelledby="a11y-view-title">
            <h3 id="a11y-view-title" className="mb-1 font-sans text-sm font-bold uppercase tracking-wide text-primary">
              Afișare și citire
            </h3>
            <ul className="divide-y divide-border">
              {TOGGLES.map(({ key, title, hint, icon: Icon }) => (
                <li key={key} className="flex items-center gap-3 py-3">
                  <Icon className="h-5 w-5 shrink-0 text-primary" aria-hidden />
                  <label htmlFor={`a11y-${key}`} className="min-w-0 flex-1 cursor-pointer">
                    <span className="block text-[15px] font-bold leading-snug text-foreground">{title}</span>
                    <span className="block text-xs leading-snug text-muted-foreground">{hint}</span>
                  </label>
                  <Switch className="data-[state=unchecked]:bg-[#8a8d8e]" id={`a11y-${key}`} checked={settings[key]} onCheckedChange={(v) => update({ [key]: v })} />
                </li>
              ))}
            </ul>
          </section>

          <button
            type="button"
            onClick={reset}
            disabled={!active}
            className="flex h-12 items-center justify-center gap-2 rounded-xl border-2 border-border text-sm font-bold text-foreground transition-colors hover:border-primary hover:text-primary disabled:opacity-50"
          >
            <RotateCcw className="h-4 w-4" aria-hidden />
            Resetează toate setările
          </button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
