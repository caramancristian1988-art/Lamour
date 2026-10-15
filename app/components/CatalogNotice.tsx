"use client";

import { Info, X } from "lucide-react";
import { useCart } from "./CartProvider";
import { Alert, AlertDescription } from "@/app/components/ui/alert";

// Apare când coșul din localStorage a fost adus la zi față de catalog (preț schimbat,
// produs dispărut) — altfel clientul ar vedea totalul schimbat fără nicio explicație.
export default function CatalogNotice() {
  const { catalogNotice, dismissCatalogNotice } = useCart();
  if (!catalogNotice) return null;

  return (
    <Alert variant="accent" className="mb-6">
      <Info aria-hidden />
      <AlertDescription className="flex-1">{catalogNotice}</AlertDescription>
      <button
        type="button"
        onClick={dismissCatalogNotice}
        aria-label="Închide mesajul"
        className="shrink-0 rounded-md p-0.5 hover:bg-accent/10"
      >
        <X className="w-4 h-4" aria-hidden />
      </button>
    </Alert>
  );
}
