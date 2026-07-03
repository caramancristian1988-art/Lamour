"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface StarRatingProps {
  rating: number;
  size?: number;
  className?: string;
  /** Enables click-to-rate behavior (used in review forms). */
  interactive?: boolean;
  onChange?: (value: number) => void;
}

export function StarRating({ rating, size = 16, className, interactive = false, onChange }: StarRatingProps) {
  const [hovered, setHovered] = useState<number | null>(null);

  if (!interactive) {
    return (
      <div className={cn("flex items-center gap-0.5", className)} role="img" aria-label={`${rating} din 5 stele`}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            width={size}
            height={size}
            className={star <= Math.round(rating) ? "text-amber-400 fill-amber-400" : "text-border fill-border"}
            aria-hidden
          />
        ))}
      </div>
    );
  }

  const active = hovered ?? rating;
  return (
    <div className={cn("flex items-center gap-1", className)} role="radiogroup" aria-label="Notează">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          role="radio"
          aria-checked={rating === star}
          aria-label={`${star} din 5 stele`}
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(null)}
          onClick={() => onChange?.(star)}
          className="rounded-md p-0.5 transition-transform hover:scale-110"
        >
          <Star
            width={size}
            height={size}
            className={star <= active ? "text-amber-400 fill-amber-400" : "text-border fill-border"}
            aria-hidden
          />
        </button>
      ))}
    </div>
  );
}
