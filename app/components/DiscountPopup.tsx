"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { logPopupEvent } from "@/lib/popupStatActions";
import { getPopupProducts, getPopupCountdownMinutes } from "@/lib/popupProduct";
import { useFloatingUI } from "./FloatingUIState";
import { useCart } from "./CartProvider";

const SESSION_KEY = "discountPopupState";
const SHOW_DELAY_MS = 6000;
const ROTATE_INTERVAL_MS = 45000;
const STORY_INTERVAL_MS = 7000;
const STORY_COUNT = 5;
const HIDDEN_PATH_PREFIXES = ["/admin", "/cont", "/login", "/register", "/cos", "/produse/"];

export interface PopupProduct {
  slug: string;
  name: string;
  image: string | null;
  price: number;
  oldPrice: number | null;
  rating: number;
  reviewCount: number;
  review: { name: string; text: string; rating: number } | null;
  btu?: number | null;
  technology?: string | null;
  energyClass?: string | null;
  installmentsEnabled?: boolean;
}

interface StoredState {
  products: PopupProduct[];
  activeIndex: number;
  expiresAt: number;
  triggered: true;
}

function readStored(): StoredState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as StoredState) : null;
  } catch {
    return null;
  }
}

function writeStored(state: StoredState) {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(state));
}

