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
export default function TelegramConnect({ connected }: { connected: boolean }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [waiting, setWaiting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!waiting) return;
    let stopped = false;
    const timer = setInterval(async () => {
      if (await getTelegramConnectedAction().catch(() => false)) {
        if (stopped) return;
        stopped = true;
        setWaiting(false);
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
  }, [waiting, router]);

  function connect() {
    setError(null);
    startTransition(async () => {
      const result = await createTelegramLinkAction();
      if (result.error || !result.url) {
        setError(result.error ?? "Nu am putut genera linkul.");
        return;
      }
      window.open(result.url, "_blank", "noopener,noreferrer");
      setWaiting(true);
    });
  }

  function disconnect() {
    if (!confirm("Sigur vrei să deconectezi Telegram? Nu vei mai primi notificări.")) return;
    startTransition(async () => {
      await disconnectTelegramAction();
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
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
