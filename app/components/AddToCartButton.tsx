"use client";

import { useState } from "react";
import Image from "next/image";
import { Check, ImageOff } from "lucide-react";
import { useCart, type CartVariantOption } from "./CartProvider";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "./ui/dialog";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";

interface Props {
  slug: string;
  name: string;
  price: number;
  oldPrice?: number | null;
  image: string | null;
  inStock?: boolean;
  className: string;
  children: React.ReactNode;
  variantOptions?: CartVariantOption[];
  variantLabel?: string | null;
  // The product detail page already had the admin/customer pick a variant by
  // navigating to that variant's own page, so asking again there would just
  // be a redundant extra click — only listing cards (one card standing in
  // for a whole size family) need the popup.
  promptVariant?: boolean;
}

export default function AddToCartButton({
  slug,
  name,
  price,
  oldPrice = null,
  image,
  inStock = true,
  className,
  children,
  variantOptions,
  variantLabel = null,
  promptVariant = true,
}: Props) {
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);
  const [bump, setBump] = useState(0);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pendingSlug, setPendingSlug] = useState(slug);

  const hasVariants = Boolean(variantOptions && variantOptions.length > 1);

  function confirmAdd(chosenSlug: string, chosenPrice: number, chosenOldPrice: number | null, chosenLabel: string | null) {
    addToCart({ slug: chosenSlug, name, price: chosenPrice, oldPrice: chosenOldPrice, image, variantLabel: chosenLabel, variantOptions });
    setAdded(true);
    setBump((b) => b + 1);
    setTimeout(() => setAdded(false), 1500);
  }

  function handleClick(e: React.MouseEvent) {
    if (hasVariants && promptVariant) {
      e.preventDefault();
      e.stopPropagation();
      setPendingSlug(slug);
      setPickerOpen(true);
      return;
    }
    confirmAdd(slug, price, oldPrice, variantLabel);
  }

  const pending = variantOptions?.find((v) => v.slug === pendingSlug);
  const pendingDiscount = pending?.oldPrice ? Math.round((1 - pending.price / pending.oldPrice) * 100) : null;

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        disabled={!inStock}
        key={bump}
        className={`${className} active:scale-90 transition-transform duration-150 ${bump ? "animate-bump" : ""}`}
      >
        {added ? (
          <span key="added" className="contents animate-pop">
            <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4" strokeWidth={2.5} aria-hidden />
            <span>Adăugat!</span>
          </span>
        ) : (
          children
        )}
      </button>

      {hasVariants && (
        <Dialog open={pickerOpen} onOpenChange={setPickerOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Alege varianta</DialogTitle>
            </DialogHeader>

            <div className="flex items-center gap-3 p-3 border border-border rounded-xl bg-muted">
              <span className="relative w-16 h-16 rounded-lg bg-card overflow-hidden shrink-0 border border-border flex items-center justify-center">
                {image ? (
                  <Image src={image} alt={name} fill className="object-contain p-1" sizes="64px" />
                ) : (
                  <ImageOff className="w-6 h-6 text-muted-foreground" aria-hidden />
                )}
              </span>
              <p className="text-sm font-bold text-primary line-clamp-2">{name}</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {variantOptions!.map((v) => (
                <button
                  key={v.slug}
                  type="button"
                  onClick={() => setPendingSlug(v.slug)}
                  className={`px-3 py-2.5 rounded-xl text-sm font-bold border-2 transition-all active:scale-95 ${
                    v.slug === pendingSlug
                      ? "bg-primary text-white border-primary shadow-md"
                      : "bg-card text-foreground border-border hover:border-accent hover:text-accent"
                  }`}
                >
                  {v.variantLabel ?? "—"}
                </button>
              ))}
            </div>

            {pending && (
              <div className="flex items-center gap-2 flex-wrap border-t border-border pt-4">
                <span className="text-2xl font-bold text-primary">{pending.price.toLocaleString("ro-MD")} MDL</span>
                {pending.oldPrice && (
                  <>
                    <span className="text-sm text-muted-foreground line-through">
                      {pending.oldPrice.toLocaleString("ro-MD")} MDL
                    </span>
                    {pendingDiscount && (
                      <Badge variant="accent" className="normal-case">-{pendingDiscount}%</Badge>
                    )}
                  </>
                )}
              </div>
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="accent"
                disabled={!pending}
                className="w-full sm:w-auto"
                onClick={() => {
                  if (pending) confirmAdd(pending.slug, pending.price, pending.oldPrice, pending.variantLabel);
                  setPickerOpen(false);
                }}
              >
                Adaugă în coș
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
