"use client";

import Link from "next/link";
import { Heart } from "lucide-react";
import { useFavorites } from "../components/FavoritesProvider";
import ProductCard from "../components/ProductCard";
import { Button } from "@/app/components/ui/button";

export default function FavoritePage() {
  const { favorites } = useFavorites();

  return (
    <main className="bg-background min-h-[60vh]">
      <section className="border-b border-border bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-8">
          <nav className="flex items-center gap-1.5 text-xs text-muted-foreground mb-4" aria-label="Fir de ariadnă">
            <Link href="/" className="hover:text-accent transition-colors">Acasă</Link>
            <span aria-hidden>›</span>
            <span className="text-foreground">Favorite</span>
          </nav>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-primary">
            Produsele mele <span className="text-accent">favorite</span>
          </h1>
          <p className="text-muted-foreground text-sm mt-2">
            {favorites.length > 0
              ? `${favorites.length} produs${favorites.length === 1 ? "" : "e"} salvat${favorites.length === 1 ? "" : "e"}`
              : "Nu ai salvat încă niciun produs favorit."}
          </p>
        </div>
      </section>

      <section className="py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
          {favorites.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-5">
              {favorites.map((product) => (
                <ProductCard key={product.slug} {...product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <Heart className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" strokeWidth={1.5} aria-hidden />
              <p className="text-muted-foreground mb-6">Apasă pe inimioara unui produs pentru a-l salva aici.</p>
              <Button asChild variant="primary">
                <Link href="/produse">Vezi produsele</Link>
              </Button>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
