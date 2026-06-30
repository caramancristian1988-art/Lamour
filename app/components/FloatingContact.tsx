"use client";

import { useEffect, useRef, useState } from "react";
import { useFloatingUI } from "./FloatingUIState";

export default function FloatingContact({
  phone = "+373 69 000 000",
  phoneTel = "+37369000000",
  phoneDigits = "37369000000",
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
        <div className="flex flex-col items-end gap-3">
          <a
            href={VIBER_HREF}
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 bg-white shadow-lg border border-gray-100 rounded-full pl-4 pr-1.5 py-1.5 text-sm font-bold text-[#7360f2] hover:shadow-xl transition-shadow"
          >
            Viber
            <span className="w-9 h-9 rounded-full bg-[#7360f2]/10 flex items-center justify-center shrink-0">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#7360f2">
                <path d="M11.996 0C5.372 0 0 5.372 0 11.996c0 2.49.76 4.868 2.19 6.88L.757 23.054a.47.47 0 00.572.607l4.332-1.384a11.94 11.94 0 006.335 1.719c6.624 0 11.996-5.372 11.996-11.996C23.992 5.372 18.62 0 11.996 0zm6.46 16.46c-.26.733-1.29 1.341-2.114 1.519-.563.12-1.298.216-3.772-.81-3.164-1.31-5.203-4.522-5.362-4.732-.153-.21-1.283-1.706-1.283-3.254 0-1.548.81-2.305 1.097-2.62.26-.286.566-.357.755-.357.187 0 .374.002.538.01.173.009.404-.065.633.483.235.562.797 1.942.866 2.083.07.14.116.305.023.49-.089.19-.133.307-.262.472-.13.165-.274.368-.39.495-.13.14-.265.293-.113.574.15.28.67 1.106 1.44 1.791 1.001.893 1.846 1.17 2.127 1.3.28.13.44.108.602-.065.163-.174.698-.813.883-1.092.186-.28.373-.233.628-.14.255.093 1.627.768 1.906.908.28.14.466.21.535.327.069.116.069.673-.191 1.408z" />
              </svg>
            </span>
          </a>
          <a
            href={WHATSAPP_HREF}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 bg-white shadow-lg border border-gray-100 rounded-full pl-4 pr-1.5 py-1.5 text-sm font-bold text-green-600 hover:shadow-xl transition-shadow"
          >
            WhatsApp
            <span className="w-9 h-9 rounded-full bg-green-50 flex items-center justify-center shrink-0">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#25D366">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
            </span>
          </a>
          <a
            href={PHONE_TEL}
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 bg-white shadow-lg border border-gray-100 rounded-full pl-4 pr-1.5 py-1.5 text-sm font-bold text-[#c7092b] hover:shadow-xl transition-shadow"
          >
            {PHONE_DISPLAY}
            <span className="w-9 h-9 rounded-full bg-[#fdf2f3] flex items-center justify-center shrink-0">
              <svg className="w-5 h-5" fill="#c7092b" viewBox="0 0 24 24">
                <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" />
              </svg>
            </span>
          </a>
        </div>
      )}

      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Contactează-ne"
        className="relative w-14 h-14 rounded-full bg-[#c7092b] hover:bg-[#a5071f] text-white shadow-xl flex items-center justify-center transition-colors"
      >
        {!open && <span className="absolute inset-0 rounded-full bg-[#c7092b]/60 animate-ping" />}
        {open ? (
          <svg className="relative w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg
            className="relative w-6 h-6 animate-[bell-ring_4s_ease-in-out_infinite]"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" />
          </svg>
        )}
      </button>
    </div>
  );
}
