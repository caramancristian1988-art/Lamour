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

      <div
        className={`lg:hidden absolute top-full left-0 right-0 bg-[#1d2353] border-t border-white/10 px-4 shadow-xl z-50 overflow-hidden transition-all duration-300 ease-in-out ${
          open ? "max-h-96 opacity-100 py-4" : "max-h-0 opacity-0 py-0"
        }`}
      >
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
    </>
  );
}
