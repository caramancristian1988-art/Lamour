import Link from "next/link";
import type { Metadata } from "next";
import { Home, Package, Mail } from "lucide-react";
import { SITE_NAME } from "@/lib/constants";
import { Button } from "@/app/components/ui/button";

export const metadata: Metadata = {
  title: `Pagina nu a fost găsită | ${SITE_NAME}`,
};

export default function NotFound() {
  return (
    <main className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="text-[96px] sm:text-[120px] font-bold text-primary leading-none select-none tracking-tight">
          4<span className="text-accent">0</span>4
        </div>
        <h1 className="text-2xl font-bold text-primary tracking-tight mt-4 mb-2">
          Pagina nu a fost găsită
        </h1>
        <p className="text-muted-foreground text-sm sm:text-base leading-relaxed mb-8">
          Pagina pe care o cauți nu există sau a fost mutată. Încearcă să revii la pagina principală.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button asChild variant="accent" size="lg">
            <Link href="/">
              <Home className="w-4 h-4" aria-hidden />
              Acasă
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/produse">
              <Package className="w-4 h-4" aria-hidden />
              Produse
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/contact">
              <Mail className="w-4 h-4" aria-hidden />
              Contact
            </Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
