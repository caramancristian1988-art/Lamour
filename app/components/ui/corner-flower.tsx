import { cn } from "@/lib/utils";

/**
 * Ornament de colț (floare cu rozetă din petale + doi lăstari cu frunze și boabe), în stilul broderiei populare.
 * Se desenează pentru colțul din STÂNGA-SUS; în celelalte colțuri se oglindește cu `-scale-x-100`, `-scale-y-100`
 * sau ambele. Culoarea vine din `currentColor`, iar opacitatea se reglează din `className`.
 */
export function CornerFlower({ className }: { className?: string }) {
  const petals = Array.from({ length: 8 }, (_, i) => i * 45);
  return (
    <svg viewBox="0 0 120 120" fill="none" aria-hidden className={cn("text-brand-rose-light", className)}>
      <g stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
        {/* Rozeta din colț */}
        <g transform="translate(26,26)" strokeWidth="1.3">
          {petals.map((deg) => (
            <ellipse key={deg} cx="0" cy="-10" rx="3.8" ry="7.5" transform={`rotate(${deg})`} fill="currentColor" fillOpacity="0.14" />
          ))}
          <circle r="3.8" />
          <circle r="1.7" fill="currentColor" />
          <circle r="18.5" strokeWidth="0.9" strokeDasharray="1.5 3" />
        </g>

        {/* Lăstar pe marginea de sus */}
        <path d="M46 24 C58 14 76 15 86 23 C95 30 105 28 109 20 C111 15 107 11 103 13" strokeWidth="1.4" />
        <path d="M62 17 q4 -9 12 -5 q-3 9 -12 5 z" strokeWidth="1.1" fill="currentColor" fillOpacity="0.22" />
        <path d="M80 23 q3 9 12 8 q-1 -9 -12 -8 z" strokeWidth="1.1" fill="currentColor" fillOpacity="0.22" />
        <circle cx="98" cy="31.5" r="1.8" fill="currentColor" stroke="none" />

        {/* Lăstar pe marginea din stânga (oglinda celui de sus) */}
        <path d="M24 46 C14 58 15 76 23 86 C30 95 28 105 20 109 C15 111 11 107 13 103" strokeWidth="1.4" />
        <path d="M17 62 q-9 4 -5 12 q9 -3 5 -12 z" strokeWidth="1.1" fill="currentColor" fillOpacity="0.22" />
        <path d="M23 80 q9 3 8 12 q-9 -1 -8 -12 z" strokeWidth="1.1" fill="currentColor" fillOpacity="0.22" />
        <circle cx="31.5" cy="98" r="1.8" fill="currentColor" stroke="none" />

        {/* Mic lăstar spre interior */}
        <path d="M42 42 C50 50 56 52 63 49" strokeWidth="1.2" />
        <path d="M54 51 q6 -8 13 -2 q-6 8 -13 2 z" strokeWidth="1" fill="currentColor" fillOpacity="0.22" />
        <circle cx="70" cy="47" r="1.4" fill="currentColor" stroke="none" />
      </g>
    </svg>
  );
}
