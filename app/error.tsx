"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 bg-[#fdf2f3] rounded-2xl flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-[#c7092b]" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
          </svg>
        </div>
        <h1 className="text-2xl font-extrabold text-[#1d2353] mb-2">
          A apărut o eroare
        </h1>
        <p className="text-gray-500 text-sm leading-relaxed mb-8">
          Ceva nu a mers bine. Încearcă din nou sau revino mai târziu.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={reset}
            className="inline-flex items-center gap-2 bg-[#c7092b] hover:bg-[#a5071f] text-white font-bold px-6 py-3 rounded-xl transition-colors text-sm uppercase tracking-wide"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Încearcă din nou
          </button>
          <Link
            href="/"
            className="inline-flex items-center gap-2 border border-gray-200 text-[#1d2353] font-bold px-6 py-3 rounded-xl transition-colors text-sm uppercase tracking-wide hover:bg-gray-50"
          >
            Acasă
          </Link>
        </div>
      </div>
    </main>
  );
}
