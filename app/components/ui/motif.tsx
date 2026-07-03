import { cn } from "@/lib/utils";

/**
 * Subtle ornaments inspired by Moldovan folk embroidery (geometric
 * diamond/rosette cross-stitch motifs) — used sparingly as dividers,
 * corner accents and background texture. Never the dominant visual.
 */

export function MotifDivider({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center justify-center gap-3 py-2", className)} aria-hidden>
      <span className="h-px w-12 bg-gradient-to-r from-transparent to-brand-rose sm:w-20" />
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="text-brand-red">
        <path d="M10 1 L15 10 L10 19 L5 10 Z" stroke="currentColor" strokeWidth="1.4" />
        <circle cx="10" cy="10" r="1.8" fill="currentColor" />
      </svg>
      <span className="h-px w-12 bg-gradient-to-l from-transparent to-brand-rose sm:w-20" />
    </div>
  );
}

export function MotifCorner({ className, flip }: { className?: string; flip?: boolean }) {
  return (
    <svg
      width="56"
      height="56"
      viewBox="0 0 56 56"
      fill="none"
      aria-hidden
      className={cn("text-brand-rose", flip && "-scale-x-100", className)}
    >
      <path d="M2 2 H20 M2 2 V20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M2 30 L10 38 L2 46" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="30" cy="8" r="2.2" fill="currentColor" />
      <path d="M40 2 L46 10 L40 18 L34 10 Z" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
}

/** Very low-opacity repeating rosette texture for section backgrounds. */
export function MotifBackground({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn("pointer-events-none absolute inset-0 bg-motif opacity-[0.05]", className)}
    />
  );
}
