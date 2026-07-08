"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";

const AUTOPLAY_MS = 5000;

export interface BannerSlide {
  id: string;
  image: string;
  alt: string;
  link: string | null;
}

export default function BannerCarousel({ banners }: { banners: BannerSlide[] }) {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  useEffect(() => {
    if (paused || banners.length <= 1) return;
    const timer = setTimeout(() => setActive((i) => (i + 1) % banners.length), AUTOPLAY_MS);
    return () => clearTimeout(timer);
  }, [active, paused, banners.length]);

  if (banners.length === 0) return null;

  function goTo(i: number) {
    setActive(((i % banners.length) + banners.length) % banners.length);
  }

  return (
    <div
      className="relative w-full rounded-2xl overflow-hidden shadow-sm touch-pan-y"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={(e) => setTouchStartX(e.touches[0].clientX)}
      onTouchEnd={(e) => {
        if (touchStartX === null) return;
        const deltaX = e.changedTouches[0].clientX - touchStartX;
        if (Math.abs(deltaX) > 40) goTo(active + (deltaX < 0 ? 1 : -1));
        setTouchStartX(null);
      }}
    >
      <div className="relative w-full aspect-[16/7] sm:aspect-[21/6] bg-muted">
        {banners.map((banner, i) => {
          const slide = (
            <Image
              src={banner.image}
              alt={banner.alt}
              fill
              priority={i === 0}
              className="object-cover"
              sizes="(min-width: 1280px) 1280px, 100vw"
            />
          );
          return (
            <div
              key={banner.id}
              className={`absolute inset-0 transition-opacity duration-700 ${i === active ? "opacity-100 z-10" : "opacity-0"}`}
              aria-hidden={i !== active}
            >
              {banner.link ? (
                <Link href={banner.link} className="block w-full h-full" tabIndex={i === active ? 0 : -1}>
                  {slide}
                </Link>
              ) : (
                slide
              )}
            </div>
          );
        })}
      </div>

      {banners.length > 1 && (
        <>
          <button
            onClick={() => goTo(active - 1)}
            aria-label="Bannerul anterior"
            className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/90 shadow-lg text-primary hover:text-accent flex items-center justify-center transition-colors"
          >
            <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" aria-hidden />
          </button>
          <button
            onClick={() => goTo(active + 1)}
            aria-label="Bannerul următor"
            className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/90 shadow-lg text-primary hover:text-accent flex items-center justify-center transition-colors"
          >
            <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" aria-hidden />
          </button>

          <div className="absolute bottom-3 inset-x-0 z-20 flex items-center justify-center gap-2">
            {banners.map((banner, i) => (
              <button
                key={banner.id}
                onClick={() => goTo(i)}
                aria-label={`Mergi la bannerul ${i + 1}`}
                aria-current={i === active}
                className={`h-2 rounded-full transition-all ${i === active ? "w-6 bg-white" : "w-2 bg-white/60 hover:bg-white/80"}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
