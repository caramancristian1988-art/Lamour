"use client";

import { useActionState, useState, useTransition } from "react";
import { AlertCircle, Check, Mail } from "lucide-react";
import {
  sendNewsletterCampaignAction,
  deleteSubscriberAction,
  type NewsletterCampaignState,
} from "@/lib/newsletterActions";
import { AdminInput, AdminTextarea } from "../components/AdminField";
import { Button } from "@/app/components/ui/button";
import { Checkbox } from "@/app/components/ui/checkbox";
import { Alert, AlertDescription } from "@/app/components/ui/alert";
import DeleteButton from "../components/DeleteButton";

interface Subscriber {
  id: string;
  email: string;
  createdAt: Date;
}

const initialState: NewsletterCampaignState = {};

export default function NewsletterCampaignPanel({ subscribers }: { subscribers: Subscriber[] }) {
  const [selected, setSelected] = useState<Set<string>>(() => new Set(subscribers.map((s) => s.id)));
  const [state, formAction, pending] = useActionState(sendNewsletterCampaignAction, initialState);
  const [, startTransition] = useTransition();

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function selectAll() {
    setSelected(new Set(subscribers.map((s) => s.id)));
  }

  function deselectAll() {
    setSelected(new Set());
  }

  function handleDelete(id: string) {
    startTransition(() => {
      const fd = new FormData();
      fd.set("id", id);
      deleteSubscriberAction(fd);
    });
    setSelected((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6">
      <div className="flex flex-col gap-3 order-2 lg:order-1">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <p className="text-sm text-muted-foreground">
            {selected.size} din {subscribers.length} abonați selectați
          </p>
          <div className="flex gap-2">
            <Button type="button" variant="outline" size="sm" onClick={selectAll}>
              Selectează tot
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={deselectAll}>
              Deselectează tot
            </Button>
          </div>
        </div>

        {subscribers.length === 0 ? (
          <div className="bg-card border border-border rounded-2xl p-10 text-center text-muted-foreground flex flex-col items-center gap-2">
            <Mail className="w-8 h-8 text-muted-foreground/60" aria-hidden />
            Niciun abonat încă.
          </div>
        ) : (
          subscribers.map((s) => {
            const id = `subscriber-${s.id}`;
            return (
              <div key={s.id} className="bg-card border border-border rounded-2xl p-4 flex items-center gap-4">
                <Checkbox id={id} checked={selected.has(s.id)} onCheckedChange={() => toggle(s.id)} />
                <label htmlFor={id} className="flex-1 min-w-0 cursor-pointer">
                  <p className="font-bold text-sm text-primary truncate">{s.email}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Abonat pe {s.createdAt.toLocaleDateString("ro-MD", { day: "numeric", month: "long", year: "numeric" })}
                  </p>
                </label>
                <DeleteButton
                  action={(formData) => handleDelete(String(formData.get("id")))}
                  id={s.id}
                  confirmText={`Sigur vrei să elimini "${s.email}" din lista de abonați?`}
                  label={`Elimină abonatul ${s.email}`}
                />
              </div>
            );
          })
        )}
      </div>

      <div className="order-1 lg:order-2">
        <p className="font-bold text-sm text-primary mb-3">Trimite o ofertă</p>
        <form action={formAction} className="bg-card border border-border rounded-2xl p-6 flex flex-col gap-4">
          <input type="hidden" name="subscriberIds" value={Array.from(selected).join(",")} />

          {state.error && (
            <Alert variant="destructive">
              <AlertCircle aria-hidden />
              <AlertDescription>{state.error}</AlertDescription>
            </Alert>
          )}
          {state.success && (
            <Alert variant="success" role="status">
              <Check aria-hidden />
              <AlertDescription>Ofertă trimisă cu succes către {state.sentCount} abonați.</AlertDescription>
            </Alert>
          )}

          <AdminInput label="Subiect" name="subject" required placeholder="Ofertă specială luna aceasta" />
          <AdminTextarea label="Mesaj" name="message" required rows={8} placeholder="Scrie oferta pe care vrei să o trimiți abonaților..." />

          <Button type="submit" variant="accent" disabled={pending || selected.size === 0} className="self-start mt-2">
            {pending ? "Se trimite..." : `Trimite către ${selected.size} abonați selectați`}
          </Button>
        </form>
      </div>
    </div>
  );
}
