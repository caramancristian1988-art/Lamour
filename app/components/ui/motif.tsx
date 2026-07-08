import { cn } from "@/lib/utils";

/**
 * Subtle ornaments inspired by traditional Moldovan floral embroidery —
 * small flower/leaf flourishes used sparingly as dividers, corner accents
 * and background texture. Never the dominant visual.
 */

export function MotifDivider({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center justify-center gap-3 py-2", className)} aria-hidden>
      <span className="h-px w-12 bg-gradient-to-r from-transparent to-brand-rose sm:w-20" />
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none" className="text-brand-red">
        <g stroke="currentColor" strokeWidth="1.1">
          <ellipse cx="11" cy="6.5" rx="2.1" ry="4" />
          <ellipse cx="11" cy="15.5" rx="2.1" ry="4" />
          <ellipse cx="6.5" cy="11" rx="4" ry="2.1" />
          <ellipse cx="15.5" cy="11" rx="4" ry="2.1" />
        </g>
        <circle cx="11" cy="11" r="1.8" fill="currentColor" />
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
      {/* Curling vine stem */}
      <path d="M4 4 C4 20 14 24 26 22" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      {/* Leaves along the stem */}
      <path d="M8 12 Q14 8 17 14 Q11 16 8 12 Z" stroke="currentColor" strokeWidth="1.2" />
      <path d="M6 22 Q13 20 14 27 Q7 27 6 22 Z" stroke="currentColor" strokeWidth="1.2" />
      {/* Small flower at the tip */}
      <g transform="translate(26,22)" stroke="currentColor" strokeWidth="1.1">
        <ellipse cx="0" cy="-3.4" rx="1.7" ry="3.2" />
        <ellipse cx="0" cy="3.4" rx="1.7" ry="3.2" />
        <ellipse cx="-3.4" cy="0" rx="3.2" ry="1.7" />
        <ellipse cx="3.4" cy="0" rx="3.2" ry="1.7" />
      </g>
      <circle cx="26" cy="22" r="1.5" fill="currentColor" />
    </svg>
  );
}

/** Very low-opacity repeating floral texture for section backgrounds. */
export function MotifBackground({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn("pointer-events-none absolute inset-0 bg-motif opacity-[0.05]", className)}
    />
  );
}
