"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RotateCw } from "lucide-react";
import { Button } from "@/app/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 bg-accent/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <AlertTriangle className="w-10 h-10 text-accent" aria-hidden />
        </div>
        <h1 className="text-2xl font-bold text-primary tracking-tight mb-2">
          A apărut o eroare
        </h1>
        <p className="text-muted-foreground text-sm sm:text-base leading-relaxed mb-8">
          Ceva nu a mers bine. Încearcă din nou sau revino mai târziu.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button onClick={reset} variant="accent" size="lg">
            <RotateCw className="w-4 h-4" aria-hidden />
            Încearcă din nou
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/">Acasă</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
