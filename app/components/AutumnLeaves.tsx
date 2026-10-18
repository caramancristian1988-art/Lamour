import { cn } from "@/lib/utils";

// Frunze de toamnă (roșii, galbene, portocalii) care cad lent peste logo. Doar decor: aria-hidden, fără interacțiune,
// animație pe GPU (transform/opacity) și oprită automat la „mișcare redusă" (regula globală din globals.css).
const LEAVES = [
  { left: 6, size: 13, color: "#e5381f", dur: 7.5, delay: 0, sway: 9, spin: 160 },
  { left: 24, size: 10, color: "#fcc02e", dur: 9, delay: -3.2, sway: -8, spin: -200 },
  { left: 42, size: 14, color: "#c4271a", dur: 8, delay: -6, sway: 10, spin: 220 },
  { left: 58, size: 11, color: "#ff8a1f", dur: 10, delay: -1.5, sway: -10, spin: -150 },
  { left: 74, size: 13, color: "#f9a825", dur: 7, delay: -4.4, sway: 8, spin: 180 },
  { left: 88, size: 10, color: "#d9362a", dur: 9.5, delay: -7.8, sway: -7, spin: -240 },
  { left: 33, size: 9, color: "#ffd54a", dur: 11, delay: -9, sway: 6, spin: 140 },
  { left: 66, size: 12, color: "#b3261e", dur: 8.5, delay: -2.4, sway: -9, spin: 200 },
];

export default function AutumnLeaves({ fall = 70, scale = 1, className }: { fall?: number; scale?: number; className?: string }) {
  return (
    <span
      aria-hidden
      className={cn("pointer-events-none absolute -inset-1.5 z-10 overflow-hidden rounded-full", className)}
      style={{ ["--fall" as string]: `${fall}px` }}
    >
      {LEAVES.map((l, i) => (
        <span
          key={i}
          className="autumn-leaf absolute top-0 block"
          style={{
            left: `${l.left}%`,
            width: l.size * scale,
            height: l.size * scale,
            animationDuration: `${l.dur}s`,
            animationDelay: `${l.delay}s`,
            ["--sway" as string]: `${l.sway}px`,
            ["--spin" as string]: `${l.spin}deg`,
          }}
        >
          <svg viewBox="0 0 24 24" width="100%" height="100%" className="block drop-shadow-sm">
            <path d="M12 1.5C7 6.5 3.8 11 5.8 16.2 7.2 19.8 10.5 22.3 12 22.5c1.5-.2 4.8-2.7 6.2-6.3C20.2 11 17 6.5 12 1.5z" fill={l.color} />
            <path d="M12 5v17" stroke="#fff" strokeOpacity=".4" strokeWidth="1" strokeLinecap="round" fill="none" />
          </svg>
        </span>
      ))}
    </span>
  );
}
