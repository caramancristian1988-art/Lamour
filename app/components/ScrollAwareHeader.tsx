"use client";

import { useEffect, useRef, useState } from "react";
import type { SectionFlags, HeaderCategory } from "@/lib/siteSettings";
import StickyHeader from "./StickyHeader";

export default function ScrollAwareHeader(props: Partial<SectionFlags> & { categories?: HeaderCategory[] }) {
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [headerHeight, setHeaderHeight] = useState(0);
  const headerRef = useRef<HTMLDivElement>(null);
  const lastScrollY = useRef(0);

  useEffect(() => {
    // Capture header height for the spacer
    if (headerRef.current) {
      setHeaderHeight(headerRef.current.offsetHeight);
    }

    const onScroll = () => {
      const currentScrollY = window.scrollY;
      setScrolled(currentScrollY > 0);

      if (currentScrollY <= headerHeight) {
        // Always show near the top — avoids jitter right at the boundary
        setHidden(false);
      } else if (currentScrollY > lastScrollY.current) {
        setHidden(true); // scrolling down
      } else if (currentScrollY < lastScrollY.current) {
        setHidden(false); // scrolling up
      }

      lastScrollY.current = currentScrollY;
    };

    // Set initial state
    onScroll();

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [headerHeight]);

  return (
    <>
      {/* Static above hero at scroll 0, fixed at top when scrolled — slides
          out of view on scroll-down, slides back in on scroll-up. Animated
          via `top` (not `transform`) because a transform on this wrapper
          would turn it into a containing block for any `position: fixed`
          descendants (the categories dropdown backdrop, mobile menu drawer),
          breaking them — they'd be confined to this box instead of the
          viewport. */}
      <div
        ref={headerRef}
        className={`transition-[top] duration-300 ${scrolled ? "fixed left-0 right-0 z-50 shadow-md" : "static z-40"}`}
        style={scrolled ? { top: hidden ? -headerHeight : 0 } : undefined}
      >
        <StickyHeader {...props} />
      </div>

      {/* Spacer keeps layout stable when header becomes fixed */}
      {scrolled && <div style={{ height: headerHeight }} aria-hidden />}
    </>
  );
}
