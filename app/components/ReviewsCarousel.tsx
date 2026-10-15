"use client";

import { useCallback, useEffect, useRef } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";

export interface CarouselItem {
  id: string;
  name: string;
  /** Textul comentariului — text alternativ pentru captura de ecran. */
  text: string;
  image: { src: string; width: number; height: number };
}

const SPEED_PX_PER_SECOND = 32; // lent, ca să se poată citi
const RESUME_AFTER_MS = 2500; // după o interacțiune, derularea automată reia după atât

// Carusel de capturi de ecran cu comentarii, în buclă continuă:
//  • derulează singur, încet, de la dreapta la stânga;
//  • se poate glisa cu degetul (telefon) sau cu mouse-ul (tragi stânga/dreapta);
//  • butoanele stânga/dreapta merg la recenzia anterioară/următoare;
//  • se oprește cât ai mouse-ul deasupra, cât atingi/tragi sau ai focus în el, și reia singur după câteva secunde;
//  • cu „mișcare redusă” în sistem nu derulează singur (rămâne glisarea și butoanele).
// Bucla: seria de carduri apare de 3 ori; poziția e mutată discret cu o serie înainte/înapoi, fără salt vizibil.
export default function ReviewsCarousel({ items }: { items: CarouselItem[] }) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const state = useRef({ pos: 0, setWidth: 0, hovered: false, dragging: false, interactUntil: 0, startX: 0, startScroll: 0 });

  // Pe ecrane late o serie trebuie să acopere lățimea ca bucla să nu aibă goluri.
  const set: CarouselItem[] = [];
  if (items.length > 0) while (set.length < 6) set.push(...items);

  const bump = useCallback((ms = RESUME_AFTER_MS) => {
    state.current.interactUntil = performance.now() + ms;
  }, []);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el || set.length === 0) return;
    const s = state.current;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const measure = () => {
      const middle = el.querySelector<HTMLElement>('[data-copy="1"]');
      if (!middle) return;
      s.setWidth = middle.offsetLeft; // lățimea primei serii (inclusiv spațiul dintre serii)
      if (s.pos < s.setWidth * 0.5 || s.pos > s.setWidth * 1.5) {
        s.pos = s.setWidth;
        el.scrollLeft = s.pos;
      }
    };
    measure();
    window.addEventListener("resize", measure);

    const recenter = () => {
      if (!s.setWidth) return;
      const x = el.scrollLeft;
      if (x < s.setWidth * 0.5) el.scrollLeft = s.pos = x + s.setWidth;
      else if (x > s.setWidth * 1.5) el.scrollLeft = s.pos = x - s.setWidth;
      else s.pos = x;
    };

    let scrollTimer: ReturnType<typeof setTimeout> | undefined;
    const onScroll = () => {
      // Recentrăm abia când s-a oprit mișcarea (nu în mijlocul unui scroll lin sau al unei glisări).
      clearTimeout(scrollTimer);
      scrollTimer = setTimeout(() => {
        if (!s.dragging) recenter();
      }, 140);
    };
    el.addEventListener("scroll", onScroll, { passive: true });

    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = Math.min(0.1, (now - last) / 1000);
      last = now;
      const idle = !s.hovered && !s.dragging && now >= s.interactUntil;
      if (idle && !reduced && s.setWidth) {
        s.pos += SPEED_PX_PER_SECOND * dt;
        if (s.pos > s.setWidth * 1.5) s.pos -= s.setWidth;
        el.scrollLeft = s.pos;
      } else {
        s.pos = el.scrollLeft; // urmărim poziția pusă de utilizator
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(scrollTimer);
      window.removeEventListener("resize", measure);
      el.removeEventListener("scroll", onScroll);
    };
  }, [set.length]);

  function go(direction: 1 | -1) {
    const el = scrollerRef.current;
    if (!el) return;
    bump(4500); // lăsăm mișcarea lină să se termine înainte să reia derularea automată
    const cards = Array.from(el.querySelectorAll<HTMLElement>("[data-card]")).sort((a, b) => a.offsetLeft - b.offsetLeft);
    const x = el.scrollLeft;
    const target =
      direction > 0
        ? cards.find((c) => c.offsetLeft > x + 12)
        : [...cards].reverse().find((c) => c.offsetLeft < x - 12);
    el.scrollTo({ left: target ? target.offsetLeft : x + direction * 360, behavior: "smooth" });
  }

  if (items.length === 0) return null;

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== "mouse") return; // pe telefon glisarea e nativă
    const el = scrollerRef.current;
    if (!el) return;
    const s = state.current;
    s.dragging = true;
    s.startX = e.clientX;
    s.startScroll = el.scrollLeft;
    el.setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const s = state.current;
    const el = scrollerRef.current;
    if (!s.dragging || !el) return;
    el.scrollLeft = s.startScroll - (e.clientX - s.startX);
  };
  const endDrag = () => {
    const s = state.current;
    if (!s.dragging) return;
    s.dragging = false;
    bump();
  };

  return (
    <div className="relative" role="region" aria-roledescription="carusel" aria-label="Comentarii ale clienților">
      <button
        type="button"
        onClick={() => go(-1)}
        aria-label="Comentariul anterior"
        className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-10 w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-card border border-border shadow-md flex items-center justify-center text-primary hover:bg-muted transition-colors"
      >
        <ChevronLeft className="w-6 h-6" aria-hidden />
      </button>
      <button
        type="button"
        onClick={() => go(1)}
        aria-label="Comentariul următor"
        className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-10 w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-card border border-border shadow-md flex items-center justify-center text-primary hover:bg-muted transition-colors"
      >
        <ChevronRight className="w-6 h-6" aria-hidden />
      </button>

      <div
        ref={scrollerRef}
        tabIndex={0}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onPointerEnter={(e) => {
          if (e.pointerType === "mouse") state.current.hovered = true;
        }}
        onPointerLeave={(e) => {
          if (e.pointerType === "mouse") {
            state.current.hovered = false;
            bump(800);
          }
        }}
        onTouchStart={() => bump(4000)}
        onTouchMove={() => bump(4000)}
        onWheel={() => bump(3000)}
        onKeyDown={() => bump(4000)}
        onFocus={() => bump(4000)}
        className="flex overflow-x-auto overscroll-x-contain select-none cursor-grab active:cursor-grabbing [scrollbar-width:none] [&::-webkit-scrollbar]:hidden [mask-image:linear-gradient(to_right,transparent,black_4%,black_96%,transparent)]"
      >
        {[0, 1, 2].map((copy) => (
          <ul
            key={copy}
            data-copy={copy}
            aria-label={copy === 1 ? "Comentarii și mărturii ale clienților" : undefined}
            aria-hidden={copy === 1 ? undefined : true}
            inert={copy === 1 ? undefined : true}
            className="flex shrink-0 gap-5 pr-5 items-center"
          >
            {set.map((item, i) => (
              <li key={`${copy}-${item.id}-${i}`} data-card className="w-[300px] sm:w-[560px] lg:w-[620px] shrink-0">
                <figure className="overflow-hidden rounded-2xl border border-border shadow-sm bg-card">
                  <Image
                    src={item.image.src}
                    alt={`Comentariu pe Facebook de la ${item.name}: ${item.text}`}
                    width={item.image.width}
                    height={item.image.height}
                    draggable={false}
                    className="w-full h-auto"
                    sizes="(max-width: 640px) 300px, 620px"
                  />
                </figure>
              </li>
            ))}
          </ul>
        ))}
      </div>
    </div>
  );
}
