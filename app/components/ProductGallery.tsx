"use client";

import { useState } from "react";
import Image from "next/image";

interface Props {
  images: string[];
  alt: string;
  badge?: string | null;
}

export default function ProductGallery({ images, alt, badge }: Props) {
  const [active, setActive] = useState(0);
  const hasMultiple = images.length > 1;

  return (
    <div className="flex flex-col lg:flex-row gap-3">
      {hasMultiple && (
        <div className="order-2 lg:order-1 flex lg:flex-col gap-2 overflow-x-auto lg:overflow-x-visible lg:overflow-y-auto lg:max-h-[560px] lg:w-20 shrink-0">
          {images.map((img, i) => (
            <button
              key={img + i}
              onClick={() => setActive(i)}
              aria-label={`Imaginea ${i + 1}`}
              className={`relative w-16 h-16 shrink-0 rounded-lg border-2 overflow-hidden bg-white transition-colors ${
                i === active ? "border-[#c7092b]" : "border-gray-100 hover:border-gray-300"
              }`}
            >
              <Image src={img} alt={`${alt} ${i + 1}`} fill className="object-contain p-1.5" sizes="64px" />
            </button>
          ))}
        </div>
      )}

      <div className="order-1 lg:order-2 relative w-full lg:flex-1 h-[360px] sm:h-[460px] lg:h-[560px] rounded-2xl border border-gray-100 bg-white overflow-hidden flex items-center justify-center">
        {images.length > 0 ? (
          <Image
            src={images[active]}
            alt={alt}
            fill
            className="object-contain p-3"
            sizes="(max-width: 1024px) 100vw, 50vw"
            priority
          />
        ) : (
          <svg className="w-32 h-32 text-gray-200" fill="currentColor" viewBox="0 0 24 24">
            <path d="M20 8H4a2 2 0 00-2 2v8a2 2 0 002 2h16a2 2 0 002-2v-8a2 2 0 00-2-2zM4 6h16V4H4v2z" />
          </svg>
        )}

        {badge && (
          <span className="absolute top-5 left-5 bg-[#c7092b] text-white text-xs font-bold rounded-md px-3 py-1 uppercase tracking-wide">
            {badge}
          </span>
        )}

        {hasMultiple && (
          <>
            <button
              onClick={() => setActive((i) => (i - 1 + images.length) % images.length)}
              aria-label="Imaginea anterioară"
              className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 border border-gray-200 flex items-center justify-center text-gray-500 hover:text-[#c7092b] hover:border-[#c7092b] transition-colors shadow-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={() => setActive((i) => (i + 1) % images.length)}
              aria-label="Imaginea următoare"
              className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 border border-gray-200 flex items-center justify-center text-gray-500 hover:text-[#c7092b] hover:border-[#c7092b] transition-colors shadow-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </>
        )}
      </div>
    </div>
  );
}
