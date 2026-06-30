"use client";

import { usePathname } from "next/navigation";
import type { SectionFlags, HeaderCategory, SocialLinks, ContactInfo } from "@/lib/siteSettings";
import TopBar from "./TopBar";
import ScrollAwareHeader from "./ScrollAwareHeader";
import Footer from "./Footer";
import FloatingContact from "./FloatingContact";
import DiscountPopup from "./DiscountPopup";

export function SiteHeader(props: Partial<SectionFlags> & { categories?: HeaderCategory[] } & Partial<ContactInfo>) {
  const pathname = usePathname();
  if (pathname?.startsWith("/admin")) return null;

  return (
    <>
      <TopBar phone={props.phone} phoneTel={props.phoneTel} email={props.email} />
      <ScrollAwareHeader {...props} />
    </>
  );
}

export function SiteFooter(props: Partial<SocialLinks>) {
  const pathname = usePathname();
  if (pathname?.startsWith("/admin")) return null;

  return <Footer {...props} />;
}

export function SiteFloatingContact(props: Partial<ContactInfo>) {
  const pathname = usePathname();
  if (pathname?.startsWith("/admin")) return null;

  return <FloatingContact phone={props.phone} phoneTel={props.phoneTel} phoneDigits={props.phoneDigits} />;
}

export function SiteDiscountPopup() {
  return <DiscountPopup />;
}
