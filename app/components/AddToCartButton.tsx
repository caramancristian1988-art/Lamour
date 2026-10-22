"use client";

import { useState } from "react";
import Image from "next/image";
import { Check, ImageOff, ShoppingCart, X } from "lucide-react";
import { useCart, type CartVariantOption } from "./CartProvider";
import TierQuantityPicker from "./TierQuantityPicker";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle } from "./ui/dialog";
import { Badge } from "./ui/badge";
import { formatPrice, lineTotal, normalizeTiers, type PriceTier } from "@/lib/pricing";
import { dominantColor, peekDominantColor, themeVars, type Hsl } from "@/lib/imageTheme";

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
  /** Praguri de cantitate pentru `slug` (produsul fără variante, sau varianta proprie). */
  tiers?: PriceTier[];
  /** Câte bucăți adaugă un click când nu se deschide popup-ul. */
  quantity?: number;
  // Pagina produsului are deja selector de cantitate (ProductBuyBox), deci acolo
  // popup-ul ar fi un click redundant. Doar cardurile din listă îl cer.
  promptQuantity?: boolean;
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
  tiers,
  quantity = 1,
  promptQuantity = true,
}: Props) {
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);
  const [bump, setBump] = useState(0);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pendingSlug, setPendingSlug] = useState(slug);
  const [pendingQty, setPendingQty] = useState(1);
  // Culoarea ambalajului din poza produsului: fereastra de alegere ia aceeași culoare (mov pentru „Lamour", verde pentru un detergent …).
  const [imageColor, setImageColor] = useState<Hsl | null>(() => peekDominantColor(image) ?? null);
  const themeStyle = imageColor ? (themeVars(imageColor) as React.CSSProperties) : undefined;

  // Culoarea se calculează din timp (când treci cu mouse-ul / atingi butonul) ca fereastra să apară deja colorată; rezultatul se ține în memorie.
  function warmUpColor() {
    if (!image || peekDominantColor(image) !== undefined) return;
    void dominantColor(image);
  }

  const hasVariants = Boolean(variantOptions && variantOptions.length > 1);
  const ownTiers = normalizeTiers({ priceTiers: tiers });
  const hasTiers = ownTiers.length > 0;

  function confirmAdd(
    chosenSlug: string,
    chosenPrice: number,
    chosenOldPrice: number | null,
    chosenLabel: string | null,
    chosenTiers: PriceTier[],
    chosenQty: number
  ) {
    addToCart(
      {
        slug: chosenSlug,
        name,
        price: chosenPrice,
        oldPrice: chosenOldPrice,
        image,
        variantLabel: chosenLabel,
        variantOptions,
        tiers: chosenTiers,
      },
      chosenQty
    );
    setAdded(true);
    setBump((b) => b + 1);
    setTimeout(() => setAdded(false), 1500);
  }

  function handleClick(e: React.MouseEvent) {
    // Fără popup omul n-ar vedea niciodată nici variantele, nici pragurile de preț.
    if ((hasVariants && promptVariant) || (hasTiers && promptQuantity)) {
      e.preventDefault();
      e.stopPropagation();
      setPendingSlug(slug);
      setPendingQty(1);
      const known = peekDominantColor(image);
      if (known !== undefined) setImageColor(known);
      else void dominantColor(image).then(setImageColor); // fereastra se deschide imediat; se colorează îndată ce poza e citită
      setPickerOpen(true);
      return;
    }
    confirmAdd(slug, price, oldPrice, variantLabel, ownTiers, quantity);
  }

  // Fără variante, "varianta în curs" e chiar produsul cardului.
  const pending: CartVariantOption = hasVariants
    ? variantOptions!.find((v) => v.slug === pendingSlug) ?? {
        slug,
        variantLabel,
        price,
        oldPrice,
      }
    : { slug, variantLabel, price, oldPrice };

  // Pragurile aparțin variantei alese, nu cardului: fiecare variantă e alt Product.
  const pendingTiers = hasVariants
    ? normalizeTiers({ priceTiers: pending.priceTiers })
    : ownTiers;
  const pendingDiscount = pending.oldPrice ? Math.round((1 - pending.price / pending.oldPrice) * 100) : null;

  const dialogTitle = hasVariants
    ? pendingTiers.length > 0
      ? "Alege varianta și cantitatea"
      : "Alege varianta"
    : "Alege cantitatea";

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        onPointerEnter={warmUpColor}
        onFocus={warmUpColor}
        onTouchStart={warmUpColor}
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

      {(hasVariants || hasTiers) && (
        <Dialog open={pickerOpen} onOpenChange={setPickerOpen}>
          {/* Fereastră cu antet vișiniu (ca bara de sus a site-ului), conținut derulabil și buton „Adaugă” lipit jos. */}
          <DialogContent hideClose style={themeStyle} className="max-w-md gap-0 overflow-hidden p-0">
            <div className="relative shrink-0 overflow-hidden bg-gradient-to-br from-brand-maroon-dark via-brand-maroon to-brand-maroon-dark px-6 pb-5 pt-6 text-white">
              <div aria-hidden className="pointer-events-none absolute inset-0 bg-footer-pattern opacity-[0.08]" />
              <DialogClose
                aria-label="Închide fereastra"
                className="group absolute right-3 top-3 z-20 flex h-10 w-10 items-center justify-center rounded-full text-white/85 transition-all duration-200 hover:bg-white/20 hover:text-white active:scale-90"
              >
                <X className="h-5 w-5 transition-transform duration-300 group-hover:rotate-90" aria-hidden />
              </DialogClose>
              <DialogTitle className="relative animate-fade-up pr-12 font-serif text-2xl font-bold italic leading-tight text-white [animation-delay:80ms]">{dialogTitle}</DialogTitle>
              <DialogDescription className="relative mt-1 animate-fade-up text-sm text-white/75 [animation-delay:140ms]">
                {hasVariants ? "Alege mărimea și cantitatea, apoi adaugă produsul în coș." : "Cu cât cumperi mai mult, cu atât prețul pe bucată scade."}
              </DialogDescription>
            </div>

            <div className="flex flex-col gap-5 p-5 sm:p-6">
              <div className="flex animate-fade-up items-center gap-4 rounded-2xl border border-brand-rose/60 bg-card p-3 shadow-sm [animation-delay:160ms]">
                <span className="relative flex h-[4.5rem] w-[4.5rem] shrink-0 items-center justify-center overflow-hidden rounded-xl border border-border bg-white">
                  {image ? (
                    <Image src={image} alt="" fill className="object-contain p-1.5" sizes="72px" />
                  ) : (
                    <ImageOff className="h-6 w-6 text-muted-foreground" aria-hidden />
                  )}
                </span>
                <p className="line-clamp-3 text-[15px] font-bold leading-snug text-primary">{name}</p>
              </div>

              {hasVariants && (
                <div className="animate-fade-up [animation-delay:220ms]">
                  <p className="mb-2.5 text-xs font-extrabold uppercase tracking-widest text-accent">Mărime / variantă</p>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {variantOptions!.map((v) => (
                      <button
                        key={v.slug}
                        type="button"
                        aria-pressed={v.slug === pendingSlug}
                        onClick={() => {
                          setPendingSlug(v.slug);
                          // Pragurile diferă între variante, deci cantitatea aleasă
                          // pentru una nu se mai potrivește pe alta.
                          setPendingQty(1);
                        }}
                        className={`rounded-2xl border-2 px-3 py-3 text-sm font-bold transition-all active:scale-95 ${
                          v.slug === pendingSlug
                            ? "border-primary bg-primary text-white shadow-md"
                            : "border-border bg-card text-foreground hover:border-accent hover:text-accent"
                        }`}
                      >
                        {v.variantLabel ?? "—"}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {pendingTiers.length > 0 ? (
                <TierQuantityPicker
                  price={pending.price}
                  tiers={pendingTiers}
                  quantity={pendingQty}
                  onQuantityChange={setPendingQty}
                  compact
                  animate
                />
              ) : (
                <div className="flex animate-fade-up flex-wrap items-center gap-2.5 rounded-2xl bg-muted/70 p-4 [animation-delay:240ms]">
                  <span className="text-3xl font-extrabold text-primary">{formatPrice(pending.price)} MDL</span>
                  {pending.oldPrice && (
                    <>
                      <span className="text-sm text-muted-foreground line-through">{formatPrice(pending.oldPrice)} MDL</span>
                      {pendingDiscount && (
                        <Badge variant="accent" className="normal-case">
                          -{pendingDiscount}%
                        </Badge>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>

            <div className="sticky bottom-0 shrink-0 animate-fade-up border-t border-brand-rose/60 bg-card/95 p-4 backdrop-blur [animation-delay:380ms] sm:px-6">
              <button
                type="button"
                className="group relative flex h-14 w-full items-center justify-center gap-2.5 overflow-hidden rounded-full bg-accent px-6 text-base font-bold text-accent-foreground shadow-md transition-all hover:-translate-y-0.5 hover:bg-brand-red-dark hover:shadow-lg active:translate-y-0 active:scale-[0.98]"
                onClick={() => {
                  confirmAdd(
                    pending.slug,
                    pending.price,
                    pending.oldPrice,
                    pending.variantLabel,
                    pendingTiers,
                    pendingTiers.length > 0 ? pendingQty : 1
                  );
                  setPickerOpen(false);
                }}
              >
                {/* strălucire care trece peste buton la hover */}
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-y-0 -left-full w-1/2 -skew-x-12 bg-white/25 transition-all duration-700 group-hover:left-[150%]"
                />
                <ShoppingCart className="relative h-5 w-5 transition-transform duration-300 group-hover:-rotate-12 group-hover:scale-110" aria-hidden />
                <span className="relative">Adaugă în coș</span>
                {pendingTiers.length > 0 && (
                  <span key={lineTotal(pending.price, pendingTiers, pendingQty)} className="relative animate-pop font-extrabold">
                    · {formatPrice(lineTotal(pending.price, pendingTiers, pendingQty))} MDL
                  </span>
                )}
              </button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
