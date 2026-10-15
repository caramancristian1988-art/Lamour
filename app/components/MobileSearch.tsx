"use client";

import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight, ChevronRight, Clock, LayoutGrid, Loader2, Search, TrendingUp, X } from "lucide-react";
import { HeadingFlourish } from "@/app/components/ui/motif";
import type { SearchResult } from "@/lib/searchProducts";

interface SearchCategory {
  id: string;
  slug: string;
  name: string;
  image: string | null;
}

// Titlu de secțiune, în stilul celor de pe prima pagină: text serif cu majuscule, floricică și o linie roz care se stinge.
function SectionTitle({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="flex min-w-0 flex-1 items-center gap-2.5">
      <h3 className="flex shrink-0 items-center gap-2 font-serif text-base font-bold uppercase tracking-tight text-primary">
        <span className="text-accent">{icon}</span>
        {children}
      </h3>
      <HeadingFlourish className="h-4 w-4" />
      <span aria-hidden className="h-px flex-1 bg-gradient-to-r from-brand-rose to-brand-rose/10" />
    </div>
  );
}

// Căutarea pentru telefon: în antet e doar un buton cu lupă (nu ocupă loc); la atingere se deschide un
// panou pe tot ecranul, cu câmpul sus (tastatura se ridică imediat, textul are 16 px ca iOS să nu mărească pagina),
// sugestii și căutări recente când e gol, rezultate mari (poză + preț) pe măsură ce scrii și un buton lung „Vezi toate"
// jos, la îndemâna degetului. Pe calculator rămâne câmpul din SearchBar.

const POPULAR = ["Hârtie igienică", "Prosoape de bucătărie", "Șervețele", "Șervețele umede", "Chibrituri", "Detergenți"];
const RECENT_KEY = "lumin-recent-searches";
const MAX_RECENT = 5;

