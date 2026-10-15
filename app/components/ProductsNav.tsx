"use client";

import { createContext, useContext, useState, useTransition, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

// Filtrele catalogului rulează ÎN BROWSER: lista de produse e trimisă o singură dată împreună cu pagina, iar o apăsare pe
// un filtru / sortare / „Încarcă mai multe" doar schimbă adresa (history.pushState — useSearchParams se actualizează
// singur) și lista se recalculează pe loc, fără nicio cerere la server. Dacă destinația e altă pagină, se navighează normal.

interface NavOptions {
  scroll?: boolean;
  /** Înlocuiește intrarea curentă din istoric în loc să adauge una (ex. „Încarcă mai multe"). */
  replace?: boolean;
}

interface ProductsNavValue {
  isPending: boolean;
  /** Destinația aleasă, cât timp navigarea e în curs (pentru evidențierea imediată a chip-urilor). */
  pendingHref: string | null;
  navigate: (href: string, options?: NavOptions) => void;
}

const ProductsNavContext = createContext<ProductsNavValue | null>(null);

// Parametrii din adresă, dați de ProductsCatalog (care îi citește din useSearchParams sau, în HTML-ul static, îi lasă goi).
// Filtrele îi citesc de aici, nu direct din useSearchParams: așa pagina rămâne statică (useSearchParams ar scoate-o din HTML-ul
// pregătit dinainte), iar lista implicită se vede imediat, chiar înainte să se încarce JavaScript-ul.
const UrlParamsContext = createContext<URLSearchParams | null>(null);
const NO_PARAMS = new URLSearchParams();

export function useUrlParams(): URLSearchParams {
  return useContext(UrlParamsContext) ?? NO_PARAMS;
}

export function ProductsNavProvider({ children, params }: { children: ReactNode; params: URLSearchParams }) {
  const router = useRouter();

  function navigate(href: string, options?: NavOptions & { replace?: boolean }) {
    const target = new URL(href, window.location.href);
    if (target.pathname !== window.location.pathname) {
      router.push(href, options);
      return;
    }
    const url = target.pathname + target.search;
    if (options?.replace) window.history.replaceState(null, "", url);
    else window.history.pushState(null, "", url);
  }

  return (
    <UrlParamsContext.Provider value={params}>
      <ProductsNavContext.Provider value={{ isPending: false, pendingHref: null, navigate }}>
        {children}
      </ProductsNavContext.Provider>
    </UrlParamsContext.Provider>
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

/**
 * Chip-uri cu selecție MULTIPLĂ (ex. „Hârtie igienică în 3 straturi” + „în 4 straturi” deodată): fiecare chip adaugă sau
 * scoate valoarea lui din parametrul din URL (`cat=a,b` / `subcat=a,b`); „Toate” le golește. Starea vine din URL — sau din
 * destinația navigării în curs, ca bifele să se vadă instant și două apăsări rapide să se cumuleze (ca în bara laterală).
 * Rămân linkuri reale (tab nou cu Ctrl/Cmd+click).
 */
export function MultiNavChips({
  paramKey,
  allValue,
  options,
  ariaLabel,
  className,
  allLabel = "Toate",
}: {
  paramKey: string;
  /** Valoarea parametrului pentru „Toate” (ex. slug-ul categoriei părinte); null = fără parametru. */
  allValue: string | null;
  options: { value: string; label: string }[];
  ariaLabel: string;
  className?: string;
  allLabel?: string;
}) {
  const navigate = useProductsNavigate();
  const pathname = usePathname();
  const urlParams = useUrlParams();
  const pendingHref = usePendingHref();
  const params = pendingHref ? new URLSearchParams(pendingHref.split("?")[1] ?? "") : urlParams;

  const known = options.map((o) => o.value);
  const selected = (params.get(paramKey)?.split(",").filter(Boolean) ?? []).filter((v) => known.includes(v));
  const parentSelected = allValue !== null && (params.get(paramKey)?.split(",").includes(allValue) ?? false);
  // „Toate” e activ când niciun chip nu e ales (sau părintele e ales explicit): atunci apăsarea unui chip pornește o selecție nouă.
  const allActive = selected.length === 0 || parentSelected;
  const style = CHIP_BASE.sm;

  function hrefFor(next: string[]): string {
    const p = new URLSearchParams(params.toString());
    if (next.length > 0) p.set(paramKey, next.join(","));
    else if (allValue !== null) p.set(paramKey, allValue);
    else p.delete(paramKey);
    p.delete("page");
    const qs = p.toString();
    return qs ? `${pathname}?${qs}` : pathname;
  }

  const toggled = (value: string): string[] => {
    if (allActive) return [value];
    return selected.includes(value) ? selected.filter((v) => v !== value) : [...selected, value];
  };

  const items = [
    { key: "__all", label: allLabel, href: hrefFor([]), active: allActive },
    ...options.map((o) => ({ key: o.value, label: o.label, href: hrefFor(toggled(o.value)), active: !allActive && selected.includes(o.value) })),
  ];

  return (
    <div className={className} role="group" aria-label={ariaLabel}>
      {items.map((item) => (
        <Link
          key={item.key}
          href={item.href}
          aria-current={item.active ? "true" : undefined}
          onClick={(e) => {
            if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
            e.preventDefault();
            navigate(item.href, { scroll: false });
          }}
          className={cn(style.base, item.active ? style.active : style.idle)}
        >
          {item.label}
        </Link>
      ))}
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
  // Evidențiem imediat doar chip-ul apăsat. Dacă navigarea în curs vine din altă parte (o bifă din bara laterală, sortarea),
  // destinația nu e niciun chip din grup — atunci chip-urile își păstrează starea curentă, nu rămân toate stinse cât se încarcă.
  const pendingIsChip = pendingHref !== null && items.some((item) => item.href === pendingHref);
  const style = CHIP_BASE[size];

  return (
    <div className={className} role="group" aria-label={ariaLabel}>
      {items.map((item) => {
        const active = pendingIsChip ? item.href === pendingHref : item.active;
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
