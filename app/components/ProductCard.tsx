"use client";

import Image from "next/image";
import Link from "next/link";
import FavoriteButton from "./FavoriteButton";
import AddToCartButton from "./AddToCartButton";

interface ProductCardProps {
  name: string;
  slug: string;
  price: number;
  oldPrice?: number | null;
  image?: string | null;
  btu?: number | null;
  inverter?: boolean;
  energyClass?: string | null;
  rating: number;
  reviewCount: number;
  badge?: string | null;
  showDiscount?: boolean;
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = star <= Math.round(rating);
        return (
          <svg
            key={star}
            className={`w-4 h-4 ${filled ? "text-amber-400" : "text-gray-200"}`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        );
      })}
    </div>
  );
}

export default function ProductCard({
  name,
  slug,
  price,
  oldPrice,
  image,
  btu,
  inverter,
  energyClass,
  rating,
  reviewCount,
  badge,
  showDiscount,
}: ProductCardProps) {
  const discount = oldPrice ? Math.round((1 - price / oldPrice) * 100) : null;
  const displayBadge = badge ?? (discount ? `Reducere -${discount}%` : null);

  const specs = [
    btu ? `${(btu / 1000).toFixed(0)}000 BTU` : null,
    inverter ? "Inverter" : null,
    energyClass ? `Clasa ${energyClass}` : null,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <div className="group bg-white rounded-2xl border border-transparent overflow-hidden h-full flex flex-col transition-all duration-300 hover:border-gray-200 hover:shadow-xl hover:-translate-y-1">
      {/* Image area */}
      <div className="relative h-[180px] sm:h-[240px] lg:h-[280px] flex items-center justify-center bg-white overflow-hidden">
        <Link href={`/produse/${slug}`} className="w-full h-full flex items-center justify-center">
          {image ? (
            <Image
              src={image}
              alt={name}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 25vw"
              className="object-contain"
            />
          ) : (
            <svg className="w-24 h-24 text-gray-200" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20 8H4a2 2 0 00-2 2v8a2 2 0 002 2h16a2 2 0 002-2v-8a2 2 0 00-2-2zM4 6h16V4H4v2z" />
            </svg>
          )}
        </Link>

        {/* Badge */}
        {displayBadge && (
          <span className="absolute top-3 left-3 right-12 sm:top-4 sm:left-4 sm:right-auto bg-[#c7092b] text-white text-[10px] sm:text-xs font-bold rounded-md px-2 sm:px-3 py-1 uppercase tracking-wide truncate">
            {displayBadge}
          </span>
        )}

        {/* Favorite */}
        <div className="absolute top-3 right-3 sm:top-4 sm:right-4">
          <FavoriteButton
            product={{ slug, name, price, oldPrice, image, btu, inverter, energyClass, rating, reviewCount, badge }}
          />
        </div>

      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-5">
        {/* Name */}
        <Link href={`/produse/${slug}`}>
          <h3 className="text-[13px] sm:text-[15px] lg:text-[17px] font-bold text-[#0f172a] leading-snug line-clamp-3 mb-2 hover:text-[#c7092b] transition-colors">
            {name}
          </h3>
        </Link>

        {/* Specs */}
        {specs && (
          <p className="text-xs text-gray-500 mb-3">{specs}</p>
        )}

        {/* Rating */}
        <div className="flex items-center gap-2 mb-4">
          <StarRating rating={rating} />
          <span className="text-sm text-gray-500">({reviewCount})</span>
        </div>

        {/* Price + actions — pinned to bottom */}
        <div className="mt-auto">
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            <span className="text-base sm:text-lg lg:text-xl font-extrabold text-gray-900">
              {price.toLocaleString("ro-MD")} MDL
            </span>
            {oldPrice && showDiscount && discount && (
              <span className="inline-flex items-center bg-[#c7092b] text-white text-xs font-extrabold px-2 py-0.5 rounded-md">
                -{discount}%
              </span>
            )}
            {oldPrice && (
              <span className="text-sm text-gray-400 line-through">
                {oldPrice.toLocaleString("ro-MD")} MDL
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <AddToCartButton
              slug={slug}
              name={name}
              price={price}
              image={image ?? null}
              className="flex-1 h-9 sm:h-11 bg-[#c7092b] hover:bg-[#a5071f] text-white text-xs font-bold rounded-lg sm:rounded-xl transition-colors flex items-center justify-center gap-2 uppercase tracking-wide disabled:bg-gray-200 disabled:text-gray-400"
            >
              <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <span className="hidden sm:inline">Adaugă în coș</span>
            </AddToCartButton>
            <button
              onClick={() => { window.location.href = `/produse/${slug}`; }}
              className="w-9 h-9 sm:w-11 sm:h-11 flex items-center justify-center border border-gray-200 rounded-lg sm:rounded-xl shrink-0 text-gray-400 hover:border-[#c7092b] hover:text-[#c7092b] transition-colors"
            >
              <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
