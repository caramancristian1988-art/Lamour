"use client";

import { Heart } from "lucide-react";
import { useFavorites, type FavoriteItem } from "./FavoritesProvider";
import { cn } from "@/lib/utils";

export default function FavoriteButton({ product }: { product: FavoriteItem }) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const liked = isFavorite(product.slug);

  return (
    <button
      onClick={() => toggleFavorite(product)}
      aria-pressed={liked}
      aria-label={liked ? "Elimină din favorite" : "Adaugă la favorite"}
      className={cn(
        "w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all active:scale-90 shadow-sm",
        liked
          ? "bg-accent text-white shadow-md"
          : "bg-card border border-border text-muted-foreground hover:border-accent hover:text-accent"
      )}
    >
      <Heart
        key={String(liked)}
        className={cn("w-4.5 h-4.5", liked && "animate-pop")}
        fill={liked ? "currentColor" : "none"}
        aria-hidden
      />
    </button>
  );
}
