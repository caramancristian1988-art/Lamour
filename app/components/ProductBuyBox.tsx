"use client";

import { useState } from "react";
import { ShoppingCart } from "lucide-react";
import AddToCartButton from "./AddToCartButton";
import type { CartVariantOption } from "./CartProvider";
import TierQuantityPicker from "./TierQuantityPicker";
import { cn } from "@/lib/utils";
import { normalizeTiers, type PriceTier } from "@/lib/pricing";

interface Props {
  slug: string;
  name: string;
  price: number;
  oldPrice: number | null;
  image: string | null;
  inStock: boolean;
  tiers: PriceTier[];
  /** Familia de variante, ca linia din coș să poată fi schimbată mai târziu. */
  variantOptions?: CartVariantOption[];
  variantLabel?: string | null;
  /** Butonul de rate, randat lângă „Adaugă în coș”. */
  children?: React.ReactNode;
}

export default function ProductBuyBox({
  slug,
  name,
  price,
  oldPrice,
  image,
  inStock,
  tiers,
  variantOptions,
  variantLabel,
  children,
}: Props) {
  const normalized = normalizeTiers({ priceTiers: tiers });
  const [quantity, setQuantity] = useState(1);

  return (
    <div className="flex flex-col gap-4">
      <TierQuantityPicker
        price={price}
        tiers={normalized}
        quantity={quantity}
        onQuantityChange={setQuantity}
      />

      <div className="flex items-stretch gap-3">
        <AddToCartButton
          slug={slug}
          name={name}
          price={price}
          oldPrice={oldPrice}
          image={image}
          inStock={inStock}
          tiers={normalized}
          quantity={quantity}
          variantOptions={variantOptions}
          variantLabel={variantLabel}
          // Cantitatea și varianta se aleg deja pe pagina produsului, deci
          // popup-ul ar fi doar un click în plus.
          promptVariant={false}
          promptQuantity={false}
          className={cn(
            "h-12 rounded-xl text-sm font-bold uppercase tracking-wide flex items-center justify-center gap-2 transition-colors",
            children ? "flex-[3]" : "flex-1",
            inStock
              ? "bg-accent hover:bg-brand-red-dark text-accent-foreground"
              : "bg-muted text-muted-foreground cursor-not-allowed"
          )}
        >
          <ShoppingCart className="w-4 h-4 shrink-0" aria-hidden />
          {inStock ? "Adaugă în coș" : "Stoc epuizat"}
        </AddToCartButton>

        {children}
      </div>
    </div>
  );
}
