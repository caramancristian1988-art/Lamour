"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

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

function CategoryIcon({ slug }: { slug: string }) {
  switch (slug) {
    case "conditioane-rezidentiale":
      return (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
          <rect x="3" y="5" width="18" height="6" rx="1.5" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M7 14v2M11 14v2M15 14v3M7 19h10" />
        </svg>
      );
    case "conditioane-comerciale":
      return (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 21h18M5 21V7l7-4 7 4v14M9 21v-6h6v6M9 11h.01M9 15h.01M15 11h.01M15 15h.01" />
        </svg>
      );
    case "sisteme-multisplit":
      return (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
          <rect x="3" y="3" width="7" height="7" rx="1" />
          <rect x="14" y="3" width="7" height="7" rx="1" />
          <rect x="3" y="14" width="7" height="7" rx="1" />
          <rect x="14" y="14" width="7" height="7" rx="1" />
        </svg>
      );
    case "conditioane-portabile":
      return (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
          <rect x="3" y="7" width="18" height="13" rx="2" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V5a2 2 0 012-2h4a2 2 0 012 2v2M7 12h2m6 0h2" />
        </svg>
      );
    case "accesorii-consumabile":
      return (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M14.7 6.3a1 1 0 000-1.4l-2.6-2.6a1 1 0 00-1.4 0L9.3 3.7l4 4 1.4-1.4zM7.9 5.1L2 11v4h4l5.9-5.9-4-4zM17 17l4 4" />
        </svg>
      );
    default:
      return (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
          <rect x="3" y="6" width="18" height="13" rx="2" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" />
        </svg>
      );
  }
}

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
                key={item.id}
                href={`/produse?cat=${item.slug}`}
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:text-[#c7092b] hover:bg-gray-50 transition-colors"
              >
                <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#f6f8fb] text-[#c7092b] shrink-0">
                  <CategoryIcon slug={item.slug} />
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
