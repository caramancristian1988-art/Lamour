"use client";

import { useActionState, useEffect, useState } from "react";
import Image from "next/image";
import { submitContactMessageAction, type ContactFormState } from "@/lib/adminMessageActions";

const initialState: ContactFormState = {};

function OfferFormPanel({
  productId,
  productName,
  productImage,
  title,
  sourceLabel,
  onSuccess,
}: {
  productId: string;
  productName: string;
  productImage: string | null;
  title: string;
  sourceLabel: string;
  onSuccess: () => void;
}) {
  const [state, formAction, pending] = useActionState(submitContactMessageAction, initialState);

  useEffect(() => {
    if (state.success) {
      const timeout = setTimeout(onSuccess, 2200);
      return () => clearTimeout(timeout);
    }
  }, [state.success, onSuccess]);

  if (state.success) {
    return (
      <div className="flex flex-col items-center text-center py-8">
        <div className="relative w-14 h-14 mb-4">
          <span className="absolute inset-0 rounded-full bg-green-200 animate-ping" />
          <div className="relative w-14 h-14 rounded-full bg-green-100 text-green-600 flex items-center justify-center animate-pop">
            <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>
        <h3 className="text-lg font-extrabold text-[#1d2353] mb-1 animate-pop" style={{ animationDelay: "100ms" }}>
          Cererea ta a fost trimisă!
        </h3>
        <p className="text-sm text-gray-500 animate-pop" style={{ animationDelay: "180ms" }}>
          Te vom contacta în cel mai scurt timp.
        </p>
      </div>
    );
  }

  return (
    <>
      <h2 className="text-xl font-extrabold text-[#1d2353] text-center mb-5">{title}</h2>

      <div className="flex items-center gap-3 mb-5 p-3 border border-gray-100 rounded-xl bg-[#fafbfc]">
        <span className="relative w-14 h-14 rounded-lg bg-white overflow-hidden shrink-0 border border-gray-100">
          {productImage ? (
            <Image src={productImage} alt={productName} fill className="object-contain p-1" />
          ) : (
            <svg className="w-6 h-6 text-gray-300 absolute inset-0 m-auto" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20 8H4a2 2 0 00-2 2v8a2 2 0 002 2h16a2 2 0 002-2v-8a2 2 0 00-2-2zM4 6h16V4H4v2z" />
            </svg>
          )}
        </span>
        <p className="text-sm font-bold text-[#1d2353] line-clamp-2">{productName}</p>
      </div>

      <form action={formAction} className="flex flex-col gap-3.5">
        <input type="hidden" name="source" value={`${sourceLabel} – ${productName}`} />
        <input type="hidden" name="productId" value={productId} />

        {state.error && (
          <p className="text-sm text-[#c7092b] bg-[#fdf2f3] border border-[#fbd5d9] rounded-lg px-4 py-2.5 text-center">
            {state.error}
          </p>
        )}

        <input
          type="text"
          name="name"
          required
          placeholder="Nume complet"
          className="border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#c7092b] placeholder:text-gray-400"
        />
        <input
          type="tel"
          name="phone"
          required
          placeholder="Telefon"
          className="border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#c7092b] placeholder:text-gray-400"
        />
        <input
          type="email"
          name="email"
          placeholder="Email (opțional)"
          className="border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#c7092b] placeholder:text-gray-400"
        />
        <textarea
          name="message"
          placeholder="Mesaj suplimentar (opțional)"
          rows={3}
          className="border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#c7092b] placeholder:text-gray-400 resize-none"
        />

        <button
          type="submit"
          disabled={pending}
          className="bg-[#c7092b] hover:bg-[#a5071f] disabled:opacity-60 active:scale-95 text-white font-bold py-3 rounded-xl transition-all text-sm uppercase tracking-wide mt-1"
        >
          {pending ? "Se trimite..." : "Trimite"}
        </button>
      </form>
    </>
  );
}

export default function ProductOfferModal({
  productId,
  productName,
  productImage,
  className,
  children,
  title = "Cere consultație",
  sourceLabel = "Cere consultație",
}: {
  productId: string;
  productName: string;
  productImage: string | null;
  className?: string;
  children?: React.ReactNode;
  title?: string;
  sourceLabel?: string;
}) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [openCount, setOpenCount] = useState(0);

  function openModal() {
    setOpenCount((c) => c + 1);
    setMounted(true);
    requestAnimationFrame(() => requestAnimationFrame(() => setOpen(true)));
  }

  function closeModal() {
    setOpen(false);
  }

  useEffect(() => {
    if (!open && mounted) {
      const timeout = setTimeout(() => setMounted(false), 200);
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
        onClick={openModal}
        className={
          className ??
          "w-full h-12 flex items-center justify-center border-2 border-[#1d2353] text-[#1d2353] hover:bg-[#1d2353] hover:text-white font-bold rounded-xl transition-all text-sm uppercase tracking-wide"
        }
      >
        {children ?? "Cere consultație"}
      </button>

      {mounted && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className={`absolute inset-0 bg-black/50 transition-opacity duration-200 ${open ? "opacity-100" : "opacity-0"}`}
            onClick={closeModal}
            aria-hidden
          />

          <div
            className={`relative bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto p-6 transition-all duration-[250ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${
              open ? "opacity-100 scale-100" : "opacity-0 scale-95"
            }`}
          >
            <button
              onClick={closeModal}
              aria-label="Închide"
              className="group absolute top-4 right-4 text-gray-400 hover:text-[#c7092b] transition-colors"
            >
              <svg className="w-5 h-5 transition-transform duration-300 group-hover:rotate-90" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <OfferFormPanel
              key={openCount}
              productId={productId}
              productName={productName}
              productImage={productImage}
              title={title}
              sourceLabel={sourceLabel}
              onSuccess={closeModal}
            />
          </div>
        </div>
      )}
    </>
  );
}
