"use client";

import { useEffect, useRef, useState } from "react";
import { Phone, MessageCircle, X } from "lucide-react";
import { useFloatingUI } from "./FloatingUIState";

export default function FloatingContact({
  phone = "+000 00 000 000",
  phoneTel = "+00000000000",
  phoneDigits = "00000000000",
}: {
  phone?: string;
  phoneTel?: string;
  phoneDigits?: string;
}) {
  const PHONE_DISPLAY = phone;
  const PHONE_TEL = `tel:${phoneTel}`;
  const WHATSAPP_HREF = `https://wa.me/${phoneDigits}`;
  const VIBER_HREF = `viber://chat?number=${phoneDigits}`;

  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const { setContactMenuOpen } = useFloatingUI();

  useEffect(() => {
    setContactMenuOpen(open);
  }, [open, setContactMenuOpen]);

  useEffect(() => {
    if (!open) return;

    function onClickOutside(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
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
    <div ref={rootRef} className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-3">
      {open && (
        <div className="flex flex-col items-end gap-3 animate-slide-up">
          <a
            href={VIBER_HREF}
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 bg-card shadow-lg border border-border rounded-full pl-4 pr-1.5 py-1.5 text-sm font-bold text-[#7360f2] hover:shadow-xl transition-shadow"
          >
            Viber
            <span className="w-10 h-10 rounded-full bg-[#7360f2]/10 flex items-center justify-center shrink-0">
              <MessageCircle className="w-5 h-5" aria-hidden />
            </span>
          </a>
          <a
            href={WHATSAPP_HREF}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 bg-card shadow-lg border border-border rounded-full pl-4 pr-1.5 py-1.5 text-sm font-bold text-green-600 hover:shadow-xl transition-shadow"
          >
            WhatsApp
            <span className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center shrink-0">
              <MessageCircle className="w-5 h-5" aria-hidden />
            </span>
          </a>
          <a
            href={PHONE_TEL}
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 bg-card shadow-lg border border-border rounded-full pl-4 pr-1.5 py-1.5 text-sm font-bold text-accent hover:shadow-xl transition-shadow"
          >
            {PHONE_DISPLAY}
            <span className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
              <Phone className="w-5 h-5" aria-hidden />
            </span>
          </a>
        </div>
      )}

      <button
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Închide meniul de contact" : "Contactează-ne"}
        aria-expanded={open}
        className="relative w-16 h-16 rounded-full bg-accent hover:bg-brand-red-dark text-white shadow-xl flex items-center justify-center transition-colors"
      >
        {!open && <span className="absolute inset-0 rounded-full bg-accent/60 animate-ping" />}
        {open ? <X className="relative w-6 h-6" aria-hidden /> : <Phone className="relative w-6 h-6" aria-hidden />}
      </button>
    </div>
  );
}
