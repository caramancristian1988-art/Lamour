"use client";

import { useActionState } from "react";
import { Check, Send, AlertCircle } from "lucide-react";
import { subscribeAction, type NewsletterFormState } from "@/lib/newsletterActions";

const initialState: NewsletterFormState = {};

export default function NewsletterForm() {
  const [state, formAction, pending] = useActionState(subscribeAction, initialState);

  if (state.success) {
    return (
      <div className="flex items-center gap-2 text-white text-sm font-semibold" role="status">
        <Check className="w-4 h-4" aria-hidden />
        Te-ai abonat cu succes!
      </div>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-2">
      <div className="relative">
        <label htmlFor="newsletter-email" className="sr-only">
          Adresa ta de email
        </label>
        <input
          id="newsletter-email"
          type="email"
          name="email"
          placeholder="Emailul tău"
          required
          className="w-full h-12 pl-4 pr-14 rounded-xl border border-white/25 bg-white/10 text-white placeholder-white/50 text-sm focus-visible:outline-none focus-visible:bg-white/15 focus-visible:ring-3 focus-visible:ring-white/30 transition-all"
        />
        <button
          type="submit"
          disabled={pending}
          aria-label="Abonează-te"
          className="absolute right-1 top-1 h-10 w-10 rounded-lg flex items-center justify-center text-white bg-accent hover:bg-brand-red-dark transition-colors disabled:opacity-60"
        >
          <Send className="w-4 h-4" aria-hidden />
        </button>
      </div>
      {state.error && (
        <p className="flex items-center gap-1.5 text-xs text-white/80" role="alert">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" aria-hidden />
          {state.error}
        </p>
      )}
    </form>
  );
}
