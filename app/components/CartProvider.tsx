"use client";

import { createContext, useContext, useEffect, useState } from "react";

export interface CartVariantOption {
  slug: string;
  variantLabel: string | null;
  price: number;
  oldPrice: number | null;
}

export interface CartItem {
  slug: string;
  name: string;
  price: number;
  oldPrice: number | null;
  image: string | null;
  quantity: number;
  // Present when this line is one size/quantity option among several for the
  // same product — lets the cart page offer a "change size" control without
  // a server round-trip, since the whole family was already fetched once.
  variantLabel?: string | null;
  variantOptions?: CartVariantOption[];
}

interface CartContextValue {
  items: CartItem[];
  cartCount: number;
  addToCart: (item: Omit<CartItem, "quantity">) => void;
  removeFromCart: (slug: string) => void;
  updateQuantity: (slug: string, quantity: number) => void;
  changeVariant: (oldSlug: string, next: Omit<CartItem, "quantity">) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

const STORAGE_KEY = "site-cart";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored) setItems(JSON.parse(stored));
  }, []);

  function persist(next: CartItem[]) {
    setItems(next);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }

  function addToCart(item: Omit<CartItem, "quantity">) {
    setItems((prev) => {
      const existing = prev.find((i) => i.slug === item.slug);
      const next = existing
        ? prev.map((i) => (i.slug === item.slug ? { ...i, quantity: i.quantity + 1 } : i))
        : [...prev, { ...item, quantity: 1 }];
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }

  function removeFromCart(slug: string) {
    persist(items.filter((i) => i.slug !== slug));
  }

  function updateQuantity(slug: string, quantity: number) {
    if (quantity < 1) return;
    persist(items.map((i) => (i.slug === slug ? { ...i, quantity } : i)));
  }

  // Swaps a cart line to a different size/quantity of the same product,
  // keeping its quantity. If that size is already its own line (e.g. added
  // separately earlier), merge into it instead of creating a duplicate.
  function changeVariant(oldSlug: string, next: Omit<CartItem, "quantity">) {
    setItems((prev) => {
      const current = prev.find((i) => i.slug === oldSlug);
      if (!current || next.slug === oldSlug) return prev;

      const existingTarget = prev.find((i) => i.slug === next.slug);
      const nextItems = existingTarget
        ? prev
            .filter((i) => i.slug !== oldSlug)
            .map((i) => (i.slug === next.slug ? { ...i, quantity: i.quantity + current.quantity } : i))
        : prev.map((i) => (i.slug === oldSlug ? { ...next, quantity: current.quantity } : i));

      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextItems));
      return nextItems;
    });
  }

  function clearCart() {
    persist([]);
  }

  const cartCount = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <CartContext.Provider value={{ items, cartCount, addToCart, removeFromCart, updateQuantity, changeVariant, clearCart }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within a CartProvider");
  return ctx;
}
