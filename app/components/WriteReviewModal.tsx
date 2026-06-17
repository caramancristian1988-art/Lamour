"use client";

import { useActionState, useEffect, useState } from "react";
import { submitReviewAction, type ReviewFormState } from "@/lib/reviewActions";

const initialState: ReviewFormState = {};

function StarPicker({ rating, onChange }: { rating: number; onChange: (value: number) => void }) {
  const [hover, setHover] = useState(0);
  const display = hover || rating;

  return (
    <div className="flex items-center justify-center gap-1.5" onMouseLeave={() => setHover(0)}>
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          onMouseEnter={() => setHover(star)}
          aria-label={`${star} stele`}
          className="transition-transform hover:scale-110 active:scale-95"
        >
          <svg
            className={`w-8 h-8 transition-colors ${star <= display ? "text-amber-400" : "text-gray-200"} ${
              star === rating ? "animate-pop" : ""
            }`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        </button>
      ))}
    </div>
  );
}

function ReviewFormPanel({
  productSlug,
  productName,
  onSuccess,
}: {
  productSlug: string;
  productName: string;
  onSuccess: () => void;
}) {
  const [rating, setRating] = useState(0);
  const [state, formAction, pending] = useActionState(submitReviewAction, initialState);

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
          Recenzia ta a fost trimisă!
        </h3>
        <p className="text-sm text-gray-500 animate-pop" style={{ animationDelay: "180ms" }}>
          Va fi afișată pe pagina produsului după ce este verificată.
        </p>
      </div>
    );
  }

  return (
    <>
      <h2 className="text-xl font-extrabold text-[#1d2353] text-center mb-5">Recenzii</h2>

      <form action={formAction} className="flex flex-col gap-3.5">
        <input type="hidden" name="productSlug" value={productSlug} />
        <input type="hidden" name="productName" value={productName} />
        <input type="hidden" name="rating" value={rating} />

        <StarPicker rating={rating} onChange={setRating} />

        {state.error && (
          <p className="text-sm text-[#c7092b] bg-[#fdf2f3] border border-[#fbd5d9] rounded-lg px-4 py-2.5 text-center">
            {state.error}
          </p>
        )}

        <input
          type="text"
          name="name"
          required
          placeholder="Nume/Prenume"
          className="border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#c7092b] placeholder:text-gray-400"
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          className="border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#c7092b] placeholder:text-gray-400"
        />
        <textarea
          name="pros"
          placeholder="Plusuri"
          rows={2}
          className="border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#c7092b] placeholder:text-gray-400 resize-none"
        />
        <textarea
          name="cons"
          placeholder="Minusuri"
          rows={2}
          className="border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#c7092b] placeholder:text-gray-400 resize-none"
        />
        <textarea
          name="text"
          required
          placeholder="Comentariu"
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

export default function WriteReviewModal({
  productSlug,
  productName,
  className,
  children,
}: {
  productSlug: string;
  productName: string;
  className?: string;
  children?: React.ReactNode;
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
          "bg-[#111827] hover:bg-black text-white font-bold text-sm px-5 py-3 rounded-xl transition-colors uppercase tracking-wide"
        }
      >
        {children ?? "Scrie o recenzie"}
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

            <ReviewFormPanel key={openCount} productSlug={productSlug} productName={productName} onSuccess={closeModal} />
          </div>
        </div>
      )}
    </>
  );
}
