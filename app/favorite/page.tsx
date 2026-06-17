"use client";

import Link from "next/link";
import { useFavorites } from "../components/FavoritesProvider";
import ProductCard from "../components/ProductCard";

export default function FavoritePage() {
  const { favorites } = useFavorites();

  return (
    <main className="bg-white min-h-[60vh]">
      <section className="border-b border-gray-100 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-8">
          <nav className="flex items-center gap-1.5 text-xs text-gray-400 mb-4">
            <Link href="/" className="hover:text-[#c7092b] transition-colors">Acasă</Link>
            <span>›</span>
            <span className="text-gray-600">Favorite</span>
          </nav>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#1d2353]">
            Produsele mele <span className="text-[#c7092b]">favorite</span>
          </h1>
          <p className="text-gray-500 text-sm mt-2">
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
              <svg className="w-16 h-16 text-gray-200 mx-auto mb-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              <p className="text-gray-500 mb-6">Apasă pe inimioara unui produs pentru a-l salva aici.</p>
              <Link
                href="/produse"
                className="inline-flex items-center bg-[#1d2353] hover:bg-[#2a3470] text-white font-bold px-6 py-3 rounded-xl transition-colors text-sm uppercase tracking-wide"
              >
                Vezi produsele
              </Link>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
