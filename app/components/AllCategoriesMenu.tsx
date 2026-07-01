"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";

export interface CategoryLink {
  id: string;
  slug: string;
  name: string;
  image: string | null;
}

const fallbackCategories: CategoryLink[] = [
  { id: "conditioane-rezidentiale", slug: "conditioane-rezidentiale", name: "Condiționere rezidențiale", image: null },
  { id: "conditioane-comerciale", slug: "conditioane-comerciale", name: "Condiționere comerciale", image: null },
  { id: "sisteme-multisplit", slug: "sisteme-multisplit", name: "Sisteme multisplit", image: null },
  { id: "conditioane-portabile", slug: "conditioane-portabile", name: "Condiționere portabile", image: null },
  { id: "accesorii-consumabile", slug: "accesorii-consumabile", name: "Accesorii și consumabile", image: null },
];

interface Props {
  className?: string;
  buttonClassName?: string;
  label?: string;
  categories?: CategoryLink[];
}

export default function AllCategoriesMenu({ className, buttonClassName, label = "Toate categoriile", categories }: Props) {
  const productsDropdown = categories && categories.length > 0 ? categories : fallbackCategories;
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const justOpenedRef = useRef(false);

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
          onPointerDown={() => {
            if (!open) {
              justOpenedRef.current = true;
              setOpen(true);
            }
          }}
          onClick={() => {
            if (justOpenedRef.current) {
              justOpenedRef.current = false;
              return;
            }
            setOpen((v) => !v);
          }}
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
          <div className="absolute top-full left-0 mt-2 bg-white rounded-xl shadow-2xl border border-gray-100 py-3 w-[calc(100vw-2rem)] max-w-md lg:w-96 max-h-[70vh] overflow-y-auto overscroll-contain">
            <p className="px-5 pt-1.5 pb-2 text-xs font-bold text-gray-400 uppercase tracking-wide">Produse</p>
            <Link
              href="/produse?oferte=1"
              onClick={() => setOpen(false)}
              className="flex items-center gap-4 px-5 py-3 text-base font-bold text-[#c7092b] hover:bg-gray-50 transition-colors"
            >
              <span className="relative w-14 h-14 rounded-xl bg-[#f6f8fb] overflow-hidden shrink-0 flex items-center justify-center">
                <svg className="w-7 h-7 text-[#c7092b] -rotate-12" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.169.659 1.591l9.581 9.581c.699.699 1.831.699 2.53 0l7.182-7.182a1.79 1.79 0 000-2.53L13.16 3.659A2.25 2.25 0 0011.568 3H9.568z" />
                  <circle cx="6.75" cy="6.75" r="1.1" fill="#f6f8fb" />
                </svg>
              </span>
              Oferte Speciale
            </Link>
            {productsDropdown.map((item) => (
              <Link
                key={item.id}
                href={`/produse?cat=${item.slug}`}
                onClick={() => setOpen(false)}
                className="flex items-center gap-4 px-5 py-3 text-base font-semibold text-gray-700 hover:text-[#c7092b] hover:bg-gray-50 transition-colors"
              >
                <span className="relative w-14 h-14 rounded-xl bg-[#f6f8fb] overflow-hidden shrink-0">
                  {item.image ? (
                    <Image src={item.image} alt={item.name} fill className="object-cover" />
                  ) : (
                    <svg className="w-6 h-6 text-gray-300 absolute inset-0 m-auto" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20 8H4a2 2 0 00-2 2v8a2 2 0 002 2h16a2 2 0 002-2v-8a2 2 0 00-2-2zM4 6h16V4H4v2z" />
                    </svg>
                  )}
                </span>
                {item.name}
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
