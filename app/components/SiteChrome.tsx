"use client";

import { Suspense } from "react";
import { usePathname } from "next/navigation";
import type { SectionFlags, HeaderCategory, SocialLinks, ContactInfo, PopupColors } from "@/lib/siteSettings";
import TopBar from "./TopBar";
import ScrollAwareHeader from "./ScrollAwareHeader";
import OrnamentalBorder from "./OrnamentalBorder";
import Footer from "./Footer";
import FloatingContact from "./FloatingContact";
import DiscountPopup from "./DiscountPopup";

// Pagini fără antetul/subsolul site-ului: admin și fișa de comandă pentru tipărire.
function isChromeHidden(pathname: string | null): boolean {
  return Boolean(pathname?.startsWith("/admin") || pathname?.startsWith("/comanda-print"));
}

export function SiteHeader(props: Partial<SectionFlags> & { categories?: HeaderCategory[] } & Partial<ContactInfo>) {
  const pathname = usePathname();
  if (isChromeHidden(pathname)) return null;

  return (
    <>
      <TopBar phone={props.phone} phoneTel={props.phoneTel} email={props.email} />
      {/* NavDropdown/AllCategoriesMenu (nested inside) use useSearchParams,
          which requires a Suspense boundary or it breaks static prerendering
          site-wide. */}
      <Suspense fallback={<div className="h-[196px] lg:h-[236px] bg-card" />}>
        <ScrollAwareHeader {...props} />
      </Suspense>
      <OrnamentalBorder />
    </>
  );
}

export function SiteFooter(props: Partial<SocialLinks> & Partial<ContactInfo>) {
  const pathname = usePathname();
  if (isChromeHidden(pathname)) return null;

  return <Footer {...props} />;
}

export function SiteFloatingContact(props: Partial<ContactInfo>) {
  const pathname = usePathname();
  if (isChromeHidden(pathname)) return null;

  return <FloatingContact phone={props.phone} phoneTel={props.phoneTel} phoneDigits={props.phoneDigits} />;
}

export function SiteDiscountPopup(props: Partial<PopupColors>) {
  const pathname = usePathname();
  if (isChromeHidden(pathname)) return null;

  return <DiscountPopup buttonColor={props.buttonColor ?? null} bannerColor={props.bannerColor ?? null} />;
}
