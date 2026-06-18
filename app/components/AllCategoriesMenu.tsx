"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

const productsDropdown = [
  { href: "/produse?cat=conditioane-rezidentiale", label: "Condiționere rezidențiale" },
  { href: "/produse?cat=conditioane-comerciale", label: "Condiționere comerciale" },
  { href: "/produse?cat=sisteme-multisplit", label: "Sisteme multisplit" },
  { href: "/produse?cat=conditioane-portabile", label: "Condiționere portabile" },
  { href: "/produse?cat=accesorii-consumabile", label: "Accesorii și consumabile" },
];

const servicesDropdown = [
  { href: "/servicii/instalare", label: "Instalare" },
  { href: "/servicii/mentenanta", label: "Mentenanță" },
  { href: "/servicii/diagnosticare", label: "Diagnosticare & Reparații" },
  { href: "/servicii/consultanta", label: "Consultanță" },
  { href: "/servicii/multisplit", label: "Sisteme multisplit" },
  { href: "/servicii/comerciale", label: "Sisteme comerciale HVAC" },
];

interface Props {
  className?: string;
  buttonClassName?: string;
  label?: string;
}

export default function AllCategoriesMenu({ className, buttonClassName, label = "Toate categoriile" }: Props) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    function onClickOutside(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function onEscape(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", onClickOutside);
    document.addEventListener("keydown", onEscape);
    return () => {
      document.removeEventListener("mousedown", onClickOutside);
      document.removeEventListener("keydown", onEscape);
    };
  }, [open]);

  return (
    <>
      {/* Dimming overlay — everything except the menu fades behind it */}
      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-40 transition-opacity"
          onClick={() => setOpen(false)}
          aria-hidden
        />
      )}

      <div ref={rootRef} className={`relative z-50 ${className ?? "shrink-0"}`}>
        <button
          onClick={() => setOpen((v) => !v)}
          className={
            buttonClassName ??
            "flex items-center gap-2 bg-[#c7092b] hover:bg-[#a5071f] text-white text-sm font-bold px-5 py-3 rounded-xl transition-colors uppercase tracking-wide"
          }
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
          <span className="truncate">{label}</span>
          <svg className={`w-3 h-3 transition-transform ${open ? "rotate-180" : ""}`} fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {open && (
          <div className="absolute top-full left-0 mt-2 bg-white rounded-xl shadow-2xl border border-gray-100 py-2 w-72">
            <p className="px-4 pt-1.5 pb-2 text-[11px] font-bold text-gray-400 uppercase tracking-wide">Produse</p>
            <Link
              href="/produse?oferte=1"
              onClick={() => setOpen(false)}
              className="block px-4 py-2.5 text-sm font-bold text-[#c7092b] hover:bg-gray-50 transition-colors"
            >
              Oferte Speciale
            </Link>
            {productsDropdown.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="block px-4 py-2.5 text-sm text-gray-700 hover:text-[#c7092b] hover:bg-gray-50 transition-colors"
              >
                {item.label}
              </Link>
            ))}

            <div className="my-2 border-t border-gray-100" />

            <p className="px-4 pt-1.5 pb-2 text-[11px] font-bold text-gray-400 uppercase tracking-wide">Servicii</p>
            {servicesDropdown.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="block px-4 py-2.5 text-sm text-gray-700 hover:text-[#c7092b] hover:bg-gray-50 transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
