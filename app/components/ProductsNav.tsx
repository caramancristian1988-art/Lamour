"use client";

import { createContext, useContext, useState, useTransition, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

// Răspuns "optimist" la filtrarea produselor: în loc să aștepte serverul fără nicio reacție vizibilă, o apăsare pe un
// filtru/tab/sortare (1) evidențiază imediat alegerea, (2) estompează lista veche și (3) arată o bară de progres,
// până sosește pagina nouă. Navigarea rulează într-o tranziție React, deci pagina veche rămâne pe ecran cât se încarcă.

interface NavOptions {
  scroll?: boolean;
}

interface ProductsNavValue {
  isPending: boolean;
  /** Destinația aleasă, cât timp navigarea e în curs (pentru evidențierea imediată a chip-urilor). */
  pendingHref: string | null;
  navigate: (href: string, options?: NavOptions) => void;
}

const ProductsNavContext = createContext<ProductsNavValue | null>(null);

export function ProductsNavProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [target, setTarget] = useState<string | null>(null);

  function navigate(href: string, options?: NavOptions) {
    setTarget(href);
    startTransition(() => {
      router.push(href, options);
    });
  }

  return (
    <ProductsNavContext.Provider value={{ isPending, pendingHref: isPending ? target : null, navigate }}>
      {isPending && (
        <>
          <div className="nav-progress-bar fixed inset-x-0 top-0 z-[70] h-1 bg-accent" aria-hidden />
          <span className="sr-only" role="status">Se încarcă produsele…</span>
        </>
      )}
      {children}
    </ProductsNavContext.Provider>
  );
}

/** Pentru filtre/sortare: în interiorul providerului navighează în tranziție (cu starea de așteptare), altfel ca înainte. */
export function useProductsNavigate(): (href: string, options?: NavOptions) => void {
  const ctx = useContext(ProductsNavContext);
  const router = useRouter();
  return ctx ? ctx.navigate : (href, options) => router.push(href, options);
}

/** Destinația filtrului aleasă cât timp navigarea e în curs (null în rest) — pentru bife/preț afișate imediat. */
export function usePendingHref(): string | null {
  return useContext(ProductsNavContext)?.pendingHref ?? null;
}

/** Zona cu rezultate: se estompează cât timp se încarcă lista nouă. */
export function PendingRegion({ children, className }: { children: ReactNode; className?: string }) {
  const ctx = useContext(ProductsNavContext);
  const pending = ctx?.isPending ?? false;
  return (
    <div
      aria-busy={pending}
      className={cn("transition-opacity duration-200", pending && "opacity-50 pointer-events-none", className)}
    >
      {children}
    </div>
  );
}

export interface NavChipItem {
  key: string;
  href: string;
  label: string;
  active: boolean;
}

const CHIP_BASE = {
  sm: {
    base: "px-4 py-2 rounded-full text-sm font-bold transition-colors",
    active: "bg-primary text-white",
    idle: "bg-card border border-border text-foreground hover:border-accent hover:text-accent",
  },
  lg: {
    base: "px-5 sm:px-6 py-2.5 sm:py-3 rounded-full text-sm sm:text-base font-bold transition-colors",
    active: "bg-primary text-white shadow-sm",
    idle: "bg-card border-2 border-border text-foreground hover:border-accent hover:text-accent",
  },
} as const;

/**
 * Chip-uri / tab-uri de filtrare. Rămân linkuri reale (deschidere în tab nou, prefetch), dar la apăsare simplă
 * navighează în tranziție, iar cel apăsat devine activ imediat — nu abia după ce răspunde serverul.
 */
export function NavChips({
  items,
  size = "sm",
  ariaLabel,
  className,
}: {
  items: NavChipItem[];
  size?: "sm" | "lg";
  ariaLabel: string;
  className?: string;
}) {
  const ctx = useContext(ProductsNavContext);
  const router = useRouter();
  const [localPending, startLocal] = useTransition();
  const [localTarget, setLocalTarget] = useState<string | null>(null);

  // În afara unui provider (ex. tab-urile paginilor Mobilă/Chirie) chip-urile își țin singure starea de așteptare.
  const navigate = ctx
    ? ctx.navigate
    : (href: string) => {
        setLocalTarget(href);
        startLocal(() => {
          router.push(href);
        });
      };
  const pendingHref = ctx ? ctx.pendingHref : localPending ? localTarget : null;
  const style = CHIP_BASE[size];

  return (
    <div className={className} role="group" aria-label={ariaLabel}>
      {items.map((item) => {
        const active = pendingHref !== null ? item.href === pendingHref : item.active;
        return (
          <Link
            key={item.key}
            href={item.href}
            aria-current={active ? "true" : undefined}
            onClick={(e) => {
              // Ctrl/Cmd/Shift/click de mijloc: comportamentul normal al linkului (tab nou).
              if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
              e.preventDefault();
              navigate(item.href);
            }}
            className={cn(style.base, active ? style.active : style.idle)}
          >
            {item.label}
          </Link>
        );
      })}
    </div>
  );
}
