"use client";

import { useFavorites } from "./FavoritesProvider";

export default function FavoritesBadge({ className }: { className: string }) {
  const { favorites } = useFavorites();
  if (favorites.length === 0) return null;

  return (
    <span className={className}>{favorites.length}</span>
  );
}
