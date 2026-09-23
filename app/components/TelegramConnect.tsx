"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Send, Check } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import {
  createTelegramLinkAction,
  disconnectTelegramAction,
  getTelegramConnectedAction,
} from "@/lib/telegramLinkActions";

// "Conectează Telegram": deschide botul cu un token de unică folosință; după ce persoana apasă
// Start, webhook-ul îi salvează chat id-ul. Aici doar așteptăm confirmarea (polling) și reîncărcăm.
export default function TelegramConnect({ connected: connectedProp, userId }: { connected: boolean; userId?: string }) {
  const router = useRouter();
  // Stare proprie: lista de utilizatori își ține datele în state client, deci un router.refresh() singur
  // nu ar actualiza prop-ul după ce persoana a apăsat Start.
  const [connected, setConnected] = useState(connectedProp);
  useEffect(() => setConnected(connectedProp), [connectedProp]);
  const [pending, startTransition] = useTransition();
  const [waiting, setWaiting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Când adminul conectează contul altcuiva, linkul trebuie deschis în Telegramul PERSOANEI (nu al adminului),
  // așa că îl arătăm ca să-l poată copia/trimite, în loc să-l deschidem automat.
  const [link, setLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!waiting) return;
    let stopped = false;
    const timer = setInterval(async () => {
      if (await getTelegramConnectedAction(userId).catch(() => false)) {
        if (stopped) return;
        stopped = true;
        setWaiting(false);
        setLink(null);
        setConnected(true);
        router.refresh();
      }
    }, 3000);
    // Linkul nu mai are rost după câteva minute — oprim așteptarea.
    const giveUp = setTimeout(() => setWaiting(false), 5 * 60 * 1000);
    return () => {
      stopped = true;
      clearInterval(timer);
      clearTimeout(giveUp);
    };
  }, [waiting, router, userId]);

  function connect() {
    setError(null);
    startTransition(async () => {
      const result = await createTelegramLinkAction(userId);
      if (result.error || !result.url) {
        setError(result.error ?? "Nu am putut genera linkul.");
        return;
      }
      if (userId) setLink(result.url);
      else window.open(result.url, "_blank", "noopener,noreferrer");
      setWaiting(true);
    });
  }

  function disconnect() {
    if (!confirm("Sigur vrei să deconectezi Telegram? Nu vei mai primi notificări.")) return;
    startTransition(async () => {
      await disconnectTelegramAction(userId);
      setConnected(false);
      router.refresh();
    });
  }

  if (connected) {
    return (
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <p className="flex items-center gap-2 text-sm font-bold text-primary">
          <Check className="w-4 h-4 text-accent" aria-hidden /> Telegram conectat
        </p>
        <Button type="button" variant="outline" size="sm" onClick={disconnect} disabled={pending}>
          Deconectează
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <Button type="button" variant="accent" onClick={connect} disabled={pending} className="gap-2 self-start">
        <Send className="w-4 h-4" aria-hidden />
        {pending ? "Se pregătește..." : "Conectează Telegram"}
      </Button>
      {waiting && (
        <p className="text-xs text-muted-foreground" role="status">
          Apasă Start în Telegram — aștept confirmarea...
        </p>
      )}
      {link && (
        <div className="flex flex-col gap-2 rounded-xl border border-border p-3">
          <p className="text-xs text-muted-foreground">Deschide linkul în Telegramul persoanei și apasă Start (sau trimite-i-l):</p>
          <p className="text-xs font-mono break-all text-primary">{link}</p>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                navigator.clipboard.writeText(link).then(() => {
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                });
              }}
            >
              {copied ? "Copiat" : "Copiază linkul"}
            </Button>
            <Button type="button" variant="outline" size="sm" asChild>
              <a href={link} target="_blank" rel="noopener noreferrer">Deschide</a>
            </Button>
          </div>
        </div>
      )}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
