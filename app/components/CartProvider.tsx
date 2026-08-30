"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { lineTotal, normalizeTiers, savingsPercent, unitPriceFor, type PriceTier } from "@/lib/pricing";

export interface CartVariantOption {
  slug: string;
  variantLabel: string | null;
  price: number;
  oldPrice: number | null;
  // Fiecare variantă e propriul Product, deci are propriile praguri de cantitate.
  priceTiers?: PriceTier[];
}

export interface CartItem {
  slug: string;
  name: string;
  /** Prețul de listă per bucată. Pragurile din `tiers` îl pot reduce, niciodată majora. */
  price: number;
  oldPrice: number | null;
  image: string | null;
  quantity: number;
  // Present when this line is one size/quantity option among several for the
  // same product — lets the cart page offer a "change size" control without
  // a server round-trip, since the whole family was already fetched once.
  variantLabel?: string | null;
  variantOptions?: CartVariantOption[];
  // Praguri de preț pe cantitate, copiate din produs la adăugare, ca recalcularea
  // din coș să nu aibă nevoie de server. Sunt ale variantei din `slug`.
  tiers?: PriceTier[];
}

/** O linie din coș cu prețul deja rezolvat pe baza cantității. */
export interface CartLine extends CartItem {
  tiers: PriceTier[];
  /** Prețul per bucată efectiv plătit, după aplicarea pragului. */
  unitPrice: number;
  /** unitPrice × quantity. */
  total: number;
  /** Câte procente sub prețul de listă e unitPrice (0 dacă nu s-a atins niciun prag). */
  tierPercent: number;
}

interface CartContextValue {
  items: CartItem[];
  lines: CartLine[];
  cartCount: number;
  subtotal: number;
  /** Reducerea totală: preț vechi + praguri de cantitate. */
  savings: number;
  addToCart: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
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
    if (!stored) return;
    try {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) setItems(parsed);
    } catch {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  function persist(next: CartItem[]) {
    setItems(next);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }

  function addToCart(item: Omit<CartItem, "quantity">, quantity = 1) {
    const qty = Math.max(1, Math.floor(quantity));
    setItems((prev) => {
      const existing = prev.find((i) => i.slug === item.slug);
      const next = existing
        ? // Câmpurile se reîmprospătează din produs, ca un coș vechi din localStorage
          // să nu rămână blocat pe praguri sau prețuri care nu mai există.
          prev.map((i) => (i.slug === item.slug ? { ...i, ...item, quantity: i.quantity + qty } : i))
        : [...prev, { ...item, quantity: qty }];
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

  const lines = useMemo<CartLine[]>(
    () =>
      items.map((item) => {
        const tiers = normalizeTiers({ priceTiers: item.tiers });
        const unitPrice = unitPriceFor(item.price, tiers, item.quantity);
        return {
          ...item,
          tiers,
          unitPrice,
          total: lineTotal(item.price, tiers, item.quantity),
          tierPercent: savingsPercent(item.price, unitPrice),
        };
      }),
    [items]
  );

  const cartCount = lines.reduce((sum, l) => sum + l.quantity, 0);
  const subtotal = lines.reduce((sum, l) => sum + l.total, 0);
  const savings = lines.reduce((sum, l) => {
    const reference = l.oldPrice ?? l.price;
    return sum + Math.max(0, reference - l.unitPrice) * l.quantity;
  }, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        lines,
        cartCount,
        subtotal,
        savings,
        addToCart,
        removeFromCart,
        updateQuantity,
        changeVariant,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within a CartProvider");
  return ctx;
}
