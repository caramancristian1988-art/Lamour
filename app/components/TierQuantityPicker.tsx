"use client";

import { useState } from "react";
import { Check, Minus, Plus, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  formatPrice,
  lineTotal,
  nextTier,
  savingsPercent,
  unitPriceFor,
  type PriceTier,
} from "@/lib/pricing";

interface Props {
  price: number;
  /** Praguri deja normalizate (sortate, fără rânduri invalide). */
  tiers: PriceTier[];
  quantity: number;
  onQuantityChange: (quantity: number) => void;
  /** Mai compact, pentru cardurile din listă / ferestre. */
  compact?: boolean;
  /** Treptele și blocurile apar pe rând (urcă și se arată) — pentru fereastra care se deschide de pe card. */
  animate?: boolean;
}

/**
 * Treptele de preț + selectorul de cantitate + totalul live.
 * Folosit atât pe pagina produsului (ProductBuyBox), cât și în fereastra care
 * se deschide de pe cardurile din listă (AddToCartButton), ca ambele să arate
 * și să calculeze identic.
 */
export default function TierQuantityPicker({
  price,
  tiers,
  quantity,
  onQuantityChange,
  compact = false,
  animate = false,
}: Props) {
  const unitPrice = unitPriceFor(price, tiers, quantity);
  const total = lineTotal(price, tiers, quantity);
  const percent = savingsPercent(price, unitPrice);
  const saved = (price - unitPrice) * quantity;
  const upcoming = nextTier(price, tiers, quantity);

  // Ce s-a tastat in campul de cantitate, cat timp e in editare (poate fi si gol).
  const [draft, setDraft] = useState<string | null>(null);

  // Orice schimbare din butoane sau trepte inlocuieste ce era tastat.
  function setQuantity(next: number) {
    setDraft(null);
    onQuantityChange(next);
  }

  // Prețul de listă e prima treaptă, de la 1 bucată.
  const steps = [{ minQty: 1, price }, ...tiers];
  const activeIndex = steps.reduce((best, step, i) => (quantity >= step.minQty ? i : best), 0);

  function stepRange(i: number): string {
    const from = steps[i].minQty;
    const to = steps[i + 1] ? steps[i + 1].minQty - 1 : null;
    if (to === null) return `${from}+ buc.`;
    return from === to ? `${from} buc.` : `${from}–${to} buc.`;
  }

  const stepBtn =
    "flex shrink-0 items-center justify-center rounded-full bg-accent text-accent-foreground shadow-sm transition-all hover:bg-brand-red-dark active:scale-90 disabled:bg-muted disabled:text-muted-foreground/50 disabled:shadow-none";

  return (
    <div className="flex flex-col gap-5">
      {tiers.length > 0 && (
        <div>
          <p className={cn("mb-2.5 text-xs font-extrabold uppercase tracking-widest text-accent", animate && "animate-fade-up")} style={animate ? { animationDelay: "100ms" } : undefined}>
            Cu cât cumperi mai mult, cu atât e mai ieftin
          </p>
          <div className="flex flex-col gap-2" role="group" aria-label="Preț în funcție de cantitate">
            {steps.map((step, i) => {
              const stepPercent = savingsPercent(price, step.price);
              const isActive = i === activeIndex;
              const isBest = i === steps.length - 1 && steps.length > 1;
              return (
                <button
                  key={`${step.minQty}-${step.price}`}
                  type="button"
                  onClick={() => {
                    // Click pe treapta curentă nu scade cantitatea aleasă deja
                    // (ex: 15 buc. rămâne 15, nu sare înapoi la 10).
                    if (i === activeIndex) return;
                    setQuantity(step.minQty);
                  }}
                  aria-pressed={isActive}
                  style={animate ? { animationDelay: `${180 + i * 80}ms` } : undefined}
                  className={cn(
                    "relative flex items-center gap-3 rounded-2xl border-2 text-left transition-all duration-200 hover:-translate-y-px active:scale-[0.99]",
                    animate && "animate-fade-up",
                    compact ? "px-3.5 py-2.5" : "px-4 py-3",
                    isActive
                      ? "border-accent bg-accent/[0.06] shadow-sm"
                      : "border-border bg-card hover:border-accent/50 hover:bg-muted/50"
                  )}
                >
                  {/* „Radio" desenat: cercul se umple cu bifă pe treapta activă */}
                  <span
                    aria-hidden
                    className={cn(
                      "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
                      isActive ? "animate-pop border-accent bg-accent text-accent-foreground" : "border-border bg-card text-transparent"
                    )}
                  >
                    <Check className="h-3.5 w-3.5" strokeWidth={3} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className={cn("block text-sm font-bold", isActive ? "text-primary" : "text-foreground")}>{stepRange(i)}</span>
                    {isBest && (
                      <span className="mt-0.5 block text-[11px] font-bold uppercase tracking-wide text-accent">Cel mai bun preț</span>
                    )}
                  </span>
                  <span className="flex shrink-0 items-center gap-2">
                    {stepPercent > 0 && (
                      <span className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-extrabold text-secondary-foreground">
                        −{stepPercent}%
                      </span>
                    )}
                    <span className="text-right leading-tight">
                      <span className="text-base font-extrabold text-primary">{formatPrice(step.price)}</span>
                      <span className="text-xs font-semibold text-muted-foreground"> MDL/buc</span>
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Cantitate + total */}
      <div
        className={cn("flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-muted/70 p-3.5", animate && "animate-fade-up")}
        style={animate ? { animationDelay: `${200 + steps.length * 80}ms` } : undefined}
      >
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            disabled={quantity <= 1}
            aria-label="Scade cantitatea"
            className={cn(stepBtn, "h-11 w-11")}
          >
            <Minus className="h-5 w-5" aria-hidden />
          </button>
          {/* Câmpul păstrează ce tastezi (`draft`), inclusiv gol, ca să poți șterge
              cifre și scrie un număr mai mic. Cu `value={quantity}` direct, un câmp
              golit devenea instant 1 și nu mai puteai trece de la 100 la 20. */}
          <input
            type="text"
            inputMode="numeric"
            value={draft ?? String(quantity)}
            onChange={(e) => {
              const digits = e.target.value.replace(/\D/g, "");
              setDraft(digits);
              const parsed = Number(digits);
              if (digits !== "" && parsed > 0) onQuantityChange(parsed);
            }}
            onBlur={() => setDraft(null)}
            aria-label="Cantitate"
            data-own-focus
            className="h-11 w-[4.5rem] rounded-xl border-2 border-border bg-card text-center text-base font-extrabold text-primary transition-[border-color,box-shadow] focus-visible:border-accent focus-visible:ring-4 focus-visible:ring-accent/15"
          />
          <button
            type="button"
            onClick={() => setQuantity(quantity + 1)}
            aria-label="Crește cantitatea"
            className={cn(stepBtn, "h-11 w-11")}
          >
            <Plus className="h-5 w-5" aria-hidden />
          </button>
        </div>

        <div className="text-right">
          {/* key = totalul: la fiecare schimbare cifra „sare" puțin, ca să se vadă că s-a recalculat */}
          <span key={total} className="block animate-pop text-2xl font-extrabold leading-tight text-primary" aria-live="polite">
            {formatPrice(total)} MDL
          </span>
          <span className="block text-xs text-muted-foreground">
            {quantity} × {formatPrice(unitPrice)} MDL/buc
          </span>
        </div>
      </div>

      {percent > 0 && (
        <p className={cn("-mt-2 flex animate-fade-up items-center gap-2 rounded-xl bg-success/10 px-3.5 py-2 text-sm font-bold text-success", animate && "[animation-delay:520ms]")}>
          <Sparkles className="h-4 w-4 shrink-0" aria-hidden />
          Economisești {formatPrice(saved)} MDL (−{percent}%)
        </p>
      )}

      {upcoming && (
        <button
          type="button"
          onClick={() => setQuantity(upcoming.tier.minQty)}
          className={cn("group -mt-1 flex animate-fade-up items-center gap-3 rounded-2xl border-2 border-dashed border-brand-rose bg-card px-4 py-3 text-left text-sm text-primary transition-colors hover:border-accent hover:bg-accent/5", animate && "[animation-delay:560ms]")}
        >
          <span aria-hidden className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-secondary text-accent transition-transform duration-300 group-hover:rotate-90 group-hover:scale-110">
            <Plus className="h-5 w-5" />
          </span>
          <span>
            Mai adaugă <b>{upcoming.missingQty} buc.</b> și plătești{" "}
            <b>{formatPrice(upcoming.tier.price)} MDL/bucată</b> <span className="font-bold text-accent">(−{upcoming.percent}%)</span>
          </span>
        </button>
      )}
    </div>
  );
}
