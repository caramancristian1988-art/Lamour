"use client";

import { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { Menu, Phone, X } from "lucide-react";
import type { SectionFlags } from "@/lib/siteSettings";
import AccessibilityToggle from "./AccessibilityToggle";

const baseNavLinks = [
  { href: "/blog", label: "Blog", flag: "blogEnabled" as const },
  { href: "/contact", label: "Contact", flag: "contactEnabled" as const },
];

const linkClass =
  "flex items-center justify-between rounded-xl px-4 py-3.5 text-base font-bold text-primary transition-colors hover:bg-muted hover:text-accent active:bg-muted";

// Meniul de pe telefon / tabletă: se desfășoară ÎN JOS, chiar sub bara de navigare (nu mai alunecă din dreapta peste
// pagină). Panoul stă în interiorul antetului (absolute, top-full), deci urmează antetul când acesta se ascunde / apare
// la derulare. Pagina de sub el se întunecă ușor; o atingere pe fundal, Escape sau derularea îl închid.
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
  const panelId = useId();
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const startY = window.scrollY;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    // Derulezi pagina cu meniul deschis -> se închide (altfel ar rămâne agățat peste conținut).
    const onScroll = () => {
      if (Math.abs(window.scrollY - startY) > 40) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("scroll", onScroll);
    };
  }, [open]);

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls={panelId}
        aria-label={open ? "Închide meniul" : "Meniu"}
        className="flex items-center justify-center w-9 h-10 min-[360px]:w-10 min-[430px]:w-11 min-[430px]:h-11 rounded-xl text-foreground hover:bg-muted transition-colors"
      >
        {open ? <X className="w-6 h-6" aria-hidden /> : <Menu className="w-6 h-6" aria-hidden />}
      </button>

      {/* Fundal întunecat sub antet: acoperă restul ecranului și închide meniul la atingere. */}
      {open && (
        <button
          type="button"
          tabIndex={-1}
          aria-hidden
          onClick={() => setOpen(false)}
          className="absolute inset-x-0 top-full z-30 h-screen cursor-default bg-black/45 animate-fade-in [animation-duration:0.2s]"
        />
      )}

      <div
        id={panelId}
        inert={!open}
        className={`absolute inset-x-0 top-full z-40 grid border-b border-border bg-card shadow-2xl transition-[grid-template-rows,opacity] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ${
          open ? "grid-rows-[1fr] opacity-100" : "pointer-events-none grid-rows-[0fr] opacity-0 border-b-0 shadow-none"
        }`}
      >
        <div className="overflow-hidden">
          <div className="mx-auto max-h-[calc(100vh-11rem)] max-w-2xl overflow-y-auto px-3 pb-4 pt-2">
            <nav aria-label="Meniu principal" className="flex flex-col">
              {despreEnabled && (
                <Link href="/despre" onClick={() => setOpen(false)} className={linkClass}>
                  Despre noi
                </Link>
              )}
              {produseEnabled && (
                <Link href="/produse" onClick={() => setOpen(false)} className={linkClass}>
                  Catalog
                </Link>
              )}
              {navLinks.map((link) => (
                <Link key={link.href} href={link.href} onClick={() => setOpen(false)} className={linkClass}>
                  {link.label}
                </Link>
              ))}
            </nav>

            <div className="mt-2 flex flex-col gap-2 border-t border-border px-1 pt-3 sm:flex-row">
              <AccessibilityToggle className="h-14 shrink-0 justify-center border-2 border-border sm:h-12 sm:flex-1" />
              {/* Numărul vine din Setări (ca în bara de sus și footer). */}
              {phone && phoneTel && (
                <a
                  href={`tel:${phoneTel}`}
                  onClick={() => setOpen(false)}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-accent py-3.5 text-sm font-bold uppercase tracking-wide text-white transition-colors hover:bg-brand-red-dark"
                >
                  <Phone className="h-4 w-4" aria-hidden />
                  {phone}
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
