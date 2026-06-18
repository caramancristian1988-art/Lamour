"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
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
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setOpen(true)}
            placeholder="Caută condiționere, sisteme multisplit..."
            autoComplete="off"
            className="w-full h-11 pl-4 pr-14 rounded-xl border border-gray-200 bg-[#f6f8fb] text-base sm:text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#1d2353] focus:ring-2 focus:ring-[#1d2353]/10 transition-all"
          />
          <button
            type="submit"
            aria-label="Caută"
            className="absolute right-0 h-11 w-12 flex items-center justify-center rounded-r-xl bg-[#c7092b] text-white hover:bg-[#a5071f] transition-colors"
          >
            <svg
              className="w-4.5 h-4.5"
              fill="none"
              stroke="currentColor"
              strokeWidth={2.5}
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z"
              />
            </svg>
          </button>
        </div>
      </form>

      {showDropdown && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border border-gray-100 z-50 max-h-[70vh] overflow-y-auto">
          {loading ? (
            <p className="text-sm text-gray-400 text-center py-6">Se caută...</p>
          ) : results.length > 0 ? (
            <>
              {results.map((product) => (
                <Link
                  key={product.slug}
                  href={`/produse/${product.slug}`}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors border-t border-gray-50 first:border-t-0"
                >
                  <div className="relative w-10 h-10 shrink-0 rounded-lg bg-white border border-gray-100 overflow-hidden">
                    {product.image && (
                      <Image src={product.image} alt={product.name} fill className="object-contain" sizes="40px" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-[#1d2353] truncate">{product.name}</p>
                    <p className="text-xs text-gray-500">{product.price.toLocaleString("ro-MD")} MDL</p>
                  </div>
                </Link>
              ))}
              <Link
                href={`/produse?q=${encodeURIComponent(query)}`}
                onClick={() => setOpen(false)}
                className="block px-4 py-2.5 text-center text-xs font-bold text-[#c7092b] hover:bg-gray-50 transition-colors border-t border-gray-50 uppercase tracking-wide"
              >
                Vezi toate rezultatele
              </Link>
            </>
          ) : (
            <p className="text-sm text-gray-400 text-center py-6">
              Niciun produs găsit pentru &ldquo;{query.trim()}&rdquo;.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
