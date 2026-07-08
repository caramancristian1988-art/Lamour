"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, ChevronDown, Phone } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetClose } from "@/app/components/ui/sheet";
import type { SectionFlags } from "@/lib/siteSettings";
import { Logo } from "@/app/components/Logo";
import { SITE_SHORT_NAME } from "@/lib/constants";

const productsDropdown = [
  { href: "/produse?cat=categorie-1", label: "Categoria unu" },
  { href: "/produse?cat=categorie-2", label: "Categoria doi" },
  { href: "/produse?cat=categorie-3", label: "Categoria trei" },
];

const baseNavLinks = [
  { href: "/proiecte", label: "Proiecte", flag: "proiecteEnabled" as const },
  { href: "/despre", label: "Despre noi", flag: "despreEnabled" as const },
  { href: "/blog", label: "Noutăți", flag: "blogEnabled" as const },
  { href: "/contact", label: "Contact", flag: "contactEnabled" as const },
];

export default function MobileMenuButton({
  produseEnabled = true,
  proiecteEnabled = true,
  despreEnabled = true,
  blogEnabled = true,
  contactEnabled = true,
}: Partial<SectionFlags>) {
  const flags = { produseEnabled, proiecteEnabled, despreEnabled, blogEnabled, contactEnabled };
  const navLinks = baseNavLinks.filter((l) => flags[l.flag]);
  const [open, setOpen] = useState(false);
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
          {produseEnabled && (
            <div>
              <div className="flex items-center rounded-xl hover:bg-muted transition-colors">
                <SheetClose asChild>
                  <Link href="/produse" className="flex-1 px-3 py-3.5 text-primary hover:text-accent transition-colors text-base font-bold">
                    Produse
                  </Link>
                </SheetClose>
                <button
                  onClick={() => setProduseOpen((v) => !v)}
                  aria-label="Arată categoriile de produse"
                  aria-expanded={produseOpen}
                  className="px-3 py-3.5 text-primary hover:text-accent transition-colors"
                >
                  <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${produseOpen ? "rotate-180" : ""}`} aria-hidden />
                </button>
              </div>
              <div className={`overflow-hidden transition-all duration-200 ${produseOpen ? "max-h-96" : "max-h-0"}`}>
                <div className="flex flex-col pb-1">
                  {productsDropdown.map((item) => (
                    <SheetClose asChild key={item.href}>
                      <Link href={item.href} className="px-6 py-2.5 rounded-lg text-sm text-muted-foreground hover:bg-muted hover:text-accent transition-colors">
                        {item.label}
                      </Link>
                    </SheetClose>
                  ))}
                </div>
              </div>
            </div>
          )}

          {produseEnabled && (
            <SheetClose asChild>
              <Link href="/produse?oferte=1" className="block px-3 py-3.5 rounded-xl text-primary hover:bg-muted hover:text-accent transition-colors text-base font-bold">
                Oferte
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

        <div className="px-5 py-4 border-t border-border shrink-0">
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
