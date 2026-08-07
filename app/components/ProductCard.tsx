"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ImageOff, ShoppingCart, Eye } from "lucide-react";
import FavoriteButton from "./FavoriteButton";
import AddToCartButton from "./AddToCartButton";
import { StarRating } from "@/app/components/ui/star-rating";
import { Badge } from "@/app/components/ui/badge";
import { stripVariantSuffix } from "@/lib/productListing";

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
}: ProductCardProps) {
  // A leftover placehold.co seed image doesn't count as a "real" main image —
  // prefer an actual uploaded gallery photo over it when one exists.
  const isPlaceholder = image?.includes("placehold.co") ?? false;
  const displayImage = (!isPlaceholder && image) || images?.[0] || image || null;

  // Picking a variant pill swaps price/slug in place — no navigation. The
  // photo/name/rating stay as the card's own (variants share the same look).
  const [activeVariant, setActiveVariant] = useState<VariantOption>({
    slug,
    variantLabel: null,
    price,
    oldPrice: oldPrice ?? null,
  });
  const activeSlug = activeVariant.slug;
  const activePrice = activeVariant.price;
  const activeOldPrice = activeVariant.oldPrice;
  const [pulseSlug, setPulseSlug] = useState<string | null>(null);

  const discount = activeOldPrice ? Math.round((1 - activePrice / activeOldPrice) * 100) : null;
  const discountAmount = activeOldPrice ? Math.round(activeOldPrice - activePrice) : null;
  const displayBadge = badge ?? (discount ? `-${discount}%` : null);

  const specs = [packageQuantity || null].filter(Boolean).join(", ");

  // With variant pills already showing the size/quantity, drop the same
  // trailing text from the title so it doesn't read twice.
  const hasVariants = Boolean(variantOptions && variantOptions.length > 1);
  const ownVariantLabel = variantOptions?.find((v) => v.slug === slug)?.variantLabel ?? null;
  const displayTitle = hasVariants ? stripVariantSuffix(name, ownVariantLabel) : name;

  return (
    <div className="group bg-card rounded-2xl border border-border overflow-hidden h-full flex flex-col transition-all duration-300 hover:shadow-xl focus-within:shadow-xl hover:-translate-y-1">
      {/* Image area */}
      <div className="relative aspect-[4/3] flex items-center justify-center bg-white overflow-hidden">
        <Link href={`/produse/${activeSlug}`} className="w-full h-full flex items-center justify-center rounded-lg">
          {displayImage ? (
            <Image
              src={displayImage}
              alt={name}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 25vw"
              className="object-cover"
            />
          ) : (
            <ImageOff className="w-16 h-16 text-muted-foreground/40" aria-hidden />
          )}
        </Link>

        {displayBadge && (
          <Badge
            variant="accent"
            className="absolute top-2 left-2 sm:top-4 sm:left-4 max-w-[calc(100%-2.75rem)] sm:max-w-[70%] truncate shadow-sm"
          >
            {displayBadge}
          </Badge>
        )}

        <div className="absolute top-2 right-2 sm:top-4 sm:right-4">
          <FavoriteButton
            product={{ slug: activeSlug, name, price: activePrice, oldPrice: activeOldPrice, image: displayImage, rating, reviewCount, badge }}
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-5">
        <Link href={`/produse/${activeSlug}`} className="rounded">
          <h3 className="text-[15px] lg:text-[17px] font-bold text-foreground leading-snug line-clamp-3 mb-2 hover:text-accent transition-colors">
            {displayTitle}
          </h3>
        </Link>

        {specs && <p className="text-xs text-muted-foreground mb-3">{specs}</p>}

        <div className={`flex items-center gap-2 ${hasVariants ? "mb-2" : "mb-4"}`}>
          <StarRating rating={rating} />
          <span className="text-sm text-muted-foreground">({reviewCount})</span>
        </div>

        {variantOptions && variantOptions.length > 1 && (
          <div className="flex items-center gap-2 flex-wrap mb-3">
            {variantOptions.map((v) => {
              const active = v.slug === activeSlug;
              return (
                <button
                  key={v.slug}
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    setActiveVariant(v);
                    setPulseSlug(v.slug);
                    window.setTimeout(() => setPulseSlug((cur) => (cur === v.slug ? null : cur)), 400);
                  }}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold border-2 transition-all active:scale-90 ${
                    active
                      ? "bg-primary text-white border-primary shadow-md scale-105"
                      : "bg-card text-foreground border-border hover:border-accent hover:text-accent hover:shadow-sm"
                  } ${pulseSlug === v.slug ? "animate-bump" : ""}`}
                >
                  {v.variantLabel ?? "—"}
                </button>
              );
            })}
          </div>
        )}

        <div className="mt-auto">
          <div className="mb-2">
            {activeOldPrice && discount && (
              <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                <span className="text-xs text-muted-foreground line-through">
                  {activeOldPrice.toLocaleString("ro-MD")} MDL
                </span>
                <Badge variant="accent" className="normal-case px-2 py-0.5">
                  -{discountAmount?.toLocaleString("ro-MD")} MDL
                </Badge>
                <Badge variant="secondary" className="normal-case px-2 py-0.5">
                  -{discount}%
                </Badge>
              </div>
            )}
            <span className="text-lg lg:text-xl font-bold text-foreground">{activePrice.toLocaleString("ro-MD")} MDL</span>
          </div>

          {installmentsEnabled !== false && (
            <div className="inline-flex items-center gap-1.5 bg-secondary/40 rounded-full px-2.5 py-1 mb-3">
              <span className="bg-primary text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded-full uppercase tracking-wide">
                Rate
              </span>
              <span className="text-[10px] font-bold text-primary">
                de la {Math.ceil(activePrice / installmentMonths).toLocaleString("ro-MD")} lei/lună
              </span>
            </div>
          )}

          <div className="flex items-center gap-1.5 sm:gap-2">
            <AddToCartButton
              slug={activeSlug}
              name={name}
              price={activePrice}
              oldPrice={activeOldPrice}
              image={image ?? null}
              className="flex-1 h-10 sm:h-11 bg-accent hover:bg-brand-red-dark text-white text-xs font-bold rounded-full transition-all flex items-center justify-center gap-2 uppercase tracking-wide disabled:bg-muted disabled:text-muted-foreground active:scale-95 hover:shadow-md"
            >
              <ShoppingCart className="w-4 h-4" aria-hidden />
              <span className="hidden sm:inline">Adaugă în coș</span>
            </AddToCartButton>
            <Link
              href={`/produse/${activeSlug}`}
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
