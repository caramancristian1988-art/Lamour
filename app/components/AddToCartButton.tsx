"use client";

import { useState } from "react";
import { useCart } from "./CartProvider";

interface Props {
  slug: string;
  name: string;
  price: number;
  image: string | null;
  inStock?: boolean;
  className: string;
  children: React.ReactNode;
}

export default function AddToCartButton({ slug, name, price, image, inStock = true, className, children }: Props) {
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);

  function handleClick() {
    addToCart({ slug, name, price, image });
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  }

  return (
    <button onClick={handleClick} disabled={!inStock} className={className}>
      {added ? (
        <>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
          <span>Adăugat!</span>
        </>
      ) : (
        children
      )}
    </button>
  );
}
