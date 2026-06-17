"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

export interface NotificationMessage {
  id: string;
  name: string;
  phone: string;
  createdAt: string;
}

export interface NotificationReview {
  id: string;
  name: string;
  text: string;
  createdAt: string;
}

interface Props {
  unreadMessages: number;
  pendingReviews: number;
  recentMessages: NotificationMessage[];
  recentReviews: NotificationReview[];
  variant?: "light" | "dark";
}

function formatDate(iso: string) {
  return new Intl.DateTimeFormat("ro-MD", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" }).format(
    new Date(iso)
  );
}

export default function NotificationBell({ unreadMessages, pendingReviews, recentMessages, recentReviews, variant = "dark" }: Props) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const total = unreadMessages + pendingReviews;

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

  const hasAny = recentMessages.length > 0 || recentReviews.length > 0;
  const iconColor = variant === "dark" ? "text-white/60" : "text-gray-500";

  return (
    <div ref={rootRef} className="relative shrink-0">
      <button onClick={() => setOpen((v) => !v)} aria-label="Notificări" className={`relative p-1.5 ${iconColor} hover:text-white transition-colors`}>
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.85 23.85 0 005.454-1.31A8.967 8.967 0 0118 9.75V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
        </svg>
        {total > 0 && (
          <span className="absolute -top-0.5 -right-0.5 bg-[#c7092b] text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
            {total > 9 ? "9+" : total}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute top-full right-0 mt-2 w-80 bg-white rounded-xl shadow-2xl border border-gray-100 z-50 max-h-[70vh] overflow-y-auto">
          {!hasAny ? (
            <p className="text-sm text-gray-400 text-center py-8">Nicio notificare nouă.</p>
          ) : (
            <>
              {recentMessages.length > 0 && (
                <div>
                  <p className="px-4 pt-3 pb-2 text-[11px] font-extrabold text-gray-400 uppercase tracking-wide">
                    Mesaje noi ({unreadMessages})
                  </p>
                  {recentMessages.map((m) => (
                    <Link
                      key={m.id}
                      href="/admin/mesaje"
                      onClick={() => setOpen(false)}
                      className="block px-4 py-2.5 hover:bg-gray-50 transition-colors border-t border-gray-50"
                    >
                      <p className="text-sm font-bold text-[#1d2353]">{m.name}</p>
                      <p className="text-xs text-gray-400">{m.phone} · {formatDate(m.createdAt)}</p>
                    </Link>
                  ))}
                </div>
              )}

              {recentReviews.length > 0 && (
                <div>
                  <p className="px-4 pt-3 pb-2 text-[11px] font-extrabold text-gray-400 uppercase tracking-wide">
                    Recenzii în așteptare ({pendingReviews})
                  </p>
                  {recentReviews.map((r) => (
                    <Link
                      key={r.id}
                      href="/admin/recenzii"
                      onClick={() => setOpen(false)}
                      className="block px-4 py-2.5 hover:bg-gray-50 transition-colors border-t border-gray-50"
                    >
                      <p className="text-sm font-bold text-[#1d2353]">{r.name}</p>
                      <p className="text-xs text-gray-500 line-clamp-1">{r.text}</p>
                    </Link>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
