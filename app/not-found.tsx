import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pagina nu a fost găsită | Climat Rapid",
};

export default function NotFound() {
  return (
    <main className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="text-[120px] font-extrabold text-[#1d2353] leading-none select-none">
          4<span className="text-[#c7092b]">0</span>4
        </div>
        <h1 className="text-2xl font-extrabold text-[#1d2353] mt-4 mb-2">
          Pagina nu a fost găsită
        </h1>
        <p className="text-gray-500 text-sm leading-relaxed mb-8">
          Pagina pe care o cauți nu există sau a fost mutată. Încearcă să revii la pagina principală.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-[#c7092b] hover:bg-[#a5071f] text-white font-bold px-6 py-3 rounded-xl transition-colors text-sm uppercase tracking-wide"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Acasă
          </Link>
          <Link
            href="/produse"
            className="inline-flex items-center gap-2 border border-gray-200 text-[#1d2353] font-bold px-6 py-3 rounded-xl transition-colors text-sm uppercase tracking-wide hover:bg-gray-50"
          >
            Produse
          </Link>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 border border-gray-200 text-[#1d2353] font-bold px-6 py-3 rounded-xl transition-colors text-sm uppercase tracking-wide hover:bg-gray-50"
          >
            Contact
          </Link>
        </div>
      </div>
    </main>
  );
}
