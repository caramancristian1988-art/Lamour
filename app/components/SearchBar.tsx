"use client";

import { useEffect, useId, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Loader2, Search, X } from "lucide-react";
import type { SearchResult } from "@/lib/searchProducts";

// Sugestii care se schimbă în câmpul gol (fade), ca să se vadă ce se poate căuta. Se opresc la focus și la „mișcare redusă”.
const PLACEHOLDERS = ["Caută produse...", "ex. hârtie igienică", "ex. prosoape de bucătărie", "ex. clești pentru rufe", "ex. șervețele"];

export default function SearchBar() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [focused, setFocused] = useState(false);
  const [hintIndex, setHintIndex] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const requestId = useRef(0);
  const inputId = useId();

  useEffect(() => {
    const trimmed = query.trim();
    const id = ++requestId.current;

    const timeout = setTimeout(async () => {
      if (!trimmed) {
        if (id === requestId.current) {
          setResults([]);
          setLoading(false);
        }
        return;
      }

      if (id === requestId.current) setLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(trimmed)}`);
        const data = await res.json();
        if (id === requestId.current) {
          setResults(data.results ?? []);
          setLoading(false);
        }
      } catch {
        if (id === requestId.current) {
          setResults([]);
          setLoading(false);
        }
      }
    }, trimmed ? 250 : 0);

    return () => clearTimeout(timeout);
  }, [query]);

  useEffect(() => {
    if (!open) return;
    function onClickOutside(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [open]);

  // Placeholder rotativ (doar cât câmpul e gol și fără focus)
  useEffect(() => {
    if (focused || query) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = setInterval(() => setHintIndex((i) => (i + 1) % PLACEHOLDERS.length), 3200);
    return () => clearInterval(t);
  }, [focused, query]);

  const showDropdown = open && query.trim().length > 0;

  function moveFocus(direction: 1 | -1, from: HTMLElement | null) {
    const links = Array.from(dropdownRef.current?.querySelectorAll<HTMLElement>("a") ?? []);
    if (links.length === 0) return;
    const index = from ? links.indexOf(from) : -1;
    const next = index + direction;
    if (next < 0) {
      inputRef.current?.focus();
    } else {
      links[Math.min(next, links.length - 1)]?.focus();
    }
  }

  return (
    <div
      ref={rootRef}
      className="relative w-full"
      onKeyDown={(e) => {
        if (e.key === "Escape") {
          setOpen(false);
          inputRef.current?.focus();
        } else if (e.key === "ArrowDown" && showDropdown) {
          e.preventDefault();
          moveFocus(1, document.activeElement instanceof HTMLElement && dropdownRef.current?.contains(document.activeElement) ? document.activeElement : null);
        } else if (e.key === "ArrowUp" && showDropdown && document.activeElement !== inputRef.current) {
          e.preventDefault();
          moveFocus(-1, document.activeElement instanceof HTMLElement ? document.activeElement : null);
        }
      }}
    >
      <form
        role="search"
        onSubmit={(e) => {
          e.preventDefault();
          if (query.trim()) {
            setOpen(false);
            router.push(`/produse?q=${encodeURIComponent(query)}`);
          }
        }}
        className="w-full"
      >
        <div
          className={`group/search flex h-14 items-center rounded-full border-2 bg-muted pl-5 pr-1.5 transition-all duration-300 ease-out ${
            focused
              ? "border-accent bg-card shadow-lg shadow-accent/15 ring-4 ring-accent/15"
              : "border-input hover:border-accent/60 hover:bg-card hover:shadow-md"
          }`}
        >
          <Search
            className={`mr-3 h-5 w-5 shrink-0 transition-all duration-300 ${
              focused ? "scale-110 text-accent" : "text-muted-foreground group-hover/search:text-accent"
            }`}
            aria-hidden
          />
          <label htmlFor={inputId} className="sr-only">
            Caută
          </label>
          <div className="relative h-full min-w-0 flex-1">
            <input
              ref={inputRef}
              id={inputId}
              type="search"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setOpen(true);
              }}
              onFocus={() => {
                setFocused(true);
                setOpen(true);
              }}
              onBlur={() => setFocused(false)}
              placeholder={focused ? "Ce produs cauți?" : ""}
              autoComplete="off"
              data-own-focus
              className="h-full w-full min-w-0 bg-transparent text-base text-foreground outline-none placeholder:text-muted-foreground [&::-webkit-search-cancel-button]:hidden"
            />
            {/* Placeholder-ul animat (nu e „placeholder” real, ca să poată face fade între sugestii) */}
            {!focused && !query && (
              <span
                key={hintIndex}
                aria-hidden
                className="pointer-events-none absolute inset-y-0 left-0 flex items-center truncate text-base text-muted-foreground animate-fade-in"
              >
                {PLACEHOLDERS[hintIndex]}
              </span>
            )}
          </div>

          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setResults([]);
                inputRef.current?.focus();
              }}
              aria-label="Șterge căutarea"
              className="mr-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-all duration-200 animate-pop hover:bg-muted hover:text-accent active:scale-90"
            >
              <X className="h-4 w-4" aria-hidden />
            </button>
          )}

          <button
            type="submit"
            aria-label="Caută"
            className="group/btn relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-accent text-white shadow-sm transition-all duration-200 hover:scale-105 hover:bg-brand-red-dark hover:shadow-md active:scale-90"
          >
            {/* Strălucire care trece peste buton la hover */}
            <span
              aria-hidden
              className="pointer-events-none absolute inset-y-0 -left-full w-1/2 -skew-x-12 bg-white/30 transition-all duration-500 group-hover/btn:left-[150%]"
            />
            {loading ? (
              <Loader2 className="relative h-5 w-5 animate-spin" aria-hidden />
            ) : query.trim() ? (
              <ArrowRight className="relative h-5 w-5 transition-transform duration-200 group-hover/btn:translate-x-0.5" aria-hidden />
            ) : (
              <Search className="relative h-5 w-5 transition-transform duration-200 group-hover/btn:-rotate-12 group-hover/btn:scale-110" aria-hidden />
            )}
          </button>
        </div>
      </form>

      {showDropdown && (
        <div
          ref={dropdownRef}
          className="absolute left-0 right-0 top-full z-50 mt-3 max-h-[70vh] origin-top overflow-y-auto rounded-2xl border border-border bg-popover shadow-2xl animate-scale-in scrollbar-brand"
        >
          {loading ? (
            <p className="flex items-center justify-center gap-2 py-6 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> Se caută...
            </p>
          ) : results.length > 0 ? (
            <>
              {results.map((product, i) => (
                <Link
                  key={product.slug}
                  href={`/produse/${product.slug}`}
                  onClick={() => setOpen(false)}
                  style={{ animationDelay: `${i * 45}ms` }}
                  className="group/item flex items-center gap-3 border-t border-border px-4 py-3 transition-colors animate-fade-in first:border-t-0 hover:bg-muted focus-visible:bg-muted focus-visible:outline-offset-[-3px]"
                >
                  <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-lg border border-border bg-card transition-transform duration-200 group-hover/item:scale-105">
                    {product.image && (
                      <Image src={product.image} alt="" fill className="object-contain p-0.5" sizes="44px" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-foreground transition-colors group-hover/item:text-accent">{product.name}</p>
                    <p className="text-xs text-muted-foreground">{product.price.toLocaleString("ro-MD")} MDL</p>
                  </div>
                  <ArrowRight
                    className="h-4 w-4 shrink-0 -translate-x-1 text-accent opacity-0 transition-all duration-200 group-hover/item:translate-x-0 group-hover/item:opacity-100"
                    aria-hidden
                  />
                </Link>
              ))}
              <Link
                href={`/produse?q=${encodeURIComponent(query)}`}
                onClick={() => setOpen(false)}
                style={{ animationDelay: `${results.length * 45}ms` }}
                className="block border-t border-border px-4 py-3 text-center text-xs font-bold uppercase tracking-wide text-accent transition-colors animate-fade-in hover:bg-muted focus-visible:bg-muted focus-visible:outline-offset-[-3px]"
              >
                Vezi toate rezultatele
              </Link>
            </>
          ) : (
            <p className="py-6 text-center text-sm text-muted-foreground">Niciun rezultat pentru „{query.trim()}”.</p>
          )}
        </div>
      )}
    </div>
  );
}
