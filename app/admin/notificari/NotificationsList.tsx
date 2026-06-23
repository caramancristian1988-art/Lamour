"use client";

import { useState } from "react";
import Link from "next/link";
import LinkedProductText from "../components/LinkedProductText";
import CopyableId from "../components/CopyableId";
import { markMessageReadAction } from "@/lib/adminMessageActions";
import { approveReviewAction, rejectReviewAction } from "@/lib/adminReviewActions";

interface MessageItem {
  id: string;
  name: string;
  phone: string;
  message: string | null;
  source: string;
  createdAt: string;
  products: { id: string; name: string; slug: string }[];
}

interface ReviewItem {
  id: string;
  name: string;
  text: string;
  rating: number;
  product: string | null;
  createdAt: string;
}

type Filter = "toate" | "mesaje" | "recenzii";

function formatDate(iso: string) {
  return new Intl.DateTimeFormat("ro-MD", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }).format(
    new Date(iso)
  );
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg key={star} className={`w-3.5 h-3.5 ${star <= Math.round(rating) ? "text-amber-400" : "text-gray-200"}`} fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

export default function NotificationsList({ messages: initialMessages, reviews: initialReviews }: { messages: MessageItem[]; reviews: ReviewItem[] }) {
  const [messages, setMessages] = useState(initialMessages);
  const [reviews, setReviews] = useState(initialReviews);
  const [filter, setFilter] = useState<Filter>("toate");

  function handleMarkRead(id: string) {
    setMessages((prev) => prev.filter((m) => m.id !== id));
    const formData = new FormData();
    formData.set("id", id);
    markMessageReadAction(formData);
  }

  function handleApprove(id: string) {
    setReviews((prev) => prev.filter((r) => r.id !== id));
    const formData = new FormData();
    formData.set("id", id);
    approveReviewAction(formData);
  }

  function handleReject(id: string) {
    setReviews((prev) => prev.filter((r) => r.id !== id));
    const formData = new FormData();
    formData.set("id", id);
    rejectReviewAction(formData);
  }

  const total = messages.length + reviews.length;

  type Entry = { type: "mesaj"; createdAt: string; data: MessageItem } | { type: "recenzie"; createdAt: string; data: ReviewItem };
  const entries: Entry[] = [
    ...messages.map((m): Entry => ({ type: "mesaj", createdAt: m.createdAt, data: m })),
    ...reviews.map((r): Entry => ({ type: "recenzie", createdAt: r.createdAt, data: r })),
  ]
    .filter((e) => filter === "toate" || (filter === "mesaje" && e.type === "mesaj") || (filter === "recenzii" && e.type === "recenzie"))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <div>
      <div className="flex gap-2 mb-5 flex-wrap">
        {([
          ["toate", `Toate (${total})`],
          ["mesaje", `Mesaje (${messages.length})`],
          ["recenzii", `Recenzii (${reviews.length})`],
        ] as [Filter, string][]).map(([value, label]) => (
          <button
            key={value}
            type="button"
            onClick={() => setFilter(value)}
            className={`text-sm font-bold px-4 py-2 rounded-xl transition-colors ${
              filter === value ? "bg-[#c7092b] text-white" : "bg-white border border-gray-200 text-gray-500 hover:text-[#1d2353]"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {entries.length === 0 ? (
        <div className="bg-white border border-gray-100 rounded-2xl p-10 text-center text-gray-500">
          Nicio notificare nouă.
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {entries.map((entry) =>
            entry.type === "mesaj" ? (
              <div key={entry.data.id} className="bg-white border border-[#c7092b]/20 rounded-2xl p-4 flex items-start gap-3">
                <span className="shrink-0 w-9 h-9 rounded-full bg-[#fdf2f3] text-[#c7092b] flex items-center justify-center">
                  <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <p className="font-bold text-sm text-[#1d2353]">{entry.data.name}</p>
                    <p className="text-[11px] text-gray-400">{formatDate(entry.data.createdAt)}</p>
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {entry.data.phone} · <LinkedProductText text={entry.data.source} products={entry.data.products} />
                  </p>
                  {entry.data.message && (
                    <p className="text-sm text-gray-600 mt-1.5 leading-relaxed line-clamp-2">
                      <LinkedProductText text={entry.data.message} products={entry.data.products} />
                    </p>
                  )}

                  {entry.data.products.length > 0 && (
                    <div className="flex flex-col gap-1.5 mt-2">
                      {entry.data.products.map((p) => (
                        <div
                          key={p.id}
                          className="inline-flex items-center gap-2 text-[10px] font-bold text-[#c7092b] bg-[#fdf2f3] px-2 py-1 rounded-full w-fit"
                        >
                          <Link
                            href={`/produse/${p.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 hover:underline transition-colors"
                          >
                            <span className="uppercase">Vezi produsul</span>
                            <span className="opacity-70 truncate max-w-[160px]">{p.name}</span>
                          </Link>
                          <span className="opacity-30">|</span>
                          <CopyableId id={p.id} className="inline-flex items-center gap-1 font-mono opacity-70 normal-case hover:opacity-100 transition-opacity" />
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center gap-2 mt-3">
                    <button
                      type="button"
                      onClick={() => handleMarkRead(entry.data.id)}
                      className="text-xs font-bold text-[#1d2353] border border-gray-200 hover:bg-gray-50 px-3 py-1.5 rounded-lg transition-colors"
                    >
                      Marchează ca citit
                    </button>
                    <Link
                      href="/admin/mesaje"
                      className="text-xs font-bold text-gray-400 hover:text-[#c7092b] transition-colors px-3 py-1.5"
                    >
                      Vezi în Mesaje
                    </Link>
                  </div>
                </div>
              </div>
            ) : (
              <div key={entry.data.id} className="bg-white border border-amber-300/40 rounded-2xl p-4 flex items-start gap-3">
                <span className="shrink-0 w-9 h-9 rounded-full bg-amber-50 text-amber-500 flex items-center justify-center">
                  <svg className="w-4.5 h-4.5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <p className="font-bold text-sm text-[#1d2353]">{entry.data.name}</p>
                    <p className="text-[11px] text-gray-400">{formatDate(entry.data.createdAt)}</p>
                  </div>
                  <StarRating rating={entry.data.rating} />
                  <p className="text-sm text-gray-600 mt-1.5 leading-relaxed line-clamp-2">{entry.data.text}</p>
                  {entry.data.product && <p className="text-xs text-gray-400 mt-1">Produs: {entry.data.product}</p>}

                  <div className="flex items-center gap-2 mt-3">
                    <button
                      type="button"
                      onClick={() => handleApprove(entry.data.id)}
                      className="text-xs font-bold text-white bg-[#1d2353] hover:bg-[#2a3470] px-3 py-1.5 rounded-lg transition-colors"
                    >
                      Acceptă
                    </button>
                    <button
                      type="button"
                      onClick={() => handleReject(entry.data.id)}
                      className="text-xs font-bold text-gray-500 border border-gray-200 hover:bg-gray-50 px-3 py-1.5 rounded-lg transition-colors"
                    >
                      Respinge
                    </button>
                  </div>
                </div>
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
}
