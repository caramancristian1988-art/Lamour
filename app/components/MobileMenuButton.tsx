"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, Phone } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetClose } from "@/app/components/ui/sheet";
import type { SectionFlags } from "@/lib/siteSettings";
import { Logo } from "@/app/components/Logo";
import { SITE_SHORT_NAME } from "@/lib/constants";
import AccessibilityToggle from "./AccessibilityToggle";

const baseNavLinks = [
  { href: "/blog", label: "Blog", flag: "blogEnabled" as const },
  { href: "/contact", label: "Contact", flag: "contactEnabled" as const },
];

export default function MobileMenuButton({
  produseEnabled = true,
  despreEnabled = true,
  blogEnabled = true,
  contactEnabled = true,
  phone,
  phoneTel,
}: Partial<SectionFlags> & { phone?: string; phoneTel?: string }) {
  const flags = { produseEnabled, despreEnabled, blogEnabled, contactEnabled };
  const navLinks = baseNavLinks.filter((l) => flags[l.flag]);
  const [open, setOpen] = useState(false);

  function closeMenu() {
    setOpen(false);
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button
          className="flex items-center justify-center w-10 h-10 min-[430px]:w-11 min-[430px]:h-11 rounded-xl text-foreground hover:bg-muted transition-colors"
          aria-label="Meniu"
        >
          <Menu className="w-6 h-6" aria-hidden />
        </button>
      </SheetTrigger>
      <SheetContent side="right" className="lg:hidden w-full max-w-sm p-0 flex flex-col">
        <SheetHeader className="p-5 border-b border-border">
          <SheetTitle className="flex items-center gap-2.5">
            <Logo size={32} />
            <span className="text-primary">{SITE_SHORT_NAME}</span>
          </SheetTitle>
        </SheetHeader>

        <nav className="flex-1 overflow-y-auto px-2 py-3" aria-label="Meniu principal">
          {despreEnabled && (
            <SheetClose asChild>
              <Link href="/despre" className="block px-3 py-3.5 rounded-xl text-primary hover:bg-muted hover:text-accent transition-colors text-base font-bold">
                Despre noi
              </Link>
            </SheetClose>
          )}

          {produseEnabled && (
            <SheetClose asChild>
              <Link href="/produse" className="block px-3 py-3.5 rounded-xl text-primary hover:bg-muted hover:text-accent transition-colors text-base font-bold">
                Catalog
              </Link>
            </SheetClose>
          )}

          {navLinks.map((link) => (
            <SheetClose asChild key={link.href}>
              <Link href={link.href} className="block px-3 py-3.5 rounded-xl text-primary hover:bg-muted hover:text-accent transition-colors text-base font-bold">
                {link.label}
              </Link>
            </SheetClose>
          ))}
        </nav>

        <div className="px-5 py-4 border-t border-border shrink-0 flex flex-col gap-2">
          <AccessibilityToggle className="justify-center border border-border" />
          {/* Numărul vine din Setări (ca în bara de sus și footer) — înainte era un număr fals scris în cod (+000 00 000 000). */}
          {phone && phoneTel && (
            <a
              href={`tel:${phoneTel}`}
              onClick={closeMenu}
              className="flex items-center justify-center gap-2 bg-accent hover:bg-brand-red-dark text-white font-bold py-3.5 rounded-xl transition-colors text-sm uppercase tracking-wide"
            >
              <Phone className="w-4 h-4" aria-hidden />
              {phone}
            </a>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
