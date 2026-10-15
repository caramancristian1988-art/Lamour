"use client";

import { Children, useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight, MoveRight } from "lucide-react";

interface Props {
  children: React.ReactNode;
  viewAllHref: string;
  viewAllLabel: string;
  ariaLabel: string;
}

// Rând de produse derulabil (săgeți + glisare cu degetul/mouse-ul): 2 produse vizibile pe telefon, 3 pe tabletă, 4 pe
// ecran mare; la final un card „Vezi toate”. Fiecare produs rămâne un card complet (ProductCard) — doar așezarea se schimbă.
export default function ProductsCarousel({ children, viewAllHref, viewAllLabel, ariaLabel }: Props) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);
  // Indiciul „Glisează" (doar pe telefon) dispare după prima derulare — apoi omul a înțeles deja că lista se mișcă.
  const [touched, setTouched] = useState(false);

  const update = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    setCanPrev(el.scrollLeft > 4);
    if (el.scrollLeft > 24) setTouched(true);
    setCanNext(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }, []);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    update();
    el.addEventListener("scroll", update, { passive: true });
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", update);
      ro.disconnect();
    };
  }, [update]);

  function page(direction: 1 | -1) {
    const el = scrollerRef.current;
    if (!el) return;
    // o „pagină” = ce se vede acum, minus puțin ca să rămână un reper vizual
    el.scrollBy({ left: direction * (el.clientWidth - 48), behavior: "smooth" });
  }

  const items = Children.toArray(children);
  // lățimea unui card: (100% − golurile) / număr vizibil; golul se schimbă cu --gap
  // Pe telefon se văd 2 produse și JUMĂTATE din al treilea ("peek"): marginea tăiată arată că lista continuă și se poate glisa.
  const basis = "basis-[calc((100%-1.4*var(--gap))/2.4)] sm:basis-[calc((100%-var(--gap))/2)] md:basis-[calc((100%-2*var(--gap))/3)] xl:basis-[calc((100%-3*var(--gap))/4)]";

  // Fiecare card se întinde pe toată înălțimea rândului: toate au aceeași înălțime (cel mai înalt dă măsura),
  // iar conținutul nu se taie — butoanele rămân aliniate jos (mt-auto în card).
  const wrap = "flex min-w-0 shrink-0 snap-start [&>*]:min-w-0 [&>*]:flex-1";

  const arrow =
    "absolute top-[38%] z-10 hidden h-12 w-12 items-center justify-center rounded-full border border-border bg-card text-primary shadow-lg transition-all duration-200 hover:scale-105 hover:bg-muted active:scale-95 sm:flex";

  return (
    <div className="relative" role="region" aria-roledescription="carusel" aria-label={ariaLabel}>
      <button
        type="button"
        onClick={() => page(-1)}
        aria-label="Produsele anterioare"
        tabIndex={canPrev ? 0 : -1}
        className={`${arrow} -left-2 lg:-left-5 ${canPrev ? "opacity-100" : "pointer-events-none opacity-0"}`}
      >
        <ChevronLeft className="h-6 w-6" aria-hidden />
      </button>
      <button
        type="button"
        onClick={() => page(1)}
        aria-label="Produsele următoare"
        tabIndex={canNext ? 0 : -1}
        className={`${arrow} -right-2 lg:-right-5 ${canNext ? "opacity-100" : "pointer-events-none opacity-0"}`}
      >
        <ChevronRight className="h-6 w-6" aria-hidden />
      </button>

      <div
        ref={scrollerRef}
        tabIndex={0}
        className="flex snap-x snap-mandatory gap-[var(--gap)] overflow-x-auto overscroll-x-contain scroll-smooth pb-3 [--gap:0.75rem] [scrollbar-width:none] sm:[--gap:1.25rem] [&::-webkit-scrollbar]:hidden"
      >
        {items.map((child, i) => (
          <div key={i} className={`${wrap} ${basis}`}>
            {child}
          </div>
        ))}

        <div className={`${wrap} ${basis}`}>
          <Link
            href={viewAllHref}
            className="group flex h-full min-h-[18rem] flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed border-brand-rose bg-secondary/15 p-6 text-center transition-all duration-300 hover:border-accent hover:bg-secondary/30 hover:shadow-lg"
          >
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-accent text-white shadow-md transition-transform duration-300 group-hover:translate-x-1 group-hover:scale-105">
              <ArrowRight className="h-6 w-6" aria-hidden />
            </span>
            <span className="text-base font-bold text-primary">{viewAllLabel}</span>
          </Link>
        </div>
      </div>

      {/* Indiciu vizibil doar pe telefon, până la prima glisare. */}
      {!touched && canNext && (
        <p aria-hidden className="mt-1 flex items-center justify-center gap-2 text-xs font-bold text-muted-foreground sm:hidden">
          Glisează pentru mai multe
          <MoveRight className="h-4 w-4 animate-[nudge_1.4s_ease-in-out_infinite] text-accent" />
        </p>
      )}
    </div>
  );
}
