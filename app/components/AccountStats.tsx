"use client";

import Link from "next/link";
import { Heart, ShoppingCart } from "lucide-react";
import { useFavorites } from "./FavoritesProvider";
import { useCart } from "./CartProvider";

export default function AccountStats() {
  const { favorites } = useFavorites();
  const { cartCount } = useCart();

  return (
    <div className="grid grid-cols-2 gap-4 mb-6">
      <Link
        href="/favorite"
        className="border border-border rounded-2xl p-5 flex items-center gap-4 hover:shadow-md hover:-translate-y-0.5 transition-all bg-card"
      >
        <span className="w-11 h-11 rounded-full bg-muted text-accent flex items-center justify-center shrink-0">
          <Heart className="w-5 h-5" aria-hidden />
        </span>
        <div>
          <p className="text-2xl font-extrabold text-primary leading-none mb-1">{favorites.length}</p>
          <p className="text-sm text-muted-foreground">Produse favorite</p>
        </div>
      </Link>
      <Link
        href="/cos"
        className="border border-border rounded-2xl p-5 flex items-center gap-4 hover:shadow-md hover:-translate-y-0.5 transition-all bg-card"
      >
        <span className="w-11 h-11 rounded-full bg-muted text-accent flex items-center justify-center shrink-0">
          <ShoppingCart className="w-5 h-5" aria-hidden />
        </span>
        <div>
          <p className="text-2xl font-extrabold text-primary leading-none mb-1">{cartCount}</p>
          <p className="text-sm text-muted-foreground">Produse în coș</p>
        </div>
      </Link>
    </div>
  );
}
