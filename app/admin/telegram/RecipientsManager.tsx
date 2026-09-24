"use client";

import { useActionState } from "react";
import { Trash2, AlertCircle } from "lucide-react";
import { addTelegramRecipientAction, deleteTelegramRecipientAction, type TelegramActionState } from "@/lib/telegramLinkActions";
import { STAFF_ROLES, staffRoleLabel } from "@/lib/staffRoles";
import TelegramConnect from "@/app/components/TelegramConnect";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Alert, AlertDescription } from "@/app/components/ui/alert";

export interface RecipientRow {
  id: string;
  name: string;
  role: string;
  connected: boolean;
}

const initialState: TelegramActionState = {};

export default function RecipientsManager({ recipients }: { recipients: RecipientRow[] }) {
  const [state, formAction, pending] = useActionState(addTelegramRecipientAction, initialState);

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      <div className="bg-card border border-border rounded-2xl p-6">
        <p className="text-xs font-extrabold uppercase tracking-wide text-primary mb-1">Adaugă o persoană</p>
        <p className="text-xs text-muted-foreground mb-4">
          Persoana nu are nevoie de cont pe site. Aleg numele și rolul, apoi îi trimit linkul de conectare.
        </p>
        <form
          key={state.at ?? 0}
          action={formAction}
          className="flex flex-col gap-3 sm:flex-row"
        >
          <Input name="name" required placeholder="Nume (ex: Maria — contabilă)" aria-label="Nume" className="sm:flex-1" />
          <select
            name="role"
            required
            defaultValue=""
            aria-label="Rol"
            className="border-2 border-input rounded-lg px-3 py-2.5 text-sm bg-card text-foreground focus-visible:outline-none focus-visible:border-accent"
          >
            <option value="" disabled>Alege rolul</option>
            {STAFF_ROLES.map((r) => (
              <option key={r.value} value={r.value}>{r.label}</option>
            ))}
          </select>
          <Button type="submit" variant="accent" disabled={pending}>
            {pending ? "Se adaugă..." : "Adaugă"}
          </Button>
        </form>
        {state.error && (
          <Alert variant="destructive" className="mt-3">
            <AlertCircle aria-hidden />
            <AlertDescription>{state.error}</AlertDescription>
          </Alert>
        )}
      </div>

      {recipients.length === 0 ? (
        <div className="bg-card border border-border rounded-2xl p-10 text-center text-muted-foreground">
          Nu ai adăugat încă pe nimeni.
        </div>
      ) : (
        <div className="bg-card border border-border rounded-2xl divide-y divide-border">
          {recipients.map((r) => (
            <div key={r.id} className="p-4 flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm text-primary truncate">{r.name}</p>
                  <p className="text-xs text-muted-foreground">{staffRoleLabel(r.role) ?? r.role}</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (confirm(`Sigur vrei să ștergi ${r.name}? Nu va mai primi notificări.`)) deleteTelegramRecipientAction(r.id);
                  }}
                  aria-label={`Șterge ${r.name}`}
                  className="text-muted-foreground hover:text-accent transition-colors p-1.5 rounded-lg hover:bg-accent/10 shrink-0"
                >
                  <Trash2 className="w-4 h-4" aria-hidden />
                </button>
              </div>
              <TelegramConnect recipientId={r.id} connected={r.connected} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
