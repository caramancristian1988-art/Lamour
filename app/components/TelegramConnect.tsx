"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Send, Check } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import {
  createTelegramLinkAction,
  disconnectTelegramAction,
  getTelegramConnectedAction,
  sendTelegramTestAction,
} from "@/lib/telegramLinkActions";

// "Conectează Telegram" pentru un destinatar: generează un link cu token de unică folosință, pe care
// adminul îl trimite persoanei (sau îl deschide pe telefonul ei). După ce persoana apasă Start în bot,
// webhook-ul îi salvează chat id-ul; aici doar așteptăm confirmarea (polling).
export default function TelegramConnect({ recipientId, connected: connectedProp }: { recipientId: string; connected: boolean }) {
  const router = useRouter();
  // Stare proprie: după Start, prop-ul de la server e vechi până la următorul refresh.
  const [override, setOverride] = useState<boolean | null>(null);
  const connected = override ?? connectedProp;
  const [pending, startTransition] = useTransition();
  const [waiting, setWaiting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [link, setLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!waiting) return;
    let stopped = false;
    const timer = setInterval(async () => {
      if (await getTelegramConnectedAction(recipientId).catch(() => false)) {
        if (stopped) return;
        stopped = true;
        setWaiting(false);
        setLink(null);
        setOverride(true);
        router.refresh();
      }
    }, 3000);
    // Linkul nu mai are rost după câteva minute — oprim așteptarea.
    const giveUp = setTimeout(() => setWaiting(false), 10 * 60 * 1000);
    return () => {
      stopped = true;
      clearInterval(timer);
      clearTimeout(giveUp);
    };
  }, [waiting, router, recipientId]);

  function connect() {
    setError(null);
    setNotice(null);
    startTransition(async () => {
      const result = await createTelegramLinkAction(recipientId);
      if (result.error || !result.url) {
        setError(result.error ?? "Nu am putut genera linkul.");
        return;
      }
      setLink(result.url);
      setWaiting(true);
    });
  }

  function disconnect() {
    if (!confirm("Sigur vrei să deconectezi Telegram? Persoana nu va mai primi notificări.")) return;
    startTransition(async () => {
      await disconnectTelegramAction(recipientId);
      setOverride(false);
      setNotice(null);
      router.refresh();
    });
  }

  function sendTest() {
    setError(null);
    setNotice(null);
    startTransition(async () => {
      const result = await sendTelegramTestAction(recipientId);
      if (result.ok) setNotice("Mesajul de test a fost trimis.");
      else setError(result.error ?? "Nu am putut trimite mesajul de test.");
    });
  }

  if (connected) {
    return (
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <p className="flex items-center gap-2 text-sm font-bold text-primary">
            <Check className="w-4 h-4 text-accent" aria-hidden /> Telegram conectat
          </p>
          <div className="flex gap-2">
            <Button type="button" variant="outline" size="sm" onClick={sendTest} disabled={pending}>
              Trimite test
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={disconnect} disabled={pending}>
              Deconectează
            </Button>
          </div>
        </div>
        {notice && <p className="text-xs text-muted-foreground" role="status">{notice}</p>}
        {error && <p className="text-xs text-destructive">{error}</p>}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <Button type="button" variant="accent" size="sm" onClick={connect} disabled={pending} className="gap-2 self-start">
        <Send className="w-4 h-4" aria-hidden />
        {pending ? "Se pregătește..." : link ? "Generează alt link" : "Conectează Telegram"}
      </Button>
      {link && (
        <div className="flex flex-col gap-2 rounded-xl border border-border p-3">
          <p className="text-xs text-muted-foreground">
            Trimite linkul persoanei (Telegram, WhatsApp, SMS). Ea îl deschide pe telefonul ei și apasă <b>Start</b>.
            Nu-l deschide tu în Telegramul tău, altfel îți legi propriul chat.
          </p>
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
          </div>
          {waiting && (
            <p className="text-xs text-muted-foreground" role="status">
              Aștept ca persoana să apese Start...
            </p>
          )}
        </div>
      )}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
