"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown, ExternalLink, Trash2 } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/app/components/ui/tabs";
import { Badge } from "@/app/components/ui/badge";
import { Button } from "@/app/components/ui/button";
import { cn } from "@/lib/utils";
import MessageStatusBadge from "../components/MessageStatusBadge";
import MoodBadge from "../components/MoodBadge";
import LinkedProductText from "../components/LinkedProductText";
import CopyableId from "../components/CopyableId";
import { markMessageReadAction, deleteMessageAction } from "@/lib/adminMessageActions";

interface Message {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  message: string | null;
  source: string;
  read: boolean;
  status: string;
  mood: string | null;
  createdAt: Date;
  products: { id: string; name: string; slug: string }[];
}

type Category = "oferte" | "contact" | "comenzi";

function categoryOf(source: string): Category {
  if (source.startsWith("Cere consultație")) return "oferte";
  if (source === "Comandă din coș") return "comenzi";
  return "contact";
}

const STATUS_ACCENT_COLORS: Record<string, string> = {
  in_asteptare: "#f59e0b",
  sunat: "#3b82f6",
  nu_raspunde: "#f97316",
  se_gandeste: "#eab308",
  programat: "#6366f1",
  in_lucru: "#0ea5e9",
  achitat: "#14b8a6",
  anulat: "#9ca3af",
};

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("ro-MD", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }).format(date);
}

export default function MessagesList({ messages: initialMessages }: { messages: Message[] }) {
  const [messages, setMessages] = useState(initialMessages);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [tab, setTab] = useState<Category>("oferte");

  function patchMessage(id: string, patch: Partial<Message>) {
    setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, ...patch } : m)));
  }

  function removeMessage(id: string) {
    setMessages((prev) => prev.filter((m) => m.id !== id));
  }

  function handleMarkRead(id: string) {
    patchMessage(id, { read: true });
    const formData = new FormData();
    formData.set("id", id);
    markMessageReadAction(formData);
  }

  function handleDelete(id: string, name: string) {
    if (!confirm(`Sigur vrei să ștergi mesajul de la ${name}?`)) return;
    removeMessage(id);
    const formData = new FormData();
    formData.set("id", id);
    deleteMessageAction(formData);
  }

  if (messages.length === 0) {
    return (
      <div className="bg-card border border-border rounded-2xl p-10 text-center text-muted-foreground">
        Nu există mesaje primite încă.
      </div>
    );
  }

  const offerMessages = messages.filter((m) => categoryOf(m.source) === "oferte");
  const contactMessages = messages.filter((m) => categoryOf(m.source) === "contact");
  const orderMessages = messages.filter((m) => categoryOf(m.source) === "comenzi");
  const visibleMessages = tab === "oferte" ? offerMessages : tab === "comenzi" ? orderMessages : contactMessages;

  const tabs: { value: Category; label: string; count: number }[] = [
    { value: "oferte", label: "Cereri ofertă", count: offerMessages.length },
    { value: "contact", label: "Contact", count: contactMessages.length },
    { value: "comenzi", label: "Comenzi din coș", count: orderMessages.length },
  ];

  return (
    <div>
      <Tabs value={tab} onValueChange={(v) => setTab(v as Category)} className="mb-4">
        <TabsList>
          {tabs.map((t) => (
            <TabsTrigger key={t.value} value={t.value}>
              {t.label} <span className="opacity-70">({t.count})</span>
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {visibleMessages.length === 0 ? (
        <div className="bg-card border border-border rounded-2xl p-10 text-center text-muted-foreground">
          Nu există mesaje în această categorie.
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {visibleMessages.map((m) => {
            const expanded = expandedId === m.id;
            return (
              <div
                key={m.id}
                style={{ borderLeftColor: STATUS_ACCENT_COLORS[m.status] ?? STATUS_ACCENT_COLORS.in_asteptare }}
                className={cn(
                  "bg-card border rounded-xl border-l-4 transition-colors",
                  m.read ? "border-border" : "border-accent/30"
                )}
              >
                {/* Compact header — always visible */}
                <div className="relative flex items-center gap-2 px-3 py-2.5">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <p className="font-bold text-xs text-primary truncate">{m.name}</p>
                      {!m.read && <Badge variant="accent">Nou</Badge>}
                    </div>
                    <p className="text-[11px] text-muted-foreground truncate mt-0.5">
                      {m.phone} · {formatDate(m.createdAt)}
                    </p>
                  </div>

                  <Button
                    variant="outline"
                    size="icon"
                    className="shrink-0 w-7 h-7 rounded-full"
                    onClick={() => setExpandedId(expanded ? null : m.id)}
                    aria-label={expanded ? `Restrânge mesajul de la ${m.name}` : `Detalii mesaj de la ${m.name}`}
                  >
                    <ChevronDown className={cn("w-3.5 h-3.5 transition-transform duration-200", expanded && "rotate-180")} aria-hidden />
                  </Button>
                </div>

                {/* Expanded details */}
                <div
                  className={cn(
                    "grid transition-all duration-200 ease-out",
                    expanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0 pointer-events-none"
                  )}
                  style={{ display: "grid" }}
                >
                  <div className={expanded ? "overflow-visible" : "overflow-hidden"}>
                    <div className="px-3 pb-3 pt-1 border-t border-border">
                      <div className="flex items-center gap-3 text-xs text-muted-foreground mt-2 flex-wrap">
                        <a href={`tel:${m.phone}`} className="hover:text-accent transition-colors">{m.phone}</a>
                        {m.email && <a href={`mailto:${m.email}`} className="hover:text-accent transition-colors">{m.email}</a>}
                        <Badge variant="muted">
                          <LinkedProductText text={m.source} products={m.products} />
                        </Badge>
                      </div>

                      {m.products.length > 0 && (
                        <div className="flex flex-col gap-1.5 mt-2">
                          {m.products.map((p) => (
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

                      <div className="flex items-center gap-2 mt-3 flex-wrap">
                        <MessageStatusBadge id={m.id} status={m.status} onChange={(status) => patchMessage(m.id, { status })} />
                        <MoodBadge id={m.id} mood={m.mood} onChange={(mood) => patchMessage(m.id, { mood })} />
                        {!m.read && (
                          <Button variant="outline" size="sm" onClick={() => handleMarkRead(m.id)}>
                            Marchează ca citit
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="ml-auto"
                          onClick={() => handleDelete(m.id, m.name)}
                          aria-label={`Șterge mesajul de la ${m.name}`}
                        >
                          <Trash2 className="w-4 h-4" aria-hidden />
                        </Button>
                      </div>

                      {m.message && (
                        <p className="text-sm text-muted-foreground mt-3 leading-relaxed whitespace-pre-line">
                          <LinkedProductText text={m.message} products={m.products} />
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
