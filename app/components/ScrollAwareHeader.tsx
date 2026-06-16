"use client";

import { useEffect, useRef, useState } from "react";
import StickyHeader from "./StickyHeader";

export default function ScrollAwareHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [headerHeight, setHeaderHeight] = useState(0);
  const headerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Capture header height for the spacer
    if (headerRef.current) {
      setHeaderHeight(headerRef.current.offsetHeight);
    }

    const onScroll = () => setScrolled(window.scrollY > 0);

    // Set initial state
    onScroll();

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      {/* Static above hero at scroll 0, fixed at top when scrolled */}
      <div
        ref={headerRef}
        className={
          scrolled
            ? "fixed top-0 left-0 right-0 z-50 shadow-md"
            : "static z-40"
        }
      >
        <StickyHeader />
      </div>

      {/* Spacer keeps layout stable when header becomes fixed */}
      {scrolled && <div style={{ height: headerHeight }} aria-hidden />}
    </>
  );
}
