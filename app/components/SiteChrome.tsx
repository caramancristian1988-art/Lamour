"use client";

import { usePathname } from "next/navigation";
import type { SectionFlags } from "@/lib/siteSettings";
import TopBar from "./TopBar";
import ScrollAwareHeader from "./ScrollAwareHeader";
import Footer from "./Footer";

export function SiteHeader(sectionFlags: Partial<SectionFlags>) {
  const pathname = usePathname();
  if (pathname?.startsWith("/admin")) return null;

  return (
    <>
      <TopBar />
      <ScrollAwareHeader {...sectionFlags} />
    </>
  );
}

export function SiteFooter() {
  const pathname = usePathname();
  if (pathname?.startsWith("/admin")) return null;

  return <Footer />;
}
