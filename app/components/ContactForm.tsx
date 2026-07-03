"use client";

import { useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { AlertCircle, Check, ShieldCheck } from "lucide-react";
import { submitContactMessageAction } from "@/lib/adminMessageActions";
import { Input } from "@/app/components/ui/input";
import { Textarea } from "@/app/components/ui/textarea";
import { Button } from "@/app/components/ui/button";
import { Alert, AlertDescription } from "@/app/components/ui/alert";

type Status = "idle" | "error" | "success" | "pending";

export default function ContactForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const pathname = usePathname();
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const data = new FormData(e.currentTarget);
    data.set("source", pathname);
    const name = (data.get("name") as string).trim();
    const phone = (data.get("phone") as string).trim();

    const missing = [!name && "numele", !phone && "numărul de telefon"].filter(Boolean);

    if (missing.length > 0) {
      setMessage(`Lipsește ${missing.join(" și ")}.`);
      setStatus("error");
      return;
    }

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

  return (
    <form ref={formRef} onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
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

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input name="name" placeholder="Nume complet" aria-label="Nume complet" />
        <Input type="tel" name="phone" placeholder="Telefon" aria-label="Telefon" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input type="email" name="email" placeholder="Email (opțional)" aria-label="Email" />
        <Input type="text" name="subject" placeholder="Subiect (opțional)" aria-label="Subiect" />
      </div>
      <Textarea name="message" placeholder="Mesajul tău (opțional)" rows={5} aria-label="Mesaj" />
      <div>
        <Button
          type="submit"
          variant={status === "success" ? "secondary" : "accent"}
          disabled={status === "success" || status === "pending"}
        >
          {status === "success" ? (
            <>
              Trimis
              <Check className="w-4 h-4" aria-hidden />
            </>
          ) : status === "pending" ? (
            "Se trimite..."
          ) : (
            "Trimite mesaj"
          )}
        </Button>
        <p className="text-xs text-muted-foreground mt-3 flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 shrink-0" aria-hidden />
          Datele tale sunt în siguranță. Nu le vom folosi în alte scopuri.
        </p>
      </div>
    </form>
  );
}
