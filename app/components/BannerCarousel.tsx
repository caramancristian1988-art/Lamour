"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/app/components/ui/button";

const AUTOPLAY_MS = 6000;

export interface BannerSlide {
  id: string;
  image: string;
  alt: string;
  title: string | null;
  subtitle: string | null;
  ctaLabel: string | null;
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
      className="relative w-full rounded-3xl overflow-hidden shadow-lg touch-pan-y"
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
      <div className="relative w-full aspect-video sm:aspect-[2/1] lg:aspect-[21/9] bg-muted">
        {banners.map((banner, i) => {
          const hasText = banner.title || banner.subtitle;
          const content = (
            <>
              <Image
                src={banner.image}
                alt={banner.alt}
                fill
                priority={i === 0}
                className="object-cover"
                sizes="(min-width: 1280px) 1280px, 100vw"
              />
              {hasText && <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/25 to-transparent" />}
              {(hasText || banner.ctaLabel) && (
                <div
                  className={`absolute inset-0 flex flex-col gap-2 sm:gap-3 px-4 sm:px-12 lg:px-16 max-w-xl ${
                    hasText ? "justify-center" : "justify-end items-center pb-3 sm:pb-16"
                  }`}
                >
                  {banner.title && (
                    <h2 className="font-serif italic text-2xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight text-balance">
                      {banner.title}
                    </h2>
                  )}
                  {banner.subtitle && (
                    <p className="text-sm sm:text-lg text-white/90 leading-relaxed">{banner.subtitle}</p>
                  )}
                  {banner.ctaLabel && (
                    <Button
                      asChild
                      variant="accent"
                      size="lg"
                      className={`mt-2 h-9 px-4 text-xs sm:h-14 sm:px-8 sm:text-base ${hasText ? "self-start" : ""}`}
                    >
                      <span>{banner.ctaLabel}</span>
                    </Button>
                  )}
                </div>
              )}
            </>
          );
          return (
            <div
              key={banner.id}
              className={`absolute inset-0 transition-opacity duration-700 ${i === active ? "opacity-100 z-10" : "opacity-0"}`}
              aria-hidden={i !== active}
            >
              {banner.link ? (
                <Link href={banner.link} className="block w-full h-full" tabIndex={i === active ? 0 : -1}>
                  {content}
                </Link>
              ) : (
                <div className="relative w-full h-full">{content}</div>
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
            className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-20 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-primary shadow-lg text-white hover:bg-brand-maroon-dark flex items-center justify-center transition-colors"
          >
            <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" aria-hidden />
          </button>
          <button
            onClick={() => goTo(active + 1)}
            aria-label="Bannerul următor"
            className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-20 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-primary shadow-lg text-white hover:bg-brand-maroon-dark flex items-center justify-center transition-colors"
          >
            <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" aria-hidden />
          </button>

          <div className="absolute bottom-4 inset-x-0 z-20 flex items-center justify-center gap-2">
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
