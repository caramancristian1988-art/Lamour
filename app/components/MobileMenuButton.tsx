"use client";

import { useState } from "react";
import Link from "next/link";

const navLinks = [
  { href: "/", label: "Acasă" },
  { href: "/produse", label: "Produse" },
  { href: "/servicii", label: "Servicii" },
  { href: "/despre", label: "Despre noi" },
  { href: "/blog", label: "Blog" },
  { href: "/contact", label: "Contact" },
];

export default function MobileMenuButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-center w-9 h-9 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
        aria-label="Meniu"
        aria-expanded={open}
      >
        {open ? (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        )}
      </button>

      {open && (
        <div className="lg:hidden absolute top-full left-0 right-0 bg-[#1d2353] border-t border-white/10 py-4 px-4 shadow-xl z-50">
          <nav className="flex flex-col gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="px-4 py-3 rounded-lg text-white/90 hover:text-white hover:bg-white/10 transition-colors text-sm font-medium"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </>
  );
}
