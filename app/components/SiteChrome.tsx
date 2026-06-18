"use client";

import { usePathname } from "next/navigation";
import TopBar from "./TopBar";
import ScrollAwareHeader from "./ScrollAwareHeader";
import Footer from "./Footer";

export function SiteHeader({ proiecteEnabled = true }: { proiecteEnabled?: boolean }) {
  const pathname = usePathname();
  if (pathname?.startsWith("/admin")) return null;

  return (
    <>
      <TopBar />
      <ScrollAwareHeader proiecteEnabled={proiecteEnabled} />
    </>
  );
}

export function SiteFooter() {
  const pathname = usePathname();
  if (pathname?.startsWith("/admin")) return null;

  return <Footer />;
}
