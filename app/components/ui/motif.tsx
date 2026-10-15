import { cn } from "@/lib/utils";

/**
 * Subtle ornaments inspired by traditional Moldovan floral embroidery —
 * small flower/leaf flourishes used sparingly as dividers, corner accents
 * and background texture. Never the dominant visual.
 */

export function MotifDivider({
  className,
  tone = "default",
}: {
  className?: string;
  /** "onDark" swaps to lighter, higher-contrast tones for dark backgrounds (e.g. the footer). */
  tone?: "default" | "onDark";
}) {
  const lineColor = tone === "onDark" ? "to-brand-rose-light" : "to-brand-red";
  const iconColor = tone === "onDark" ? "text-brand-rose-light" : "text-brand-red";
  return (
    <div className={cn("flex items-center justify-center gap-3 py-2", className)} aria-hidden>
      <span className={cn("h-[1.5px] w-12 bg-gradient-to-r from-transparent sm:w-20", lineColor)} />
      <svg width="26" height="26" viewBox="0 0 22 22" fill="none" className={iconColor}>
        <g stroke="currentColor" strokeWidth="1.6">
          <ellipse cx="11" cy="6.5" rx="2.1" ry="4" />
          <ellipse cx="11" cy="15.5" rx="2.1" ry="4" />
          <ellipse cx="6.5" cy="11" rx="4" ry="2.1" />
          <ellipse cx="15.5" cy="11" rx="4" ry="2.1" />
        </g>
        <circle cx="11" cy="11" r="2" fill="currentColor" />
      </svg>
      <span className={cn("h-[1.5px] w-12 bg-gradient-to-l from-transparent sm:w-20", lineColor)} />
    </div>
  );
}

/** Small inline flower/diamond mark used right after a section heading. */
export function HeadingFlourish({ className }: { className?: string }) {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden
      className={cn("text-brand-red shrink-0 inline-block align-middle", className)}
    >
      <g stroke="currentColor" strokeWidth="1.6">
        <ellipse cx="10" cy="6.5" rx="2.1" ry="4" />
        <ellipse cx="10" cy="13.5" rx="2.1" ry="4" />
        <ellipse cx="5.5" cy="10" rx="4" ry="2.1" />
        <ellipse cx="14.5" cy="10" rx="4" ry="2.1" />
      </g>
      <circle cx="10" cy="10" r="2" fill="currentColor" />
    </svg>
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

/**
 * Rozetă mare tip „mandala” din broderia populară — straturi concentrice: inel punctat, petale ascuțite, romburi mici,
 * petale rotunjite cu nervură, frunzulițe și o floare în centru. Ornament de fundal pentru zone întunecate (footer):
 * se colorează prin `currentColor` și se folosește la opacitate mică, parțial ieșită din cadru.
 */
export function MotifRosette({ className }: { className?: string }) {
  const rot = (count: number, offset = 0) => Array.from({ length: count }, (_, i) => offset + (i * 360) / count);
  return (
    <svg viewBox="0 0 240 240" fill="none" aria-hidden className={cn("text-brand-rose-light", className)}>
      <g stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" transform="translate(120,120)">
        {/* Inele exterioare */}
        <circle r="116" strokeWidth="1.2" />
        <circle r="110" strokeWidth="0.8" strokeDasharray="1 6" />
        <circle r="88" strokeWidth="0.9" strokeDasharray="0.1 7" />

        {/* 16 petale ascuțite (stratul exterior) */}
        {rot(16).map((deg) => (
          <path
            key={`p-${deg}`}
            d="M0 -64 C 10 -78, 10 -96, 0 -108 C -10 -96, -10 -78, 0 -64 Z"
            strokeWidth="1.1"
            fill="currentColor"
            fillOpacity="0.08"
            transform={`rotate(${deg})`}
          />
        ))}
        {/* Romburi mici între petale */}
        {rot(16, 11.25).map((deg) => (
          <path key={`d-${deg}`} d="M0 -96 l3.6 5 l-3.6 5 l-3.6 -5 z" strokeWidth="1" fill="currentColor" fillOpacity="0.2" transform={`rotate(${deg})`} />
        ))}

        {/* 8 petale rotunjite cu nervură */}
        {rot(8).map((deg) => (
          <g key={`o-${deg}`} transform={`rotate(${deg})`}>
            <ellipse cx="0" cy="-46" rx="12" ry="25" strokeWidth="1.2" fill="currentColor" fillOpacity="0.1" />
            <path d="M0 -68 L0 -28" strokeWidth="0.9" />
            <circle cx="0" cy="-70" r="2" fill="currentColor" stroke="none" />
          </g>
        ))}
        {/* 8 frunzulițe între petalele rotunjite */}
        {rot(8, 22.5).map((deg) => (
          <path key={`l-${deg}`} d="M0 -34 C 6 -44, 6 -56, 0 -64 C -6 -56, -6 -44, 0 -34 Z" strokeWidth="1" fill="currentColor" fillOpacity="0.16" transform={`rotate(${deg})`} />
        ))}

        {/* Floarea din centru */}
        <circle r="30" strokeWidth="1" />
        {rot(12).map((deg) => (
          <circle key={`b-${deg}`} cx="0" cy="-30" r="1.8" fill="currentColor" stroke="none" transform={`rotate(${deg})`} />
        ))}
        {rot(6).map((deg) => (
          <ellipse key={`c-${deg}`} cx="0" cy="-13" rx="5.5" ry="10" strokeWidth="1.1" fill="currentColor" fillOpacity="0.14" transform={`rotate(${deg})`} />
        ))}
        <circle r="6" strokeWidth="1.2" />
        <circle r="2.6" fill="currentColor" stroke="none" />
      </g>
    </svg>
  );
}
