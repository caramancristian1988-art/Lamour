"use client";

import { createContext, useContext, useEffect, useState } from "react";

export interface FavoriteItem {
  slug: string;
  name: string;
  price: number;
  oldPrice?: number | null;
  image?: string | null;
  btu?: number | null;
  technology?: string | null;
  energyClass?: string | null;
  rating: number;
  reviewCount: number;
  badge?: string | null;
}

interface FavoritesContextValue {
  favorites: FavoriteItem[];
  toggleFavorite: (item: FavoriteItem) => void;
  isFavorite: (slug: string) => boolean;
}

const FavoritesContext = createContext<FavoritesContextValue | null>(null);

const STORAGE_KEY = "climatrapid-favorites";

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && (parsed.length === 0 || typeof parsed[0] === "object")) {
          setFavorites(parsed);
        }
      } catch {
        // ignore corrupted storage
      }
    }
  }, []);

  const toggleFavorite = (item: FavoriteItem) => {
    setFavorites((prev) => {
      const next = prev.some((f) => f.slug === item.slug)
        ? prev.filter((f) => f.slug !== item.slug)
        : [...prev, item];
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  };

  const isFavorite = (slug: string) => favorites.some((f) => f.slug === slug);

  return (
    <FavoritesContext.Provider value={{ favorites, toggleFavorite, isFavorite }}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const ctx = useContext(FavoritesContext);
  if (!ctx) throw new Error("useFavorites must be used within a FavoritesProvider");
  return ctx;
}
