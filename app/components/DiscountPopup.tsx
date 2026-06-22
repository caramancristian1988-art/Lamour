"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { logPopupEvent } from "@/lib/popupStatActions";
import { getPopupProduct } from "@/lib/popupProduct";

const SESSION_KEY = "discountPopupShown";
const SHOW_DELAY_MS = 6000;
const COUNTDOWN_SECONDS = 10 * 60;
const HIDDEN_PATH_PREFIXES = ["/admin", "/cont", "/login", "/register", "/cos"];

export interface PopupProduct {
  slug: string;
  name: string;
  image: string | null;
  price: number;
  oldPrice: number | null;
  rating: number;
  reviewCount: number;
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          className={`w-4 h-4 ${star <= Math.round(rating) ? "text-amber-400" : "text-gray-200"}`}
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
  const [product, setProduct] = useState<PopupProduct | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(COUNTDOWN_SECONDS);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (sessionStorage.getItem(SESSION_KEY)) return;

    const timer = setTimeout(() => {
      getPopupProduct().then((p) => {
        if (!p) return;
        setProduct(p);
        setOpen(true);
        sessionStorage.setItem(SESSION_KEY, "1");
      });
    }, SHOW_DELAY_MS);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    if (!product || secondsLeft <= 0) return;
    const interval = setInterval(() => {
      setSecondsLeft((s) => (s > 0 ? s - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [product, secondsLeft]);

  if (!product) return null;
  if (HIDDEN_PATH_PREFIXES.some((p) => pathname?.startsWith(p))) return null;
  if (!open && !minimized) return null;

  function close() {
    logPopupEvent(product!.slug, "close");
    setOpen(false);
    setMinimized(true);
  }

  function reopen() {
    setMinimized(false);
    setOpen(true);
  }

  const discount = product.oldPrice ? Math.round((1 - product.price / product.oldPrice) * 100) : null;
  const minutes = String(Math.floor(secondsLeft / 60)).padStart(2, "0");
  const seconds = String(secondsLeft % 60).padStart(2, "0");

  if (minimized) {
    return (
      <button
        onClick={reopen}
        aria-label="Revino la ofertă"
        className="fixed bottom-4 right-4 z-[70] flex items-center gap-2 bg-[#c7092b] hover:bg-[#a5071f] text-white font-bold pl-3 pr-4 py-3 rounded-full shadow-2xl transition-all hover:scale-105 animate-pop"
      >
        <span className="relative flex items-center justify-center w-6 h-6 shrink-0">
          <span className="absolute inset-0 rounded-full bg-white/30 animate-ping" />
          <svg className="relative w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
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
        <button
          onClick={close}
          aria-label="Închide"
          className="absolute top-4 right-4 z-10 text-white/80 hover:text-white transition-colors"
        >
          <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="bg-gradient-to-br from-[#c7092b] to-[#8b0520] px-8 pt-10 pb-7 text-center">
          <p className="text-white/80 text-sm font-bold uppercase tracking-widest mb-2">Ofertă limitată</p>
          <p className="text-white text-3xl sm:text-4xl font-extrabold leading-tight">
            {discount ? `-${discount}% doar azi!` : "Ofertă specială!"}
          </p>
          <div className="inline-flex items-center gap-2 mt-4 bg-black/20 rounded-full px-5 py-2 text-white text-base font-bold tabular-nums">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="9" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 7v5l3 2" />
            </svg>
            Oferta expiră în {minutes}:{seconds}
          </div>
        </div>

        <div className="p-8">
          <div className="flex gap-5 mb-7">
            <div className="relative w-32 h-32 shrink-0 bg-[#f6f8fb] rounded-xl overflow-hidden">
              {product.image && (
                <Image src={product.image} alt={product.name} fill className="object-contain p-2" />
              )}
            </div>
            <div className="min-w-0 flex flex-col justify-center">
              <p className="text-base font-bold text-[#1d2353] leading-snug line-clamp-2">{product.name}</p>
              <div className="flex items-center gap-1.5 mt-2">
                <StarRating rating={product.rating} />
                <span className="text-sm text-gray-400">({product.reviewCount})</span>
              </div>
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
            </div>
          </div>

          <Link
            href={`/produse/${product.slug}`}
            onClick={() => {
              logPopupEvent(product.slug, "click");
              setOpen(false);
            }}
            className="block w-full text-center bg-[#c7092b] hover:bg-[#a5071f] text-white font-bold py-3.5 rounded-xl transition-colors text-sm uppercase tracking-wide"
          >
            Vezi produsul
          </Link>
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
