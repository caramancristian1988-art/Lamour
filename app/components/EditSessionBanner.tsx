"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Pencil, X } from "lucide-react";
import { useCart } from "./CartProvider";
import { useOrderEditSession, clearOrderEditSession } from "@/lib/orderEditSession";

// Bară persistentă, vizibilă pe orice pagină cât timp un operator editează o
// comandă (deschisă din linkul "Editează" din Telegram) — ca să știe mereu
// unde e ("Adaugă produse", "Vezi coșul") fără să caute, indiferent unde
// navighează pe site între timp.
export default function EditSessionBanner() {
  const session = useOrderEditSession();
  const pathname = usePathname();
  const router = useRouter();
  const { clearCart } = useCart();

  if (!session || pathname?.startsWith("/admin") || pathname === "/editare-comanda") return null;

  function handleCancel() {
    if (!confirm("Renunți la editarea acestei comenzi? Coșul se golește.")) return;
    clearOrderEditSession();
    clearCart();
    router.push("/");
  }

  return (
    <div className="sticky top-0 z-50 bg-accent text-accent-foreground">
      <div className="max-w-7xl mx-auto px-4 py-2 flex items-center gap-x-4 gap-y-1 flex-wrap text-sm">
        <span className="inline-flex items-center gap-1.5 font-bold shrink-0">
          <Pencil className="w-3.5 h-3.5" aria-hidden />
          Editezi comanda lui {session.name}
        </span>
        <Link href="/produse" className="underline hover:no-underline">
          Adaugă produse
        </Link>
        <Link href="/cos" className="underline hover:no-underline">
          Vezi coșul
        </Link>
        <Link href="/finalizare-comanda" className="underline hover:no-underline font-bold">
          Salvează comanda
        </Link>
        <button
          type="button"
          onClick={handleCancel}
          className="ml-auto inline-flex items-center gap-1 opacity-80 hover:opacity-100 transition-opacity shrink-0"
        >
          <X className="w-3.5 h-3.5" aria-hidden />
          Renunță
        </button>
      </div>
    </div>
  );
}
