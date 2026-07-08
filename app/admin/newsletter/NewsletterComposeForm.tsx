"use client";

import { useActionState } from "react";
import { AlertCircle, Check } from "lucide-react";
import { sendNewsletterCampaignAction, type NewsletterCampaignState } from "@/lib/newsletterActions";
import { AdminInput, AdminTextarea } from "../components/AdminField";
import { Button } from "@/app/components/ui/button";
import { Alert, AlertDescription } from "@/app/components/ui/alert";

const initialState: NewsletterCampaignState = {};

export default function NewsletterComposeForm({ subscriberCount }: { subscriberCount: number }) {
  const [state, formAction, pending] = useActionState(sendNewsletterCampaignAction, initialState);

  return (
    <form action={formAction} className="bg-card border border-border rounded-2xl p-6 flex flex-col gap-4">
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

      <Button type="submit" variant="accent" disabled={pending || subscriberCount === 0} className="self-start mt-2">
        {pending ? "Se trimite..." : `Trimite către ${subscriberCount} abonați`}
      </Button>
    </form>
  );
}
