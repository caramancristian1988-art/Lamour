import { cn } from "@/lib/utils";
import { LEAF_SHAPES } from "./leafShapes";

// Frunze de toamnă de mai multe feluri (arțar, stejar, mesteacăn, ginkgo, plop, simple) care cad lent peste blocul de brand
// (logo + numele). Doar decor: aria-hidden, fără interacțiune, animație pe GPU (transform/opacity), oprită la „mișcare redusă”.
// Valorile sunt calculate determinist (fără Math.random), ca randarea de pe server și din browser să fie identică.
function pseudo(i: number, salt: number): number {
  const x = Math.sin(i * 12.9898 + salt * 78.233) * 43758.5453;
  return x - Math.floor(x);
}

export default function AutumnLeaves({ count = 16, scale = 1, className }: { count?: number; scale?: number; className?: string }) {
  const leaves = Array.from({ length: count }, (_, i) => {
    const shape = LEAF_SHAPES[i % LEAF_SHAPES.length];
    return {
      shape,
      color: shape.colors[Math.floor(pseudo(i, 1) * shape.colors.length)],
      left: ((i + pseudo(i, 2) * 0.8) / count) * 100,
      size: (11 + pseudo(i, 3) * 8) * scale,
      dur: 8 + pseudo(i, 4) * 6,
      delay: -pseudo(i, 5) * 14,
      sway: (pseudo(i, 6) > 0.5 ? 1 : -1) * (6 + pseudo(i, 7) * 10) * scale,
      spin: (pseudo(i, 8) > 0.5 ? 1 : -1) * (140 + pseudo(i, 9) * 160),
    };
  });

  return (
    <span aria-hidden className={cn("autumn-leaves pointer-events-none absolute -inset-x-1 -inset-y-2 z-10 overflow-hidden", className)}>
      {leaves.map((l, i) => (
        <span
          key={i}
          className="autumn-leaf absolute top-0 block"
          style={{
            left: `${l.left}%`,
            width: l.size,
            height: l.size,
            animationDuration: `${l.dur}s`,
            animationDelay: `${l.delay}s`,
            ["--sway" as string]: `${l.sway}px`,
            ["--spin" as string]: `${l.spin}deg`,
          }}
        >
          <svg viewBox="0 0 24 24" width="100%" height="100%" className="block drop-shadow-sm">
            <path d={l.shape.body} fill={l.color} />
            <path d={l.shape.vein} stroke="#fff" strokeOpacity=".45" strokeWidth=".8" strokeLinecap="round" fill="none" />
          </svg>
        </span>
      ))}
    </span>
  );
}
