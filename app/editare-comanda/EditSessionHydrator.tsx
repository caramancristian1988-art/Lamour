"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCart, type CartItem } from "@/app/components/CartProvider";
import { setOrderEditSession, type OrderEditSession } from "@/lib/orderEditSession";

export type { OrderEditSession };

// Hidratează coșul operatorului cu produsele comenzii deschise din Telegram,
// salvează datele de livrare ca CheckoutPanel să le pre-completeze, apoi
// trece automat pe pagina coșului — exact fluxul "apasă Editează, ajunge
// direct în coș cu tot ce trebuie deja acolo".
export default function EditSessionHydrator({ items, session }: { items: CartItem[]; session: OrderEditSession }) {
  const { replaceCart } = useCart();
  const router = useRouter();

  useEffect(() => {
    replaceCart(items);
    setOrderEditSession(session);
    router.replace("/cos");
    // Rulează o singură dată, la deschiderea linkului — nu la fiecare
    // schimbare de referință a `items`/`session` (obiecte noi la fiecare render server).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <main className="max-w-lg mx-auto px-4 py-24 text-center">
      <p className="text-muted-foreground text-sm">Se deschide comanda...</p>
    </main>
  );
}
