"use client";

import Image from "next/image";
import Link from "next/link";
import { ImageOff, ShoppingCart, Eye } from "lucide-react";
import FavoriteButton from "./FavoriteButton";
import AddToCartButton from "./AddToCartButton";
import { StarRating } from "@/app/components/ui/star-rating";
import { Badge } from "@/app/components/ui/badge";

interface ProductCardProps {
  name: string;
  slug: string;
  price: number;
  oldPrice?: number | null;
  image?: string | null;
  images?: string[];
  btu?: number | null;
  technology?: string | null;
  energyClass?: string | null;
  rating: number;
  reviewCount: number;
  badge?: string | null;
  showDiscount?: boolean;
  installmentsEnabled?: boolean;
  installmentMonths?: number;
}

export default function ProductCard({
  name,
  slug,
  price,
  oldPrice,
  image,
  images,
  btu,
  technology,
  energyClass,
  rating,
  reviewCount,
  badge,
  installmentsEnabled,
  installmentMonths = 4,
}: ProductCardProps) {
  // A leftover placehold.co seed image doesn't count as a "real" main image —
  // prefer an actual uploaded gallery photo over it when one exists.
  const isPlaceholder = image?.includes("placehold.co") ?? false;
  const displayImage = (!isPlaceholder && image) || images?.[0] || image || null;
  const discount = oldPrice ? Math.round((1 - price / oldPrice) * 100) : null;
  const discountAmount = oldPrice ? Math.round(oldPrice - price) : null;
  const displayBadge = badge ?? (discount ? `-${discount}%` : null);

  const specs = [
    btu ? `${(btu / 1000).toFixed(0)}000 BTU` : null,
    technology || null,
    energyClass ? `Clasa ${energyClass}` : null,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <div className="group bg-card rounded-2xl border border-border overflow-hidden h-full flex flex-col transition-all duration-300 hover:shadow-xl focus-within:shadow-xl hover:-translate-y-1">
      {/* Image area */}
      <div className="relative h-[180px] sm:h-[240px] lg:h-[280px] flex items-center justify-center bg-white overflow-hidden">
        <Link href={`/produse/${slug}`} className="w-full h-full flex items-center justify-center rounded-lg">
          {displayImage ? (
            <Image
              src={displayImage}
              alt={name}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 25vw"
              className="object-contain"
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
            product={{ slug, name, price, oldPrice, image: displayImage, btu, technology, energyClass, rating, reviewCount, badge }}
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-5">
        <Link href={`/produse/${slug}`} className="rounded">
          <h3 className="text-[15px] lg:text-[17px] font-bold text-foreground leading-snug line-clamp-3 mb-2 hover:text-accent transition-colors">
            {name}
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
                <Badge variant="accent" className="normal-case px-2 py-0.5">
                  -{discountAmount?.toLocaleString("ro-MD")} MDL
                </Badge>
                <Badge variant="secondary" className="normal-case px-2 py-0.5">
                  -{discount}%
                </Badge>
              </div>
            )}
            <span className="text-lg lg:text-xl font-bold text-foreground">{price.toLocaleString("ro-MD")} MDL</span>
          </div>

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
              name={name}
              price={price}
              oldPrice={oldPrice ?? null}
              image={image ?? null}
              className="flex-1 h-10 sm:h-11 bg-accent hover:bg-brand-red-dark text-white text-xs font-bold rounded-full transition-all flex items-center justify-center gap-2 uppercase tracking-wide disabled:bg-muted disabled:text-muted-foreground active:scale-95 hover:shadow-md"
            >
              <ShoppingCart className="w-4 h-4" aria-hidden />
              <span className="hidden sm:inline">Adaugă în coș</span>
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
