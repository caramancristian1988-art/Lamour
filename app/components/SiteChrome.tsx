"use client";

import { usePathname } from "next/navigation";
import type { SectionFlags, HeaderCategory } from "@/lib/siteSettings";
import TopBar from "./TopBar";
import ScrollAwareHeader from "./ScrollAwareHeader";
import Footer from "./Footer";
import FloatingContact from "./FloatingContact";
import DiscountPopup from "./DiscountPopup";

export function SiteHeader(props: Partial<SectionFlags> & { categories?: HeaderCategory[] }) {
  const pathname = usePathname();
  if (pathname?.startsWith("/admin")) return null;

  return (
    <>
      <TopBar />
      <ScrollAwareHeader {...props} />
    </>
  );
}

export function SiteFooter() {
  const pathname = usePathname();
  if (pathname?.startsWith("/admin")) return null;

  return <Footer />;
}

export function SiteFloatingContact() {
  const pathname = usePathname();
  if (pathname?.startsWith("/admin")) return null;

  return <FloatingContact />;
}

export function SiteDiscountPopup() {
  return <DiscountPopup />;
}
