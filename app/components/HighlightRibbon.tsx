import { Crown, Flame, Leaf, Sparkles, ThumbsUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { HIGHLIGHT_LABELS, type HighlightKind } from "@/lib/productHighlight";
import { LEAF_SHAPES } from "./leafShapes";
import AutumnLeaves from "./AutumnLeaves";

// Eticheta specială de pe cardul de produs: pastilă cu gradient (specific fiecărui tip), pictogramă și — ca să se simtă toamna —
// frunze de mai multe feluri care cad lent peste ea. Doar decor animat (aria-hidden), oprit la „mișcare redusă".
const STYLE: Record<HighlightKind, { gradient: string; icon: typeof Crown; leaves: number }> = {
  // aur -> chihlimbar -> roșu-brun
  bestseller: { gradient: "from-[#f6b21a] via-[#e8841a] to-[#b3261e]", icon: Crown, leaves: 6 },
  // roșu aprins -> vișiniu
  popular: { gradient: "from-[#e5381f] via-[#c4271a] to-[#710808]", icon: Flame, leaves: 6 },
  // roz pudrat -> vișiniu (culorile brandului)
  nou: { gradient: "from-[#e9a0a0] via-[#c25a5a] to-[#8a2a2a]", icon: Sparkles, leaves: 5 },
  // portocaliu -> ruginiu -> brun de toamnă (cu mai multe frunze)
  sezon: { gradient: "from-[#ff9d1f] via-[#d9541a] to-[#7a3216]", icon: Leaf, leaves: 9 },
  // vișiniu adânc -> roșu închis
  util: { gradient: "from-[#8a2a2a] via-[#710808] to-[#4a0505]", icon: ThumbsUp, leaves: 5 },
};

// Pictograma etichetei „Toamnă": frunză de STEJAR în portocaliu închis, într-un cerc alb ca să iasă bine din gradient.
const OAK = LEAF_SHAPES.find((l) => l.name === "stejar")!;
function OakLeafIcon() {
  return (
    <span aria-hidden className="relative z-20 flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full bg-white shadow-sm sm:h-5 sm:w-5">
      <svg viewBox="0 0 24 24" className="h-[13px] w-[13px] sm:h-[15px] sm:w-[15px]">
        <path d={OAK.body} fill="#c2410c" />
        <path d={OAK.vein} stroke="#fff" strokeOpacity=".55" strokeWidth=".9" strokeLinecap="round" fill="none" />
      </svg>
    </span>
  );
}

export default function HighlightRibbon({ kind, className }: { kind: HighlightKind; className?: string }) {
  const { gradient, icon: Icon, leaves } = STYLE[kind];
  return (
    <span
      className={cn(
        "relative inline-flex max-w-full items-center gap-1.5 overflow-hidden rounded-full bg-gradient-to-r px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wide text-white shadow-md ring-1 ring-white/30 sm:px-3 sm:text-[11px]",
        gradient,
        className
      )}
    >
      {kind === "sezon" ? <OakLeafIcon /> : <Icon className="relative z-20 h-3 w-3 shrink-0 drop-shadow-sm sm:h-3.5 sm:w-3.5" aria-hidden />}
      <span className="relative z-20 truncate drop-shadow-sm">{HIGHLIGHT_LABELS[kind]}</span>
      <AutumnLeaves count={leaves} scale={0.55} className="!inset-0 z-10" />
    </span>
  );
}
