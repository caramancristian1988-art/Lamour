"use client";

import { useEffect, useRef, useState } from "react";
import type { SectionFlags, HeaderCategory } from "@/lib/siteSettings";
import StickyHeader from "./StickyHeader";

// Cât de mult trebuie să derulezi (px) înainte să ascundem/arătăm antetul — evită clipitul la mișcări mici.
const SCROLL_DELTA = 8;

export default function ScrollAwareHeader(props: Partial<SectionFlags> & { categories?: HeaderCategory[]; phone?: string; phoneTel?: string }) {
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [headerHeight, setHeaderHeight] = useState(0);
  const headerRef = useRef<HTMLDivElement>(null);
  const lastScrollY = useRef(0);
  const heightRef = useRef(0);

  // Înălțimea antetului (se schimbă când se încarcă fonturile/sigla sau la redimensionare).
  useEffect(() => {
    const el = headerRef.current;
    if (!el) return;
    const measure = () => {
      heightRef.current = el.offsetHeight;
      setHeaderHeight(el.offsetHeight);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    let ticking = false;

    const update = () => {
      ticking = false;
      const y = Math.max(0, window.scrollY);
      setScrolled(y > 0);

      if (y <= heightRef.current) {
        // Aproape de capăt — mereu vizibil (fără clipit la graniță)
        setHidden(false);
      } else if (y > lastScrollY.current + SCROLL_DELTA) {
        setHidden(true); // derulezi în jos
      } else if (y < lastScrollY.current - SCROLL_DELTA) {
        setHidden(false); // derulezi în sus
      } else {
        return; // mișcare prea mică: păstrăm starea și ultima poziție
      }
      lastScrollY.current = y;
    };

    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Elementele lipite de ecran (ex. filtrele din Catalog) trebuie să stea SUB antet când acesta e vizibil și sus când
  // e ascuns — altfel antetul care reapare la derularea în sus se așază peste ele. Valoarea o citesc din CSS: var(--sticky-top).
  useEffect(() => {
    const root = document.documentElement;
    const visible = scrolled && !hidden;
    root.style.setProperty("--sticky-top", visible ? `${headerHeight + 16}px` : "1rem");
  }, [scrolled, hidden, headerHeight]);
  useEffect(() => {
    return () => {
      document.documentElement.style.removeProperty("--sticky-top");
    };
  }, []);

  return (
    // `sticky` (nu `fixed`): antetul rămâne în flux, deci nu mai există salt de layout la prima derulare și nici distanțier.
    // Ascunderea/arătarea e un translateY pe GPU, cu o curbă lentă la final (ca un „sertar” care alunecă), nu o animare a
    // proprietății `top`, care se redesena la fiecare cadru și părea „sacadată”. Ținem și umbra animată.
    <div
      ref={headerRef}
      className={`sticky top-0 z-50 will-change-transform transition-[transform,box-shadow] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ${
        scrolled ? "shadow-md" : "shadow-none"
      }`}
      style={{ transform: hidden ? "translate3d(0,-100%,0)" : "translate3d(0,0,0)" }}
    >
      <StickyHeader {...props} />
    </div>
  );
}
