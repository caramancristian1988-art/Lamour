"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { lineTotal, normalizeTiers, savingsPercent, unitPriceFor, type PriceTier } from "@/lib/pricing";
import { getCatalogEntries, type CatalogEntry } from "@/lib/cartCatalog";

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

export interface CatalogSyncResult {
  /** Prețuri/praguri/nume schimbate sau produse dispărute față de ce era în coș. */
  changed: boolean;
  /** Numele produselor scoase din coș fiindcă nu mai există în catalog. */
  removed: string[];
  /** Coșul după reîmprospătare (neschimbat dacă `failed`). */
  items: CartItem[];
  /** Serverul nu a putut fi interogat — coșul a rămas cum era. */
  failed: boolean;
}

interface CartContextValue {
  items: CartItem[];
  lines: CartLine[];
  cartCount: number;
  subtotal: number;
  /** Reducerea totală: preț vechi + praguri de cantitate. */
  savings: number;
  /** Reîmprospătează prețurile din catalog (coșul din localStorage poate fi vechi). */
  syncWithCatalog: () => Promise<CatalogSyncResult>;
  /** Mesaj afișat în coș când reîmprospătarea de la deschidere a schimbat ceva. */
  catalogNotice: string | null;
  dismissCatalogNotice: () => void;
  addToCart: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  removeFromCart: (slug: string) => void;
  updateQuantity: (slug: string, quantity: number) => void;
  changeVariant: (oldSlug: string, next: Omit<CartItem, "quantity">) => void;
  clearCart: () => void;
  /** Înlocuiește tot coșul — folosit la /editare-comanda, ca să hidrateze
   * coșul unui operator cu produsele unei comenzi existente. */
  replaceCart: (items: CartItem[]) => void;
}

const CartContext = createContext<CartContextValue | null>(null);

const STORAGE_KEY = "site-cart";

// Ce contează pentru client: dacă asta se schimbă, totalul afișat nu mai e cel real.
function priceSignature(items: CartItem[]): string {
  return JSON.stringify(items.map((i) => [i.slug, i.name, i.price, i.oldPrice ?? null, i.tiers ?? []]));
}

/** Suprapune datele proaspete din catalog peste coș; produsele dispărute sunt scoase. Pură și idempotentă. */
function mergeCatalog(items: CartItem[], catalog: CatalogEntry[]): { items: CartItem[]; removed: string[] } {
  const bySlug = new Map(catalog.map((e) => [e.slug, e]));
  const removed: string[] = [];
  const next: CartItem[] = [];
  for (const item of items) {
    const entry = bySlug.get(item.slug);
    if (!entry) {
      removed.push(item.name);
      continue;
    }
    const variantOptions = item.variantOptions?.flatMap((opt) => {
      const e = bySlug.get(opt.slug);
      return e ? [{ ...opt, price: e.price, oldPrice: e.oldPrice, priceTiers: e.tiers }] : [];
    });
    next.push({
      ...item,
      name: entry.name,
      price: entry.price,
      oldPrice: entry.oldPrice,
      image: entry.image,
      tiers: entry.tiers,
      ...(variantOptions ? { variantOptions } : {}),
    });
  }
  return { items: next, removed };
}

/** Coșul cu prețul fiecărei linii deja rezolvat pe baza cantității. */
export function buildLines(items: CartItem[]): CartLine[] {
  return items.map((item) => {
    const tiers = normalizeTiers({ priceTiers: item.tiers });
    const unitPrice = unitPriceFor(item.price, tiers, item.quantity);
    return {
      ...item,
      tiers,
      unitPrice,
      total: lineTotal(item.price, tiers, item.quantity),
      tierPercent: savingsPercent(item.price, unitPrice),
    };
  });
}

/** Subtotalul și reducerea (preț vechi + praguri) pentru un set de linii. */
export function cartTotals(lines: CartLine[]): { subtotal: number; savings: number } {
  const subtotal = lines.reduce((sum, l) => sum + l.total, 0);
  const savings = lines.reduce((sum, l) => {
    const reference = l.oldPrice ?? l.price;
    return sum + Math.max(0, reference - l.unitPrice) * l.quantity;
  }, 0);
  return { subtotal, savings };
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [catalogNotice, setCatalogNotice] = useState<string | null>(null);
  const itemsRef = useRef<CartItem[]>([]);

  useEffect(() => {
    itemsRef.current = items;
  }, [items]);

  const runSync = useCallback(async (current: CartItem[], announce: boolean): Promise<CatalogSyncResult> => {
    if (current.length === 0) return { changed: false, removed: [], items: current, failed: false };
    const slugs = current.flatMap((i) => [i.slug, ...(i.variantOptions?.map((o) => o.slug) ?? [])]);
    try {
      const catalog = await getCatalogEntries(slugs);
      const { items: merged, removed } = mergeCatalog(current, catalog);
      const found = new Set(catalog.map((e) => e.slug));
      const pricesChanged = priceSignature(merged) !== priceSignature(current.filter((i) => found.has(i.slug)));
      const changed = removed.length > 0 || pricesChanged;

      // Pe versiunea cea mai recentă a coșului, nu pe instantaneul de la începutul cererii —
      // utilizatorul poate fi schimbat cantități între timp.
      setItems((prev) => {
        const next = mergeCatalog(prev, catalog).items;
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        return next;
      });

      if (announce && changed) {
        const parts = [
          ...removed.map((n) => `„${n}” nu mai este disponibil și a fost scos din coș.`),
          pricesChanged ? "Prețurile din coș au fost actualizate." : null,
        ].filter(Boolean);
        setCatalogNotice(parts.join(" "));
      }
      return { changed, removed, items: merged, failed: false };
    } catch {
      return { changed: false, removed: [], items: current, failed: true };
    }
  }, []);

  const syncWithCatalog = useCallback(() => runSync(itemsRef.current, false), [runSync]);

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (!stored) return;
    try {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) {
        setItems(parsed);
        // Coșul din localStorage poate fi vechi (preț vechi scos din admin, produs șters) —
        // îl aducem la zi imediat, înainte să apuce clientul să comande cu date greșite.
        void runSync(parsed, true);
      }
    } catch {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  }, [runSync]);

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

  function replaceCart(next: CartItem[]) {
    persist(next);
  }

  const lines = useMemo<CartLine[]>(() => buildLines(items), [items]);

  const cartCount = lines.reduce((sum, l) => sum + l.quantity, 0);
  const { subtotal, savings } = cartTotals(lines);

  return (
    <CartContext.Provider
      value={{
        items,
        lines,
        cartCount,
        subtotal,
        savings,
        syncWithCatalog,
        catalogNotice,
        dismissCatalogNotice: () => setCatalogNotice(null),
        addToCart,
        removeFromCart,
        updateQuantity,
        changeVariant,
        clearCart,
        replaceCart,
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
