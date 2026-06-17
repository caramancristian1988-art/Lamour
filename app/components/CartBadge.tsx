"use client";

import { useCart } from "./CartProvider";

export default function CartBadge({ className }: { className: string }) {
  const { cartCount } = useCart();
  if (cartCount === 0) return null;

  return (
    <span className={className}>{cartCount}</span>
  );
}