function StarRating({ rating, animated }: { rating: number; animated?: boolean }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          style={animated ? { animationDelay: `${star * 90}ms`, animationFillMode: "backwards" } : undefined}
          className={`w-4 h-4 ${star <= Math.round(rating) ? "text-amber-400" : "text-gray-200"} ${
            animated ? "animate-star-pop" : ""
          }`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

export default function DiscountPopup() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [products, setProducts] = useState<PopupProduct[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [expiresAt, setExpiresAt] = useState<number | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [cycleKey, setCycleKey] = useState(0);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const swipedRef = useRef(false);
  const { contactMenuOpen } = useFloatingUI();
  const { addToCart } = useCart();

  // On mount: resume a still-running offer (minimized) from a previous page
  // in this session, or — if this session never triggered one — start the
  // normal first-visit delay before showing the full popup.
  useEffect(() => {
    const stored = readStored();
    if (stored) {
      const remaining = Math.round((stored.expiresAt - Date.now()) / 1000);
      if (remaining > 0) {
        setProducts(stored.products);
        setActiveIndex(stored.activeIndex);
        setExpiresAt(stored.expiresAt);
        setSecondsLeft(remaining);
        setMinimized(true);
      }
      return;
    }

    const timer = setTimeout(() => {
      Promise.all([getPopupProducts(STORY_COUNT), getPopupCountdownMinutes()]).then(([list, minutes]) => {
        if (!list || list.length === 0) return;
        const expiry = Date.now() + minutes * 60 * 1000;
        setProducts(list);
        setActiveIndex(0);
        setExpiresAt(expiry);
        setSecondsLeft(minutes * 60);
        setOpen(true);
      });
    }, SHOW_DELAY_MS);
    return () => clearTimeout(timer);
  }, []);

  // Persist whenever the offer set or position changes, so reopening or
  // navigating across pages resumes at the same story.
  useEffect(() => {
    if (products.length > 0 && expiresAt) {
      writeStored({ products, activeIndex, expiresAt, triggered: true });
    }
  }, [products, activeIndex, expiresAt]);

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // Single master countdown — survives minimizing/reopening/navigating
  // offers, and once it hits zero the widget disappears for the session.
  useEffect(() => {
    if (!expiresAt) return;
    const interval = setInterval(() => {
      const remaining = Math.round((expiresAt - Date.now()) / 1000);
      if (remaining <= 0) {
        setSecondsLeft(0);
        setOpen(false);
        setMinimized(false);
        setProducts([]);
        setExpiresAt(null);
        return;
      }
      setSecondsLeft(remaining);
    }, 1000);
    return () => clearInterval(interval);
  }, [expiresAt]);

  // While minimized, slowly cycle through the fetched offers for variety —
  // the ring around the icon fills up over ROTATE_INTERVAL_MS.
  useEffect(() => {
    if (!minimized || !expiresAt || products.length <= 1) return;
    const interval = setInterval(() => {
      setActiveIndex((i) => (i + 1) % products.length);
      setCycleKey((k) => k + 1);
    }, ROTATE_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [minimized, expiresAt, products.length]);

  // While the full popup is open, auto-advance through offers story-style —
  // the progress segment for the active offer fills over STORY_INTERVAL_MS.
  useEffect(() => {
    if (!open || products.length <= 1) return;
    const timer = setTimeout(() => {
      setActiveIndex((i) => (i + 1) % products.length);
    }, STORY_INTERVAL_MS);
    return () => clearTimeout(timer);
  }, [open, activeIndex, products.length]);

  if (products.length === 0) return null;
  if (HIDDEN_PATH_PREFIXES.some((p) => pathname?.startsWith(p))) return null;
  if (!open && !minimized) return null;

  const product = products[activeIndex];

  function close() {
    logPopupEvent(product.slug, "close");
    setOpen(false);
    setMinimized(true);
    setCycleKey((k) => k + 1);
  }

  function reopen() {
    setMinimized(false);
    setOpen(true);
  }

  function goTo(i: number) {
    setActiveIndex(((i % products.length) + products.length) % products.length);
  }

  const discount = product.oldPrice ? Math.round((1 - product.price / product.oldPrice) * 100) : null;
  const minutes = String(Math.floor(secondsLeft / 60)).padStart(2, "0");
  const seconds = String(secondsLeft % 60).padStart(2, "0");

  if (minimized) {
    return (
      <button
        onClick={reopen}
        aria-label="Revino la ofertă"
        className={`fixed right-5 z-[70] flex items-center gap-2 bg-[#c7092b] hover:bg-[#a5071f] text-white font-bold pl-2.5 pr-4 py-2.5 rounded-full shadow-2xl transition-all duration-300 hover:scale-105 animate-pop ${
          contactMenuOpen ? "bottom-[290px]" : "bottom-24"
        }`}
      >
        <span className="relative flex items-center justify-center w-7 h-7 shrink-0">
          <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 28 28">
            <circle cx="14" cy="14" r="12" fill="none" stroke="white" strokeOpacity="0.25" strokeWidth="2" />
            {products.length > 1 && (
              <circle
                key={cycleKey}
                cx="14"
                cy="14"
                r="12"
                fill="none"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                pathLength={1}
                strokeDasharray="1 1"
                style={{ animation: `popup-ring ${ROTATE_INTERVAL_MS}ms linear forwards` }}
              />
            )}
          </svg>
          <svg className="relative w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z" />
            <circle cx="7" cy="7" r="1.5" fill="currentColor" stroke="none" />
          </svg>
        </span>
        <span className="text-xs uppercase tracking-wide">
          {discount ? `Oferta ta -${discount}%` : "Oferta ta"}
        </span>
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70" onClick={close} aria-hidden />

      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
        {/* Stories-style progress bar */}
        {products.length > 1 && (
          <div className="absolute top-0 inset-x-0 z-20 flex gap-1 p-2.5">
            {products.map((_, i) => (
              <div key={i} className="h-1.5 flex-1 rounded-full bg-gray-200 overflow-hidden">
                {i < activeIndex ? (
                  <div className="h-full w-full bg-[#c7092b] rounded-full" />
                ) : i === activeIndex ? (
                  <div
                    key={activeIndex}
                    className="h-full bg-[#c7092b] rounded-full"
                    style={{ animation: `popup-story ${STORY_INTERVAL_MS}ms linear forwards` }}
                  />
                ) : null}
              </div>
            ))}
          </div>
        )}

        <button
          onClick={close}
          aria-label="Închide"
          className="absolute top-6 right-3 z-20 w-8 h-8 rounded-full bg-white shadow-lg border border-gray-100 text-gray-400 hover:text-[#c7092b] flex items-center justify-center transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Large product image — tap to view the product, replaces the old red banner */}
        <Link
          href={`/produse/${product.slug}`}
          onClick={(e) => {
            if (swipedRef.current) {
              e.preventDefault();
              swipedRef.current = false;
              return;
            }
            logPopupEvent(product.slug, "click");
            setOpen(false);
            setMinimized(true);
          }}
          className="relative block w-full h-[320px] sm:h-[380px] bg-white touch-pan-y"
          onTouchStart={(e) => setTouchStartX(e.touches[0].clientX)}
          onTouchEnd={(e) => {
            if (touchStartX === null) return;
            const deltaX = e.changedTouches[0].clientX - touchStartX;
            if (Math.abs(deltaX) > 40) {
              swipedRef.current = true;
              goTo(activeIndex + (deltaX < 0 ? 1 : -1));
            }
            setTouchStartX(null);
          }}
        >
          {product.image && (
            <Image key={activeIndex} src={product.image} alt={product.name} fill className="object-contain p-3" priority />
          )}

          {products.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  goTo(activeIndex - 1);
                }}
                aria-label="Oferta anterioară"
                className="absolute left-2 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-white shadow-lg border border-gray-100 text-[#1d2353] hover:text-[#c7092b] flex items-center justify-center transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  goTo(activeIndex + 1);
                }}
                aria-label="Oferta următoare"
                className="absolute right-2 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-white shadow-lg border border-gray-100 text-[#1d2353] hover:text-[#c7092b] flex items-center justify-center transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </>
          )}

          {discount && (
            <div className="absolute top-9 left-3 bg-[#c7092b] text-white text-sm font-extrabold px-3 py-1.5 rounded-full shadow-lg pointer-events-none">
              -{discount}%
            </div>
          )}

          <div className="absolute bottom-3 right-3 inline-flex items-center gap-1.5 bg-black/55 backdrop-blur-sm rounded-full px-3 py-1.5 text-white text-xs font-bold tabular-nums pointer-events-none">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="9" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 7v5l3 2" />
            </svg>
            {minutes}:{seconds}
          </div>
        </Link>

        <div className="p-5 sm:p-7">
          <div className="mb-4">
            <p className="text-base font-bold text-[#1d2353] leading-snug line-clamp-2">{product.name}</p>
            <div className="flex items-center gap-1.5 mt-1.5">
              <StarRating rating={product.rating} animated />
              <span className="text-sm text-gray-400">({product.reviewCount})</span>
            </div>

            {/* Caracteristici */}
            {(() => {
              const specs = [
                product.btu ? `${(product.btu / 1000).toFixed(0)}000 BTU` : null,
                product.technology || null,
                product.energyClass ? `Clasa ${product.energyClass}` : null,
              ].filter(Boolean) as string[];
              return specs.length > 0 ? (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {specs.map((s) => (
                    <span key={s} className="text-[11px] font-semibold bg-[#f0f2f8] text-[#1d2353] px-2.5 py-1 rounded-full">
                      {s}
                    </span>
                  ))}
                </div>
              ) : null;
            })()}

            {/* Rate */}
            {product.installmentsEnabled !== false && (
              <div className="inline-flex items-center gap-1.5 bg-[#eef1fb] rounded-full px-2.5 py-1 mt-2">
                <span className="bg-[#1d2353] text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded-full uppercase tracking-wide">
                  Rate
                </span>
                <span className="text-[10px] font-bold text-[#1d2353]">
                  de la {Math.ceil(product.price / 4).toLocaleString("ro-MD")} lei/lună
                </span>
              </div>
            )}

            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <span className="text-2xl font-extrabold text-[#c7092b]">
                {product.price.toLocaleString("ro-MD")} MDL
              </span>
              {product.oldPrice && (
                <span className="text-sm text-gray-400 line-through">
                  {product.oldPrice.toLocaleString("ro-MD")} MDL
                </span>
              )}
            </div>
            {product.oldPrice && (
              <span className="inline-flex items-center gap-1 mt-1.5 text-xs font-bold text-green-600 bg-green-50 px-2.5 py-1 rounded-full">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V6m0 10v2m0-12c-1.11 0-2.08.402-2.599 1" />
                </svg>
                Economisești {Math.round(product.oldPrice - product.price).toLocaleString("ro-MD")} MDL
              </span>
            )}
          </div>

          {product.review && (
            <div className="bg-[#f6f8fb] rounded-xl px-4 py-3 mb-4">
              <StarRating rating={product.review.rating} animated />
              <p className="text-sm text-gray-700 italic leading-snug mt-1.5 line-clamp-2">
                „{product.review.text}"
              </p>
              <p className="text-xs text-gray-400 font-semibold mt-1.5">— {product.review.name}</p>
            </div>
          )}

          <div className="flex gap-2">
            <Link
              href={`/produse/${product.slug}`}
              onClick={() => {
                logPopupEvent(product.slug, "click");
                setOpen(false);
                setMinimized(true);
              }}
              className="flex-1 text-center bg-[#1d2353] hover:bg-[#161b3d] text-white font-bold py-3 rounded-xl transition-colors text-sm uppercase tracking-wide"
            >
              Vezi produsul
            </Link>
            <button
              onClick={() => {
                addToCart({ slug: product.slug, name: product.name, price: product.price, oldPrice: product.oldPrice, image: product.image });
                logPopupEvent(product.slug, "click");
                setOpen(false);
                setMinimized(true);
              }}
              className="flex-1 flex items-center justify-center gap-1.5 bg-[#c7092b] hover:bg-[#a5071f] text-white font-bold py-3 rounded-xl transition-colors text-sm uppercase tracking-wide"
            >
              <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.3 2.3c-.6.6-.2 1.7.7 1.7H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              Adaugă în coș
            </button>
          </div>
          <button
            onClick={close}
            className="w-full text-center text-gray-400 hover:text-gray-600 text-sm mt-3 transition-colors"
          >
            Nu, mulțumesc
          </button>
        </div>
      </div>
    </div>
  );
}
