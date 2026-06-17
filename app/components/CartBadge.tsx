"use client";

import { useCart } from "./CartProvider";

export default function CartBadge({ className }: { className: string }) {
  const { cartCount } = useCart();
  if (cartCount === 0) return null;

  return (
    <span key={cartCount} className={`${className} animate-bump`}>{cartCount}</span>
  );
}
