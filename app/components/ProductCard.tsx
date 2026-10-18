"use client";

import Image from "next/image";
import Link from "next/link";
import { ImageOff, ShoppingCart, Eye, Layers } from "lucide-react";
import FavoriteButton from "./FavoriteButton";
import AddToCartButton from "./AddToCartButton";
import { StarRating } from "@/app/components/ui/star-rating";
import { Badge } from "@/app/components/ui/badge";
import { stripVariantSuffix } from "@/lib/productListing";
import { normalizeTiers, savingsPercent, type PriceTier } from "@/lib/pricing";
import HighlightRibbon from "./HighlightRibbon";
import AutumnLeaves from "./AutumnLeaves";
import type { HighlightKind } from "@/lib/productHighlight";

interface VariantOption {
  slug: string;
  variantLabel: string | null;
  price: number;
  oldPrice: number | null;
}

interface ProductCardProps {
  name: string;
  slug: string;
  price: number;
  oldPrice?: number | null;
  image?: string | null;
  images?: string[];
  packageQuantity?: string | null;
  rating: number;
  reviewCount: number;
  badge?: string | null;
  showDiscount?: boolean;
  installmentsEnabled?: boolean;
  installmentMonths?: number;
  variantOptions?: VariantOption[];
  priceTiers?: PriceTier[];
  bulkMinQty?: number | null;
  bulkPrice?: number | null;
  /** Primele carduri din pagină (vizibile fără derulare): poza se cere imediat, cu prioritate (LCP). */
  priority?: boolean;
  /** Eticheta specială (Best seller / Popular / Nou / De sezon / Foarte util). */
  highlight?: HighlightKind | null;
}

