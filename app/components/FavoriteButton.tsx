"use client";

import { useFavorites, type FavoriteItem } from "./FavoritesProvider";

export default function FavoriteButton({ product }: { product: FavoriteItem }) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const liked = isFavorite(product.slug);

  return (
    <button
      onClick={() => toggleFavorite(product)}
      aria-label={liked ? "Elimină din favorite" : "Adaugă la favorite"}
      className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
        liked
          ? "bg-[#c7092b] text-white shadow-md"
          : "bg-white border border-gray-200 text-gray-400 hover:border-[#c7092b] hover:text-[#c7092b]"
      }`}
    >
      <svg
        className="w-4.5 h-4.5"
        fill={liked ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth={2}
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
        />
      </svg>
    </button>
  );
}
