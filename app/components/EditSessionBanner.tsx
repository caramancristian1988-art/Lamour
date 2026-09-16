"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Pencil, X } from "lucide-react";
import { useCart } from "./CartProvider";
import { useOrderEditSession, clearOrderEditSession } from "@/lib/orderEditSession";

// Bară vizibilă pe orice pagină cât timp un operator editează o comandă
// (deschisă din linkul "Editează" din Telegram) — ca să știe mereu unde e
// ("Adaugă produse", "Vezi coșul") fără să caute, indiferent unde navighează
// pe site între timp.
//
// Nu e sticky/fixed în mod intenționat: ScrollAwareHeader.tsx alternează
// singur între static și fixed (cu z-50) când utilizatorul derulează pagina,
// ca să se ascundă/reapară — o bară sticky separată cu propriul top-0/z-50
// intra în conflict cu acel comportament (se suprapuneau la derulare). Stă
// deci în flux normal, chiar sub header, ca orice altă secțiune a paginii.
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
    <div className="bg-primary text-primary-foreground">
      <div className="max-w-7xl mx-auto px-4 py-2.5 flex items-center gap-x-4 gap-y-2 flex-wrap">
        <span className="inline-flex items-center gap-1.5 text-sm font-bold shrink-0">
          <Pencil className="w-4 h-4 shrink-0" aria-hidden />
          Editezi comanda lui {session.name}
        </span>

        <div className="flex items-center gap-x-4 gap-y-1 flex-wrap text-sm">
          <Link href="/produse" className="text-primary-foreground/85 underline decoration-primary-foreground/40 underline-offset-2 hover:text-primary-foreground hover:decoration-primary-foreground transition-colors">
            Adaugă produse
          </Link>
          <Link href="/cos" className="text-primary-foreground/85 underline decoration-primary-foreground/40 underline-offset-2 hover:text-primary-foreground hover:decoration-primary-foreground transition-colors">
            Vezi coșul
          </Link>
        </div>

        <div className="flex items-center gap-3 shrink-0 ml-auto">
          <Link
            href="/finalizare-comanda"
            className="inline-flex items-center h-8 px-3.5 rounded-lg bg-card text-primary text-xs font-bold hover:bg-card/90 transition-colors shrink-0"
          >
            Salvează comanda
          </Link>
          <button
            type="button"
            onClick={handleCancel}
            aria-label="Renunță la editarea comenzii"
            className="inline-flex items-center gap-1 text-primary-foreground/70 hover:text-primary-foreground text-xs transition-colors shrink-0"
          >
            <X className="w-3.5 h-3.5" aria-hidden />
            Renunță
          </button>
        </div>
      </div>
    </div>
  );
}
