"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, ChevronDown, Phone } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetClose } from "@/app/components/ui/sheet";
import type { SectionFlags } from "@/lib/siteSettings";
import { Logo } from "@/app/components/Logo";
import { SITE_SHORT_NAME } from "@/lib/constants";
import AccessibilityToggle from "./AccessibilityToggle";

const produseDropdown = [
  { href: "/produse", label: "Produse din hârtie" },
  { href: "/mobila", label: "Mobilă" },
  { href: "/productie-la-comanda", label: "Ambalaje" },
  { href: "/produse?oferte=1", label: "Oferte speciale" },
];

const despreDropdown = [
  { href: "/despre#istorie", label: "Istorie" },
  { href: "/despre#misiune", label: "Misiune" },
  { href: "/despre#misiune-sociala", label: "Misiune socială" },
  { href: "/productie", label: "Producție" },
];

const baseNavLinks = [
  { href: "/blog", label: "Noutăți", flag: "blogEnabled" as const },
  { href: "/contact", label: "Contact", flag: "contactEnabled" as const },
];

function MobileDropdownGroup({
  label,
  href,
  items,
  open,
  onToggle,
  ariaLabel,
}: {
  label: string;
  href: string;
  items: { href: string; label: string }[];
  open: boolean;
  onToggle: () => void;
  ariaLabel: string;
}) {
  return (
    <div>
      <div className="flex items-center rounded-xl hover:bg-muted transition-colors">
        <SheetClose asChild>
          <Link href={href} className="flex-1 px-3 py-3.5 text-primary hover:text-accent transition-colors text-base font-bold">
            {label}
          </Link>
        </SheetClose>
        <button
          onClick={onToggle}
          aria-label={ariaLabel}
          aria-expanded={open}
          className="px-3 py-3.5 text-primary hover:text-accent transition-colors"
        >
          <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${open ? "rotate-180" : ""}`} aria-hidden />
        </button>
      </div>
      <div className={`overflow-hidden transition-all duration-200 ${open ? "max-h-96" : "max-h-0"}`}>
        <div className="flex flex-col pb-1">
          {items.map((item) => (
            <SheetClose asChild key={item.href}>
              <Link href={item.href} className="px-6 py-2.5 rounded-lg text-sm text-muted-foreground hover:bg-muted hover:text-accent transition-colors">
                {item.label}
              </Link>
            </SheetClose>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function MobileMenuButton({
  produseEnabled = true,
  despreEnabled = true,
  blogEnabled = true,
  contactEnabled = true,
}: Partial<SectionFlags>) {
  const flags = { produseEnabled, despreEnabled, blogEnabled, contactEnabled };
  const navLinks = baseNavLinks.filter((l) => flags[l.flag]);
  const [open, setOpen] = useState(false);
  const [despreOpen, setDespreOpen] = useState(false);
  const [produseOpen, setProduseOpen] = useState(false);

  function closeMenu() {
    setOpen(false);
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button
          className="flex items-center justify-center w-11 h-11 rounded-xl text-foreground hover:bg-muted transition-colors"
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
            <MobileDropdownGroup
              label="Despre noi"
              href="/despre"
              items={despreDropdown}
              open={despreOpen}
              onToggle={() => setDespreOpen((v) => !v)}
              ariaLabel="Arată secțiunile despre companie"
            />
          )}

          {produseEnabled && (
            <MobileDropdownGroup
              label="Produse"
              href="/produse"
              items={produseDropdown}
              open={produseOpen}
              onToggle={() => setProduseOpen((v) => !v)}
              ariaLabel="Arată categoriile de produse"
            />
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
          <a
            href="tel:+00000000000"
            onClick={closeMenu}
            className="flex items-center justify-center gap-2 bg-accent hover:bg-brand-red-dark text-white font-bold py-3.5 rounded-xl transition-colors text-sm uppercase tracking-wide"
          >
            <Phone className="w-4 h-4" aria-hidden />
            +000 00 000 000
          </a>
        </div>
      </SheetContent>
    </Sheet>
  );
}
