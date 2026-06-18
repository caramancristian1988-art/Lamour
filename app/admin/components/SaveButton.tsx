"use client";

import { useEffect, useRef, useState } from "react";
import { useFormStatus } from "react-dom";

export default function SaveButton({ label = "Salvează setările" }: { label?: string }) {
  const { pending } = useFormStatus();
  const [justSaved, setJustSaved] = useState(false);
  const wasPending = useRef(false);

  useEffect(() => {
    if (wasPending.current && !pending) {
      setJustSaved(true);
      const timeout = setTimeout(() => setJustSaved(false), 2000);
      return () => clearTimeout(timeout);
    }
    wasPending.current = pending;
  }, [pending]);

  return (
    <button
      type="submit"
      disabled={pending}
      className={`self-start font-bold px-6 py-2.5 rounded-xl transition-all duration-200 text-sm uppercase tracking-wide flex items-center gap-2 active:scale-95 text-white disabled:cursor-not-allowed ${
        justSaved ? "bg-green-600" : "bg-[#c7092b] hover:bg-[#a5071f]"
      }`}
    >
      {pending ? (
        <>
          <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          Se salvează...
        </>
      ) : justSaved ? (
        <span key="saved" className="flex items-center gap-2 animate-pop">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
          Salvat!
        </span>
      ) : (
        label
      )}
    </button>
  );
}
