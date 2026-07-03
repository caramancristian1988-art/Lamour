"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, Star, ExternalLink } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/app/components/ui/tabs";
import { Button } from "@/app/components/ui/button";
import { StarRating } from "@/app/components/ui/star-rating";
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

  const filters: [Filter, string][] = [
    ["toate", `Toate (${total})`],
    ["mesaje", `Mesaje (${messages.length})`],
    ["recenzii", `Recenzii (${reviews.length})`],
  ];

  return (
    <div>
      <Tabs value={filter} onValueChange={(v) => setFilter(v as Filter)} className="mb-5">
        <TabsList>
          {filters.map(([value, label]) => (
            <TabsTrigger key={value} value={value}>
              {label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {entries.length === 0 ? (
        <div className="bg-card border border-border rounded-2xl p-10 text-center text-muted-foreground">
          Nicio notificare nouă.
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {entries.map((entry) =>
            entry.type === "mesaj" ? (
              <div key={entry.data.id} className="bg-card border border-accent/20 rounded-2xl p-4 flex items-start gap-3">
                <span className="shrink-0 w-9 h-9 rounded-full bg-accent/10 text-accent flex items-center justify-center">
                  <Mail className="w-4.5 h-4.5" aria-hidden />
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <p className="font-bold text-sm text-primary">{entry.data.name}</p>
                    <p className="text-[11px] text-muted-foreground">{formatDate(entry.data.createdAt)}</p>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {entry.data.phone} · <LinkedProductText text={entry.data.source} products={entry.data.products} />
                  </p>
                  {entry.data.message && (
                    <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed line-clamp-2">
                      <LinkedProductText text={entry.data.message} products={entry.data.products} />
                    </p>
                  )}

                  {entry.data.products.length > 0 && (
                    <div className="flex flex-col gap-1.5 mt-2">
                      {entry.data.products.map((p) => (
                        <div
                          key={p.id}
                          className="inline-flex items-center gap-2 text-[10px] font-bold text-accent bg-accent/10 px-2 py-1 rounded-full w-fit"
                        >
                          <Link
                            href={`/produse/${p.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 hover:underline transition-colors"
                          >
                            <span className="uppercase">Vezi produsul</span>
                            <span className="opacity-70 truncate max-w-[160px]">{p.name}</span>
                            <ExternalLink className="w-3 h-3 shrink-0" aria-hidden />
                          </Link>
                          <span className="opacity-30">|</span>
                          <CopyableId id={p.id} className="inline-flex items-center gap-1 font-mono opacity-70 normal-case hover:opacity-100 transition-opacity" />
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center gap-2 mt-3">
                    <Button variant="outline" size="sm" onClick={() => handleMarkRead(entry.data.id)}>
                      Marchează ca citit
                    </Button>
                    <Button variant="ghost" size="sm" asChild>
                      <Link href="/admin/mesaje">Vezi în Mesaje</Link>
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div key={entry.data.id} className="bg-card border border-amber-300/40 rounded-2xl p-4 flex items-start gap-3">
                <span className="shrink-0 w-9 h-9 rounded-full bg-amber-50 text-amber-500 flex items-center justify-center">
                  <Star className="w-4.5 h-4.5" aria-hidden />
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <p className="font-bold text-sm text-primary">{entry.data.name}</p>
                    <p className="text-[11px] text-muted-foreground">{formatDate(entry.data.createdAt)}</p>
                  </div>
                  <StarRating rating={entry.data.rating} size={14} />
                  <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed line-clamp-2">{entry.data.text}</p>
                  {entry.data.product && <p className="text-xs text-muted-foreground mt-1">Produs: {entry.data.product}</p>}

                  <div className="flex items-center gap-2 mt-3">
                    <Button variant="accent" size="sm" onClick={() => handleApprove(entry.data.id)}>
                      Acceptă
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleReject(entry.data.id)}>
                      Respinge
                    </Button>
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