function readRecent(): string[] {
  try {
    const raw = localStorage.getItem(RECENT_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((v): v is string => typeof v === "string").slice(0, MAX_RECENT) : [];
  } catch {
    return [];
  }
}

function writeRecent(list: string[]) {
  try {
    localStorage.setItem(RECENT_KEY, JSON.stringify(list.slice(0, MAX_RECENT)));
  } catch {
    // modul privat / spațiu blocat: căutările recente pur și simplu nu se rețin
  }
}

export default function MobileSearch({ categories = [] }: { categories?: SearchCategory[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [recent, setRecent] = useState<string[]>([]);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const requestId = useRef(0);
  const titleId = useId();

  // Cât e deschis: pagina de dedesubt nu se derulează, Escape închide.
  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  // Rezultate pe măsură ce scrii (cu mică pauză; răspunsurile vechi se ignoră).
  useEffect(() => {
    if (!open) return;
    const trimmed = query.trim();
    const id = ++requestId.current;
    if (!trimmed) return;
    const timeout = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(trimmed)}&limit=8`);
        const data = await res.json();
        if (id === requestId.current) setResults(data.results ?? []);
      } catch {
        if (id === requestId.current) setResults([]);
      } finally {
        if (id === requestId.current) setLoading(false);
      }
    }, 200);
    return () => clearTimeout(timeout);
  }, [query, open]);

  function openPanel() {
    setRecent(readRecent());
    setOpen(true);
    // focus imediat, în același gest al utilizatorului (altfel tastatura nu se mai deschide pe iOS)
    requestAnimationFrame(() => inputRef.current?.focus());
  }

  function close() {
    setOpen(false);
    setQuery("");
    setResults([]);
    triggerRef.current?.focus({ preventScroll: true });
  }

  function remember(term: string) {
    const t = term.trim();
    if (!t) return;
    writeRecent([t, ...readRecent().filter((r) => r.toLowerCase() !== t.toLowerCase())]);
  }

  function goToResults(term: string) {
    const t = term.trim();
    if (!t) return;
    remember(t);
    setOpen(false);
    setQuery("");
    setResults([]);
    router.push(`/produse?q=${encodeURIComponent(t)}`);
  }

  const trimmed = query.trim();

  const panel = (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      className="page-motif fixed inset-0 z-[90] flex flex-col animate-fade-in [animation-duration:0.18s]"
    >
      <h2 id={titleId} className="sr-only">
        Căutare produse
      </h2>

      {/* Antet vișiniu cu model discret (ca bara de sus a site-ului) și câmpul alb, rotunjit */}
      <div className="relative shrink-0 overflow-hidden bg-gradient-to-r from-brand-maroon-dark via-brand-maroon to-brand-maroon-dark pt-[max(0.75rem,env(safe-area-inset-top))] shadow-lg">
        <div aria-hidden className="pointer-events-none absolute inset-0 bg-footer-pattern opacity-[0.08]" />
        <form
          role="search"
          onSubmit={(e) => {
            e.preventDefault();
            goToResults(query);
          }}
          className="relative flex items-center gap-2 px-3 pb-3.5"
        >
          <button
            type="button"
            onClick={close}
            aria-label="Închide căutarea"
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-white transition-colors active:bg-white/15"
          >
            <ArrowLeft className="h-6 w-6" aria-hidden />
          </button>
          <div className="relative flex h-12 min-w-0 flex-1 items-center rounded-full bg-white pl-4 pr-1 shadow-md ring-4 ring-white/15 transition-shadow focus-within:ring-white/50">
            <Search className="mr-2.5 h-5 w-5 shrink-0 text-accent" aria-hidden />
            <label htmlFor={`${titleId}-input`} className="sr-only">
              Ce produs cauți?
            </label>
            <input
              ref={inputRef}
              id={`${titleId}-input`}
              type="search"
              inputMode="search"
              enterKeyHint="search"
              autoComplete="off"
              autoCapitalize="off"
              autoCorrect="off"
              spellCheck={false}
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                if (!e.target.value.trim()) setResults([]);
              }}
              placeholder="Ce produs cauți?"
              // câmpul nu are contur propriu (data-own-focus): indicatorul de focus e inelul din jurul pastilei albe
              data-own-focus
              className="h-full w-full min-w-0 bg-transparent text-base text-foreground placeholder:text-muted-foreground [&::-webkit-search-cancel-button]:hidden"
            />
            {query && (
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  setResults([]);
                  inputRef.current?.focus();
                }}
                aria-label="Șterge căutarea"
                className="mr-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-muted-foreground active:bg-muted"
              >
                <X className="h-5 w-5" aria-hidden />
              </button>
            )}
          </div>
        </form>
        {/* Linie fină roz la bază, ca o margine brodată */}
        <div aria-hidden className="relative h-px bg-gradient-to-r from-transparent via-brand-rose/70 to-transparent" />
      </div>

      {/* Conținut derulabil */}
      <div className="scrollbar-brand min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-5">
        <div className="mx-auto w-full max-w-2xl">
          {!trimmed ? (
            <div className="flex flex-col gap-7">
              {recent.length > 0 && (
                <section aria-label="Căutări recente">
                  <div className="mb-3 flex items-center gap-3">
                    <SectionTitle icon={<Clock className="h-4 w-4" aria-hidden />}>Căutări recente</SectionTitle>
                    <button
                      type="button"
                      onClick={() => {
                        writeRecent([]);
                        setRecent([]);
                      }}
                      className="rounded-full px-3 py-1.5 text-xs font-bold text-muted-foreground active:bg-muted active:text-accent"
                    >
                      Șterge
                    </button>
                  </div>
                  <ul className="flex flex-wrap gap-2">
                    {recent.map((term) => (
                      <li key={term}>
                        <button
                          type="button"
                          onClick={() => goToResults(term)}
                          className="flex h-11 items-center gap-2 rounded-full border border-brand-rose bg-card px-4 text-sm font-semibold text-foreground shadow-sm active:border-accent active:text-accent"
                        >
                          <Clock className="h-3.5 w-3.5 text-muted-foreground" aria-hidden />
                          {term}
                        </button>
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              <section aria-label="Căutări populare">
                <div className="mb-3">
                  <SectionTitle icon={<TrendingUp className="h-4 w-4" aria-hidden />}>Căutări populare</SectionTitle>
                </div>
                <ul className="flex flex-wrap gap-2">
                  {POPULAR.map((term) => (
                    <li key={term}>
                      <button
                        type="button"
                        onClick={() => goToResults(term)}
                        className="flex h-11 items-center gap-2 rounded-full bg-secondary/50 px-4 text-sm font-bold text-primary shadow-sm active:bg-secondary/80"
                      >
                        <Search className="h-3.5 w-3.5 text-accent" aria-hidden />
                        {term}
                      </button>
                    </li>
                  ))}
                </ul>
              </section>

              {categories.length > 0 && (
                <section aria-label="Categorii">
                  <div className="mb-3">
                    <SectionTitle icon={<LayoutGrid className="h-4 w-4" aria-hidden />}>Categorii</SectionTitle>
                  </div>
                  <ul className="grid grid-cols-3 gap-2.5 sm:grid-cols-4">
                    {categories.map((cat) => (
                      <li key={cat.id}>
                        <Link
                          href={`/produse/${cat.slug}`}
                          onClick={close}
                          className="flex h-full flex-col overflow-hidden rounded-xl border border-brand-rose/60 bg-card text-center shadow-sm transition-colors active:border-accent active:bg-muted"
                        >
                          {/* Pătrat, ca pe cardurile de categorii: poza se vede întreagă (object-contain) */}
                          <span className="relative block aspect-square w-full shrink-0 bg-white">
                            {cat.image && <Image src={cat.image} alt="" fill sizes="(max-width: 640px) 33vw, 160px" className="object-contain p-1.5" />}
                          </span>
                          <span className="flex flex-1 items-center justify-center px-1.5 py-2 text-xs font-bold leading-tight text-primary">
                            <span className="line-clamp-3">{cat.name}</span>
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </section>
              )}
            </div>
          ) : loading && results.length === 0 ? (
            <p role="status" className="flex items-center justify-center gap-2 py-12 text-sm text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin text-accent" aria-hidden /> Se caută...
            </p>
          ) : results.length > 0 ? (
            <ul className="flex flex-col gap-2.5" aria-label="Rezultate">
              {results.map((product) => (
                <li key={product.slug}>
                  <Link
                    href={`/produse/${product.slug}`}
                    onClick={() => {
                      remember(trimmed);
                      setOpen(false);
                      setQuery("");
                      setResults([]);
                    }}
                    className="flex items-center gap-3 rounded-2xl border border-brand-rose/60 bg-card p-2.5 shadow-sm transition-colors active:border-accent active:bg-muted"
                  >
                    <span className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-border bg-white">
                      {product.image && <Image src={product.image} alt="" fill sizes="64px" className="object-contain p-1" />}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="line-clamp-2 text-[15px] font-bold leading-snug text-foreground">{product.name}</span>
                      <span className="mt-1 flex flex-wrap items-baseline gap-x-2">
                        <span className="text-base font-bold text-accent">{product.price.toLocaleString("ro-MD")} MDL</span>
                        {product.oldPrice && (
                          <span className="text-xs text-muted-foreground line-through">{product.oldPrice.toLocaleString("ro-MD")} MDL</span>
                        )}
                      </span>
                    </span>
                    <ChevronRight className="h-5 w-5 shrink-0 text-brand-rose" aria-hidden />
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <div role="status" className="flex flex-col items-center gap-3 py-12 text-center">
              <span className="flex h-16 w-16 items-center justify-center rounded-full bg-secondary/50">
                <Search className="h-7 w-7 text-accent" aria-hidden />
              </span>
              <p className="font-serif text-xl font-bold text-primary">Niciun rezultat pentru „{trimmed}”</p>
              <p className="max-w-xs text-sm text-muted-foreground">Încearcă alt cuvânt sau alege una dintre căutările populare.</p>
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  inputRef.current?.focus();
                }}
                className="mt-1 h-11 rounded-full bg-secondary/50 px-5 text-sm font-bold text-primary active:bg-secondary/80"
              >
                Șterge căutarea
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Acțiunea principală, jos (la îndemâna degetului mare) */}
      {trimmed && (
        <div className="shrink-0 border-t border-brand-rose/60 bg-card/95 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-[0_-4px_16px_rgba(0,0,0,0.06)] backdrop-blur">
          <div className="mx-auto w-full max-w-2xl">
            <button
              type="button"
              onClick={() => goToResults(query)}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-accent text-sm font-bold uppercase tracking-wide text-white shadow-md active:scale-[0.98] active:bg-brand-red-dark"
            >
              Vezi toate rezultatele
              <ArrowRight className="h-5 w-5" aria-hidden />
            </button>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={openPanel}
        aria-haspopup="dialog"
        data-search-trigger
        aria-expanded={open}
        aria-label="Caută produse"
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-accent text-white shadow-md transition-all hover:bg-brand-red-dark active:scale-90"
      >
        <Search className="h-5 w-5" aria-hidden />
      </button>

      {/* Portal în body: antetul are transform (animația de ascundere), iar un element „fixed" din el nu ar acoperi ecranul. */}
      {open ? createPortal(panel, document.body) : null}
    </>
  );
}
