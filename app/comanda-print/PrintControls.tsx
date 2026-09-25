"use client";

import { useEffect } from "react";
import { Printer, X } from "lucide-react";

// Bara de deasupra fișei (ascunsă la tipărire). Cu ?auto=1 (butonul din Telegram / admin) deschide direct
// fereastra de imprimare; cât timp e deschisă, "Printează" o redeschide.
export default function PrintControls({ auto }: { auto: boolean }) {
  useEffect(() => {
    if (!auto) return;
    const t = setTimeout(() => window.print(), 400);
    return () => clearTimeout(t);
  }, [auto]);

  return (
    <div className="print:hidden flex items-center justify-between gap-3 mb-6 rounded-lg border border-black/20 bg-neutral-100 px-4 py-3">
      <p className="text-sm">Fișa e pregătită pentru imprimare (A4).</p>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => window.print()}
          className="inline-flex items-center gap-2 rounded-md bg-black px-4 py-2 text-sm font-bold text-white"
        >
          <Printer className="w-4 h-4" aria-hidden />
          Printează
        </button>
        <button
          type="button"
          onClick={() => window.close()}
          className="inline-flex items-center gap-2 rounded-md border border-black/30 px-3 py-2 text-sm font-semibold"
        >
          <X className="w-4 h-4" aria-hidden />
          Închide
        </button>
      </div>
    </div>
  );
}
