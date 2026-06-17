"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import FavoritesBadge from "./FavoritesBadge";
import CartBadge from "./CartBadge";

const productsDropdown = [
  { href: "/produse/conditioane-rezidentiale", label: "Condiționere rezidențiale" },
  { href: "/produse/conditioane-comerciale", label: "Condiționere comerciale" },
  { href: "/produse/sisteme-multisplit", label: "Sisteme multisplit" },
  { href: "/produse/conditioane-portabile", label: "Condiționere portabile" },
  { href: "/produse/accesorii-consumabile", label: "Accesorii și consumabile" },
];

const servicesDropdown = [
  { href: "/servicii/instalare", label: "Instalare" },
  { href: "/servicii/mentenanta", label: "Mentenanță" },
  { href: "/servicii/diagnosticare", label: "Diagnosticare & Reparații" },
  { href: "/servicii/consultanta", label: "Consultanță" },
  { href: "/servicii/multisplit", label: "Sisteme multisplit" },
  { href: "/servicii/comerciale", label: "Sisteme comerciale HVAC" },
];

const navLinks = [
  { href: "/despre", label: "Despre noi" },
  { href: "/blog", label: "Blog" },
  { href: "/contact", label: "Contact" },
];

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      className={`w-4 h-4 shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      viewBox="0 0 24 24"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  );
}

export default function MobileMenuButton() {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [produseOpen, setProduseOpen] = useState(false);
  const [serviciiOpen, setServiciiOpen] = useState(false);

  function openMenu() {
    setMounted(true);
    requestAnimationFrame(() => requestAnimationFrame(() => setOpen(true)));
  }

  function closeMenu() {
    setOpen(false);
    setProduseOpen(false);
    setServiciiOpen(false);
  }

  useEffect(() => {
    if (!open && mounted) {
      const timeout = setTimeout(() => setMounted(false), 300);
      return () => clearTimeout(timeout);
    }
  }, [open, mounted]);

  useEffect(() => {
    if (!mounted) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mounted]);

  return (
    <>
      <button
        onClick={openMenu}
        className="relative flex items-center justify-center w-9 h-9 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
        aria-label="Meniu"
        aria-expanded={open}
      >
        <span className="relative flex flex-col items-center justify-center w-5 h-5">
          <span
            className={`absolute h-0.5 w-5 bg-current rounded-full transition-all duration-300 ease-in-out ${
              open ? "rotate-45" : "-translate-y-1.5"
            }`}
          />
          <span
            className={`absolute h-0.5 w-5 bg-current rounded-full transition-all duration-300 ease-in-out ${
              open ? "opacity-0 scale-x-0" : "opacity-100 scale-x-100"
            }`}
          />
          <span
            className={`absolute h-0.5 w-5 bg-current rounded-full transition-all duration-300 ease-in-out ${
              open ? "-rotate-45" : "translate-y-1.5"
            }`}
          />
        </span>
      </button>

      {mounted && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div
            className={`absolute inset-0 bg-black/50 transition-opacity duration-300 ${open ? "opacity-100" : "opacity-0"}`}
            onClick={closeMenu}
            aria-hidden
          />

          <div
            className={`absolute inset-x-0 top-0 w-full max-h-[85vh] bg-white shadow-2xl flex flex-col transition-transform duration-300 ease-out ${
              open ? "translate-y-0" : "-translate-y-full"
            }`}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 shrink-0">
              <Link href="/" onClick={closeMenu} className="flex items-center gap-2">
                <div className="w-8 h-8 shrink-0">
                  <Image src="/Untitled-2.png" alt="Climat Rapid logo" width={32} height={32} className="w-full h-full object-contain" />
                </div>
                <span className="text-base font-extrabold text-[#1d2353] tracking-tight uppercase leading-none">
                  Climat <span className="text-[#c7092b]">Rapid</span>
                </span>
              </Link>
              <button onClick={closeMenu} aria-label="Închide meniul" className="group text-gray-400 hover:text-[#c7092b] transition-colors p-1">
                <svg
                  className="w-5 h-5 transition-transform duration-300 group-hover:rotate-90"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              {/* Quick access */}
              <div className="grid grid-cols-3 divide-x divide-gray-100 border-b border-gray-100">
                <Link href="/cont" onClick={closeMenu} className="flex flex-col items-center gap-1.5 py-4 text-gray-600 hover:text-[#c7092b] hover:bg-gray-50 transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" />
                  </svg>
                  <span className="text-[11px] font-bold">Cont</span>
                </Link>
                <Link href="/favorite" onClick={closeMenu} className="relative flex flex-col items-center gap-1.5 py-4 text-gray-600 hover:text-[#c7092b] hover:bg-gray-50 transition-colors">
                  <span className="relative">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                    <FavoritesBadge className="absolute -top-1.5 -right-2 w-4 h-4 bg-[#c7092b] rounded-full text-white text-[9px] font-bold flex items-center justify-center" />
                  </span>
                  <span className="text-[11px] font-bold">Favorite</span>
                </Link>
                <Link href="/cos" onClick={closeMenu} className="relative flex flex-col items-center gap-1.5 py-4 text-gray-600 hover:text-[#c7092b] hover:bg-gray-50 transition-colors">
                  <span className="relative">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <CartBadge className="absolute -top-1.5 -right-2 w-4 h-4 bg-[#c7092b] rounded-full text-white text-[9px] font-bold flex items-center justify-center" />
                  </span>
                  <span className="text-[11px] font-bold">Coș</span>
                </Link>
              </div>

              {/* Nav */}
              <nav className="flex flex-col px-2 py-2">
                <Link
                  href="/"
                  onClick={closeMenu}
                  className="px-3 py-3.5 rounded-lg text-[#1d2353] hover:bg-gray-50 hover:text-[#c7092b] transition-colors text-[15px] font-bold"
                >
                  Acasă
                </Link>

                <div>
                  <button
                    onClick={() => setProduseOpen((v) => !v)}
                    className="w-full flex items-center justify-between px-3 py-3.5 rounded-lg text-[#1d2353] hover:bg-gray-50 hover:text-[#c7092b] transition-colors text-[15px] font-bold"
                  >
                    Produse
                    <ChevronIcon open={produseOpen} />
                  </button>
                  <div className={`overflow-hidden transition-all duration-200 ${produseOpen ? "max-h-96" : "max-h-0"}`}>
                    <div className="flex flex-col pb-1">
                      {productsDropdown.map((item) => (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={closeMenu}
                          className="px-6 py-2.5 rounded-lg text-sm text-gray-600 hover:bg-gray-50 hover:text-[#c7092b] transition-colors"
                        >
                          {item.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <button
                    onClick={() => setServiciiOpen((v) => !v)}
                    className="w-full flex items-center justify-between px-3 py-3.5 rounded-lg text-[#1d2353] hover:bg-gray-50 hover:text-[#c7092b] transition-colors text-[15px] font-bold"
                  >
                    Servicii
                    <ChevronIcon open={serviciiOpen} />
                  </button>
                  <div className={`overflow-hidden transition-all duration-200 ${serviciiOpen ? "max-h-96" : "max-h-0"}`}>
                    <div className="flex flex-col pb-1">
                      {servicesDropdown.map((item) => (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={closeMenu}
                          className="px-6 py-2.5 rounded-lg text-sm text-gray-600 hover:bg-gray-50 hover:text-[#c7092b] transition-colors"
                        >
                          {item.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>

                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={closeMenu}
                    className="px-3 py-3.5 rounded-lg text-[#1d2353] hover:bg-gray-50 hover:text-[#c7092b] transition-colors text-[15px] font-bold"
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
            </div>

            {/* Footer CTA */}
            <div className="px-5 py-4 border-t border-gray-100 shrink-0">
              <a
                href="tel:+37369000000"
                className="flex items-center justify-center gap-2 bg-[#c7092b] hover:bg-[#a5071f] text-white font-bold py-3 rounded-xl transition-colors text-sm uppercase tracking-wide"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" />
                </svg>
                +373 69 000 000
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
