"use client";

import { useState } from "react";
import { Check, Send } from "lucide-react";

export default function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setStatus("loading");
    await new Promise((r) => setTimeout(r, 800));
    setStatus("success");
    setEmail("");
  };

  if (status === "success") {
    return (
      <div className="flex items-center gap-2 text-white text-sm font-semibold" role="status">
        <Check className="w-4 h-4" aria-hidden />
        Te-ai abonat cu succes!
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="relative">
      <label htmlFor="newsletter-email" className="sr-only">
        Adresa ta de email
      </label>
      <input
        id="newsletter-email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Emailul tău"
        required
        className="w-full h-12 pl-4 pr-14 rounded-xl border border-white/25 bg-white/10 text-white placeholder-white/50 text-sm focus-visible:outline-none focus-visible:bg-white/15 focus-visible:ring-3 focus-visible:ring-white/30 transition-all"
      />
      <button
        type="submit"
        disabled={status === "loading"}
        aria-label="Abonează-te"
        className="absolute right-1 top-1 h-10 w-10 rounded-lg flex items-center justify-center text-white bg-accent hover:bg-brand-red-dark transition-colors disabled:opacity-60"
      >
        <Send className="w-4 h-4" aria-hidden />
      </button>
    </form>
  );
}
