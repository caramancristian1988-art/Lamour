"use client";

import { Minus, Plus } from "lucide-react";
import { Badge } from "@/app/components/ui/badge";
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
}

/**
 * Treptele de preț + selectorul de cantitate + totalul live.
 * Folosit atât pe pagina produsului (ProductBuyBox), cât și în fereastra care
 * se deschide de pe cardurile din listă (TierPickerDialog), ca ambele să arate
 * și să calculeze identic.
 */
export default function TierQuantityPicker({
  price,
  tiers,
  quantity,
  onQuantityChange,
  compact = false,
}: Props) {
  const unitPrice = unitPriceFor(price, tiers, quantity);
  const total = lineTotal(price, tiers, quantity);
  const percent = savingsPercent(price, unitPrice);
  const saved = (price - unitPrice) * quantity;
  const upcoming = nextTier(price, tiers, quantity);

  // Prețul de listă e prima treaptă, de la 1 bucată.
  const steps = [{ minQty: 1, price }, ...tiers];
  const activeIndex = steps.reduce((best, step, i) => (quantity >= step.minQty ? i : best), 0);

  function stepRange(i: number): string {
    const from = steps[i].minQty;
    const to = steps[i + 1] ? steps[i + 1].minQty - 1 : null;
    if (to === null) return `${from}+ buc.`;
    return from === to ? `${from} buc.` : `${from}–${to} buc.`;
  }

  return (
    <div className="flex flex-col gap-4">
      {tiers.length > 0 && (
        <div>
          <p className="text-xs font-extrabold uppercase tracking-wide text-accent mb-2">
            Preț în funcție de cantitate
          </p>
          <div className="flex flex-col gap-1.5">
            {steps.map((step, i) => {
              const stepPercent = savingsPercent(price, step.price);
              const isActive = i === activeIndex;
              return (
                <button
                  key={`${step.minQty}-${step.price}`}
                  type="button"
                  onClick={() => {
                    // Click pe treapta curentă nu scade cantitatea aleasă deja
                    // (ex: 15 buc. rămâne 15, nu sare înapoi la 10).
                    if (i === activeIndex) return;
                    onQuantityChange(step.minQty);
                  }}
                  aria-pressed={isActive}
                  className={cn(
                    "flex items-center justify-between gap-3 rounded-xl border-2 text-left transition-colors",
                    compact ? "px-3 py-2" : "px-4 py-2.5",
                    isActive ? "border-accent bg-accent/5" : "border-border bg-card hover:border-primary/40"
                  )}
                >
                  <span className={cn("text-sm font-bold", isActive ? "text-accent" : "text-foreground")}>
                    {stepRange(i)}
                  </span>
                  <span className="flex items-center gap-2">
                    <span className="text-sm font-extrabold text-primary">
                      {formatPrice(step.price)} MDL
                      <span className="font-medium text-muted-foreground">/buc</span>
                    </span>
                    {stepPercent > 0 && (
                      <Badge variant="secondary" className="normal-case px-2 py-0.5">
                        −{stepPercent}%
                      </Badge>
                    )}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-1 border-2 border-border rounded-xl">
          <button
            type="button"
            onClick={() => onQuantityChange(Math.max(1, quantity - 1))}
            disabled={quantity <= 1}
            aria-label="Scade cantitatea"
            className="w-10 h-11 flex items-center justify-center text-muted-foreground hover:text-accent disabled:text-muted-foreground/40 transition-colors"
          >
            <Minus className="w-4 h-4" aria-hidden />
          </button>
          <input
            type="number"
            min={1}
            value={quantity}
            onChange={(e) => {
              const parsed = Math.floor(Number(e.target.value));
              onQuantityChange(Number.isFinite(parsed) && parsed > 0 ? parsed : 1);
            }}
            aria-label="Cantitate"
            className="w-14 h-11 bg-transparent text-center text-sm font-bold text-foreground focus-visible:outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
          />
          <button
            type="button"
            onClick={() => onQuantityChange(quantity + 1)}
            aria-label="Crește cantitatea"
            className="w-10 h-11 flex items-center justify-center text-muted-foreground hover:text-accent transition-colors"
          >
            <Plus className="w-4 h-4" aria-hidden />
          </button>
        </div>

        <div className="flex flex-col">
          <span className="text-xl font-extrabold text-primary leading-tight" aria-live="polite">
            {formatPrice(total)} MDL
          </span>
          <span className="text-xs text-muted-foreground">
            {quantity} × {formatPrice(unitPrice)} MDL/buc
          </span>
        </div>

        {percent > 0 && (
          <Badge variant="accent" className="normal-case px-2.5 py-1">
            Economisești {formatPrice(saved)} MDL (−{percent}%)
          </Badge>
        )}
      </div>

      {upcoming && (
        <button
          type="button"
          onClick={() => onQuantityChange(upcoming.tier.minQty)}
          className="text-left text-sm text-primary hover:text-accent transition-colors"
        >
          Mai adaugă <b>{upcoming.missingQty} buc.</b> și plătești{" "}
          <b>{formatPrice(upcoming.tier.price)} MDL/bucată</b> (−{upcoming.percent}%)
        </button>
      )}
    </div>
  );
}
