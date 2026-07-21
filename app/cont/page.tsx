import Link from "next/link";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { LayoutDashboard } from "lucide-react";
import { getSession } from "@/lib/auth";
import { logoutAction } from "@/lib/authActions";
import AccountStats from "../components/AccountStats";
import { Avatar, AvatarFallback } from "@/app/components/ui/avatar";
import { Button } from "@/app/components/ui/button";

export const metadata: Metadata = {
  title: "Contul meu",
  robots: { index: false, follow: true },
};

export default async function ContPage() {
  const user = await getSession();
  if (!user) redirect("/login");

  const initials = user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

  return (
    <main className="bg-background min-h-[70vh]">
      <section className="border-b border-border bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-8">
          <nav className="flex items-center gap-1.5 text-xs text-muted-foreground mb-4" aria-label="Fir de ariadnă">
            <Link href="/" className="hover:text-accent transition-colors">Acasă</Link>
            <span aria-hidden>›</span>
            <span className="text-foreground">Contul meu</span>
          </nav>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-primary">
            Contul <span className="text-accent">meu</span>
          </h1>
        </div>
      </section>

      <section className="py-10">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-12">
          <div className="flex items-center gap-4 mb-8">
            <Avatar className="w-16 h-16 shrink-0">
              <AvatarFallback className="text-xl">{initials}</AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="font-extrabold text-lg text-primary truncate">{user.name}</p>
              <p className="text-sm text-muted-foreground truncate">{user.email}</p>
            </div>
          </div>

          {user.isAdmin && (
            <Button asChild variant="primary" className="w-full mb-8 gap-2">
              <Link href="/admin">
                <LayoutDashboard className="w-5 h-5" aria-hidden />
                Mergi la pagina de administrator
              </Link>
            </Button>
          )}

          <AccountStats />

          <div className="border-t border-border pt-6">
            <form action={logoutAction}>
              <button
                type="submit"
                className="text-sm font-bold text-muted-foreground hover:text-accent transition-colors"
              >
                Deconectează-te
              </button>
            </form>
          </div>
        </div>
      </section>
    </main>
  );
}
