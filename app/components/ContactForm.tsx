"use client";

import { useId, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { AlertCircle, Check, Loader2, Mail, MessageSquareText, Phone, Send, ShieldCheck, Tag, User } from "lucide-react";
import { submitContactMessageAction } from "@/lib/adminMessageActions";
import { Alert, AlertDescription } from "@/app/components/ui/alert";

type Status = "idle" | "error" | "success" | "pending";

// Câmpurile își desenează singure indicatorul de focus (bordură + inel), deci primesc data-own-focus (vezi globals.css).
const fieldBase =
  "block w-full rounded-2xl border border-brand-rose bg-white text-base text-foreground placeholder:text-muted-foreground/70 shadow-sm transition-[border-color,box-shadow] " +
  "hover:border-accent/60 focus-visible:border-accent focus-visible:ring-4 focus-visible:ring-accent/15 aria-[invalid=true]:border-destructive aria-[invalid=true]:ring-4 aria-[invalid=true]:ring-destructive/15";

function Field({
  id,
  label,
  optional,
  icon,
  children,
}: {
  id: string;
  label: string;
  optional?: boolean;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="flex items-baseline gap-1.5 text-sm font-bold text-primary">
        {label}
        {optional ? (
          <span className="text-xs font-medium text-muted-foreground">(opțional)</span>
        ) : (
          <span className="text-accent" aria-hidden>
            *
          </span>
        )}
      </label>
      <div className="relative">
        <span aria-hidden className="pointer-events-none absolute left-4 top-[1.05rem] text-accent [&>svg]:h-[18px] [&>svg]:w-[18px]">
          {icon}
        </span>
        {children}
      </div>
    </div>
  );
}

export default function ContactForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const pathname = usePathname();
  const uid = useId();
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");
  const [invalid, setInvalid] = useState<{ name: boolean; phone: boolean }>({ name: false, phone: false });

  const ids = { name: `${uid}-name`, phone: `${uid}-phone`, email: `${uid}-email`, subject: `${uid}-subject`, message: `${uid}-message` };

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const data = new FormData(e.currentTarget);
    data.set("source", pathname);
    const name = (data.get("name") as string).trim();
    const phone = (data.get("phone") as string).trim();

    const missing = [!name && "numele", !phone && "numărul de telefon"].filter(Boolean);

    if (missing.length > 0) {
      setInvalid({ name: !name, phone: !phone });
      setMessage(`Lipsește ${missing.join(" și ")}.`);
      setStatus("error");
      // focus pe primul câmp lipsă, ca să se poată completa imediat (și să fie anunțat de cititoarele de ecran)
      document.getElementById(!name ? ids.name : ids.phone)?.focus();
      return;
    }

    setInvalid({ name: false, phone: false });
    setStatus("pending");
    const result = await submitContactMessageAction({}, data);

    if (result.error) {
      setMessage(result.error);
      setStatus("error");
      return;
    }

    setStatus("success");
    setMessage("Mesajul a fost trimis! Te vom contacta în cel mai scurt timp.");
    formRef.current?.reset();

    setTimeout(() => setStatus("idle"), 5000);
  }

  const fieldPadding = "h-14 pl-11 pr-4";

  return (
    <form ref={formRef} onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
      {status === "error" && (
        <Alert variant="destructive">
          <AlertCircle aria-hidden />
          <AlertDescription>{message}</AlertDescription>
        </Alert>
      )}
      {status === "success" && (
        <Alert variant="success" role="status">
          <Check aria-hidden />
          <AlertDescription>{message}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Field id={ids.name} label="Nume complet" icon={<User />}>
          <input
            id={ids.name}
            name="name"
            autoComplete="name"
            placeholder="Ex. Ion Popescu"
            aria-required="true"
            aria-invalid={invalid.name}
            data-own-focus
            className={`${fieldBase} ${fieldPadding}`}
          />
        </Field>
        <Field id={ids.phone} label="Telefon" icon={<Phone />}>
          <input
            id={ids.phone}
            type="tel"
            name="phone"
            autoComplete="tel"
            inputMode="tel"
            placeholder="Ex. 069 123 456"
            aria-required="true"
            aria-invalid={invalid.phone}
            data-own-focus
            className={`${fieldBase} ${fieldPadding}`}
          />
        </Field>
        <Field id={ids.email} label="Email" optional icon={<Mail />}>
          <input
            id={ids.email}
            type="email"
            name="email"
            autoComplete="email"
            placeholder="nume@exemplu.md"
            data-own-focus
            className={`${fieldBase} ${fieldPadding}`}
          />
        </Field>
        <Field id={ids.subject} label="Subiect" optional icon={<Tag />}>
          <input
            id={ids.subject}
            type="text"
            name="subject"
            placeholder="Despre ce vrei să ne scrii?"
            data-own-focus
            className={`${fieldBase} ${fieldPadding}`}
          />
        </Field>
      </div>

      <Field id={ids.message} label="Mesajul tău" optional icon={<MessageSquareText />}>
        <textarea
          id={ids.message}
          name="message"
          rows={5}
          placeholder="Scrie aici mesajul tău…"
          data-own-focus
          className={`${fieldBase} min-h-36 resize-y py-4 pl-11 pr-4`}
        />
      </Field>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="flex items-center gap-2 text-xs text-muted-foreground sm:max-w-xs">
          <ShieldCheck className="h-4 w-4 shrink-0 text-accent" aria-hidden />
          Datele tale sunt în siguranță. Nu le vom folosi în alte scopuri.
        </p>
        <button
          type="submit"
          disabled={status === "success" || status === "pending"}
          className="inline-flex h-14 items-center justify-center gap-2.5 rounded-full bg-accent px-9 text-sm font-bold uppercase tracking-wide text-accent-foreground shadow-md transition-all hover:bg-brand-red-dark hover:shadow-lg active:scale-[0.98] disabled:opacity-80 disabled:hover:bg-accent sm:min-w-56"
        >
          {status === "success" ? (
            <>
              Trimis
              <Check className="h-5 w-5" aria-hidden />
            </>
          ) : status === "pending" ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
              Se trimite...
            </>
          ) : (
            <>
              Trimite mesajul
              <Send className="h-5 w-5" aria-hidden />
            </>
          )}
        </button>
      </div>
    </form>
  );
}
