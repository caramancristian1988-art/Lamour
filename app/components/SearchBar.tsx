"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Search, Loader2 } from "lucide-react";
import type { SearchResult } from "@/lib/searchProducts";

export default function SearchBar() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const requestId = useRef(0);

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

  const showDropdown = open && query.trim().length > 0;

  return (
    <div ref={rootRef} className="relative w-full">
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
        <div className="relative flex items-center">
          <label htmlFor="site-search" className="sr-only">
            Caută
          </label>
          <input
            id="site-search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setOpen(true)}
            placeholder="Caută..."
            autoComplete="off"
            className="w-full h-12 pl-4 pr-14 rounded-xl border-2 border-input bg-muted text-base text-foreground placeholder-muted-foreground focus-visible:outline-none focus-visible:border-accent focus-visible:ring-3 focus-visible:ring-accent/20 transition-all"
          />
          <button
            type="submit"
            aria-label="Caută"
            className="absolute right-0 h-12 w-12 flex items-center justify-center rounded-r-xl bg-accent text-white hover:bg-brand-red-dark transition-colors"
          >
            <Search className="w-5 h-5" aria-hidden />
          </button>
        </div>
      </form>

      {showDropdown && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-popover rounded-xl shadow-2xl border border-border z-50 max-h-[70vh] overflow-y-auto">
          {loading ? (
            <p className="flex items-center justify-center gap-2 text-sm text-muted-foreground py-6">
              <Loader2 className="w-4 h-4 animate-spin" aria-hidden /> Se caută...
            </p>
          ) : results.length > 0 ? (
            <>
              {results.map((product) => (
                <Link
                  key={product.slug}
                  href={`/produse/${product.slug}`}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-muted transition-colors border-t border-border first:border-t-0"
                >
                  <div className="relative w-10 h-10 shrink-0 rounded-lg bg-card border border-border overflow-hidden">
                    {product.image && (
                      <Image src={product.image} alt={product.name} fill className="object-contain" sizes="40px" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-foreground truncate">{product.name}</p>
                    <p className="text-xs text-muted-foreground">{product.price.toLocaleString("ro-MD")} MDL</p>
                  </div>
                </Link>
              ))}
              <Link
                href={`/produse?q=${encodeURIComponent(query)}`}
                onClick={() => setOpen(false)}
                className="block px-4 py-3 text-center text-xs font-bold text-accent hover:bg-muted transition-colors border-t border-border uppercase tracking-wide"
              >
                Vezi toate rezultatele
              </Link>
            </>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-6">
              Niciun rezultat pentru „{query.trim()}”.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
