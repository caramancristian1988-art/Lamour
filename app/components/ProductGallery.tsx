"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, ImageOff } from "lucide-react";
import { Badge } from "@/app/components/ui/badge";
import { cn } from "@/lib/utils";

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
              aria-current={i === active}
              className={cn(
                "relative w-16 h-16 shrink-0 rounded-lg border-2 overflow-hidden bg-card transition-colors",
                i === active ? "border-accent" : "border-border hover:border-primary/40"
              )}
            >
              <Image src={img} alt={`${alt} ${i + 1}`} fill className="object-contain p-1.5" sizes="64px" />
            </button>
          ))}
        </div>
      )}

      <div className="order-1 lg:order-2 relative w-full lg:flex-1 h-[360px] sm:h-[460px] lg:h-[560px] rounded-2xl border border-border bg-card overflow-hidden flex items-center justify-center">
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
          <ImageOff className="w-32 h-32 text-muted-foreground/30" aria-hidden />
        )}

        {badge && (
          <Badge variant="accent" className="absolute top-5 left-5 shadow-sm">
            {badge}
          </Badge>
        )}

        {hasMultiple && (
          <>
            <button
              onClick={() => setActive((i) => (i - 1 + images.length) % images.length)}
              aria-label="Imaginea anterioară"
              className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-card/90 border border-border flex items-center justify-center text-muted-foreground hover:text-accent hover:border-accent transition-colors shadow-sm"
            >
              <ChevronLeft className="w-4 h-4" aria-hidden />
            </button>
            <button
              onClick={() => setActive((i) => (i + 1) % images.length)}
              aria-label="Imaginea următoare"
              className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-card/90 border border-border flex items-center justify-center text-muted-foreground hover:text-accent hover:border-accent transition-colors shadow-sm"
            >
              <ChevronRight className="w-4 h-4" aria-hidden />
            </button>
          </>
        )}
      </div>
    </div>
  );
}