export default function ProductCard({
  name,
  slug,
  price,
  oldPrice,
  image,
  images,
  packageQuantity,
  rating,
  reviewCount,
  badge,
  installmentsEnabled,
  installmentMonths = 4,
  variantOptions,
  priceTiers,
  bulkMinQty,
  bulkPrice,
  priority = false,
  highlight = null,
}: ProductCardProps) {
  // A leftover placehold.co seed image doesn't count as a "real" main image —
  // prefer an actual uploaded gallery photo over it when one exists.
  const isPlaceholder = image?.includes("placehold.co") ?? false;
  const displayImage = (!isPlaceholder && image) || images?.[0] || image || null;

  const discount = oldPrice ? Math.round((1 - price / oldPrice) * 100) : null;
  const discountAmount = oldPrice ? Math.round(oldPrice - price) : null;
  const displayBadge = badge ?? (discount ? `-${discount}%` : null);
  const isDiscountBadge = !badge && discount !== null;

  const specs = [packageQuantity || null].filter(Boolean).join(", ");

  // Preț redus la cantitate (setat în admin): îl arătăm discret pe card, ca omul să afle că merită să ia mai multe bucăți.
  const quantityTier = normalizeTiers({ priceTiers, bulkMinQty, bulkPrice })[0];
  const quantityTierPercent = quantityTier ? savingsPercent(price, quantityTier.price) : 0;

  // A size/quantity is picked via the "Adaugă în coș" popup, not on the card
  // itself, so the raw trailing "1L" / "2 role" etc. baked into the name
  // would just be confusing clutter here — strip it from the title.
  const hasVariants = Boolean(variantOptions && variantOptions.length > 1);
  const ownVariantLabel = variantOptions?.find((v) => v.slug === slug)?.variantLabel ?? null;
  const displayTitle = hasVariants ? stripVariantSuffix(name, ownVariantLabel) : name;

  return (
    <div className="group bg-card rounded-2xl border border-border overflow-hidden flex flex-col transition-all duration-300 hover:shadow-md focus-within:shadow-md hover:-translate-y-0.5">
      {/* Image area */}
      {/* Zonă pătrată + object-contain: majoritatea pozelor sunt pătrate, unele înalte sau late — toate se văd ÎNTREGI,
          centrate pe alb, fără să fie tăiate (înainte, zona 4:3 cu object-cover tăia sus/jos sau lateralele). */}
      <div className="relative aspect-square flex items-center justify-center bg-white overflow-hidden">
        {/* aria-label: fără poză, linkul conținea doar o iconiță aria-hidden, deci nu avea niciun nume accesibil. */}
        <Link href={`/produse/${slug}`} aria-label={name} className="w-full h-full flex items-center justify-center rounded-lg">
          {displayImage ? (
            <Image
              src={displayImage}
              alt={name}
              fill
              sizes="(max-width: 1023px) 50vw, 300px"
              loading={priority ? "eager" : "lazy"}
              fetchPriority={priority ? "high" : "auto"}
              className="object-contain p-3 sm:p-4 transition-transform duration-300 group-hover:scale-[1.04]"
            />
          ) : (
            <ImageOff className="w-16 h-16 text-muted-foreground/40" aria-hidden />
          )}
        </Link>

        {(highlight || displayBadge) && (
          <div className="absolute left-2 top-2 flex max-w-[calc(100%-3.25rem)] flex-col items-start gap-1 sm:left-4 sm:top-4 sm:max-w-[70%]">
            {highlight && <HighlightRibbon kind={highlight} />}
            {displayBadge && (
              <Badge variant="accent" className="relative max-w-full overflow-hidden shadow-sm">
                <span className="relative z-20 truncate">{displayBadge}</span>
                {/* reducerea: frunze de toamnă care cad peste insigna cu procentul */}
                {isDiscountBadge && <AutumnLeaves count={5} scale={0.42} palette="bright" className="!inset-0 z-10" />}
              </Badge>
            )}
          </div>
        )}

        <div className="absolute top-2 right-2 sm:top-4 sm:right-4">
          <FavoriteButton
            product={{ slug, name, price, oldPrice: oldPrice ?? null, image: displayImage, rating, reviewCount, badge }}
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-3 sm:p-5">
        <Link href={`/produse/${slug}`} className="rounded">
          <h3 className="text-sm sm:text-[15px] lg:text-[17px] font-bold text-foreground leading-snug line-clamp-4 sm:line-clamp-3 mb-2 hover:text-accent transition-colors">
            {displayTitle}
          </h3>
        </Link>

        {specs && <p className="text-xs text-muted-foreground mb-3">{specs}</p>}

        <div className="flex items-center gap-2 mb-4">
          <StarRating rating={rating} />
          <span className="text-sm text-muted-foreground">({reviewCount})</span>
        </div>

        <div className="mt-auto">
          <div className="mb-2">
            {oldPrice && discount && (
              <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                <span className="text-xs text-muted-foreground line-through">
                  {oldPrice.toLocaleString("ro-MD")} MDL
                </span>
                <Badge variant="accent" className="relative overflow-hidden normal-case px-2 py-0.5">
                  <span className="relative z-20">-{discountAmount?.toLocaleString("ro-MD")} MDL</span>
                  <AutumnLeaves count={4} scale={0.4} palette="bright" className="!inset-0 z-10" />
                </Badge>
                <Badge variant="secondary" className="relative overflow-hidden normal-case px-2 py-0.5">
                  <span className="relative z-20">-{discount}%</span>
                  <AutumnLeaves count={4} scale={0.4} className="!inset-0 z-10" />
                </Badge>
              </div>
            )}
            <span className="text-lg lg:text-xl font-bold text-foreground">{price.toLocaleString("ro-MD")} MDL</span>
          </div>

          {quantityTier && (
            // Oferta la cantitate: un singur rând subțire, sub preț — „la N buc.: preț/buc" și, DUPĂ el, insigna cu procentul.
            <p className="mb-2.5 flex flex-wrap items-center gap-x-1.5 gap-y-1 text-[10px] leading-tight text-primary/80 min-[400px]:text-[11px] sm:text-xs">
              {quantityTierPercent <= 0 && <Layers className="h-3.5 w-3.5 shrink-0 text-accent" aria-hidden />}
              <span className="min-w-0">
                <span className="hidden sm:inline">la </span>{quantityTier.minQty}+ buc.:{" "}
                <b className="font-extrabold text-primary">
                  {quantityTier.price.toLocaleString("ro-MD")} MDL/buc
                </b>
              </span>
              {quantityTierPercent > 0 && (
                <span className="relative shrink-0 overflow-hidden rounded-md bg-gradient-to-r from-accent to-brand-maroon px-1.5 py-0.5 text-[11px] font-extrabold text-white shadow-sm">
                  <span className="relative z-20">−{quantityTierPercent}%</span>
                  {/* frunze de toamnă care cad și peste insigna cu procentul */}
                  <AutumnLeaves count={4} scale={0.42} className="!inset-0 z-10" />
                </span>
              )}
            </p>
          )}

          {installmentsEnabled !== false && (
            <div className="inline-flex items-center gap-1.5 bg-secondary/40 rounded-full px-2.5 py-1 mb-3">
              <span className="bg-primary text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded-full uppercase tracking-wide">
                Rate
              </span>
              <span className="text-[10px] font-bold text-primary">
                de la {Math.ceil(price / installmentMonths).toLocaleString("ro-MD")} lei/lună
              </span>
            </div>
          )}

          <div className="flex items-center gap-1.5 sm:gap-2">
            <AddToCartButton
              slug={slug}
              name={displayTitle}
              price={price}
              oldPrice={oldPrice ?? null}
              image={image ?? null}
              variantOptions={variantOptions}
              variantLabel={ownVariantLabel}
              tiers={normalizeTiers({ priceTiers, bulkMinQty, bulkPrice })}
              className="flex-1 min-w-0 overflow-hidden px-3 h-10 sm:h-11 bg-accent hover:bg-brand-red-dark text-white text-xs font-bold rounded-full transition-all flex items-center justify-center gap-2 uppercase tracking-wide disabled:bg-muted disabled:text-muted-foreground active:scale-95 hover:shadow-md"
            >
              <ShoppingCart className="w-4 h-4 shrink-0" aria-hidden />
              {/* sr-only (nu hidden): pe mobil butonul arată doar iconița, dar cititoarele de ecran au nevoie de un nume. */}
              <span className="sr-only sm:not-sr-only sm:truncate">Adaugă în coș</span>
            </AddToCartButton>
            <Link
              href={`/produse/${slug}`}
              aria-label={`Vezi detalii pentru ${name}`}
              className="w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center border border-border rounded-full shrink-0 text-muted-foreground hover:border-accent hover:text-accent hover:shadow-md transition-all active:scale-95"
            >
              <Eye className="w-4 h-4" aria-hidden />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
