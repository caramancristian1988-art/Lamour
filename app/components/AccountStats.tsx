"use client";

import Link from "next/link";
import { useFavorites } from "./FavoritesProvider";
import { useCart } from "./CartProvider";

export default function AccountStats() {
  const { favorites } = useFavorites();
  const { cartCount } = useCart();

  return (
    <div className="grid grid-cols-2 gap-4 mb-6">
      <Link
        href="/favorite"
        className="border border-gray-100 rounded-2xl p-5 hover:shadow-md hover:-translate-y-0.5 transition-all"
      >
        <p className="text-2xl font-extrabold text-[#1d2353] mb-1">{favorites.length}</p>
        <p className="text-sm text-gray-500">Produse favorite</p>
      </Link>
      <Link
        href="/cos"
        className="border border-gray-100 rounded-2xl p-5 hover:shadow-md hover:-translate-y-0.5 transition-all"
      >
        <p className="text-2xl font-extrabold text-[#1d2353] mb-1">{cartCount}</p>
        <p className="text-sm text-gray-500">Produse în coș</p>
      </Link>
    </div>
  );
}
