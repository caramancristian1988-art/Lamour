import { cn } from "@/lib/utils";
import { HIGHLIGHT_LABELS, type HighlightKind } from "@/lib/productHighlight";
import AutumnLeaves from "./AutumnLeaves";

// Eticheta specială de pe cardul de produs: pastilă cu gradient (specific fiecărui tip), doar text, și — ca să se simtă toamna —
// frunze de mai multe feluri (inclusiv de stejar) care cad lent peste ea. Doar decor animat (aria-hidden), oprit la „mișcare redusă".
const STYLE: Record<HighlightKind, { gradient: string; leaves: number }> = {
  // aur -> chihlimbar -> roșu-brun
  bestseller: { gradient: "from-[#f6b21a] via-[#e8841a] to-[#b3261e]", leaves: 7 },
  // roșu aprins -> vișiniu
  popular: { gradient: "from-[#e5381f] via-[#c4271a] to-[#710808]", leaves: 7 },
  // roz pudrat -> vișiniu (culorile brandului)
  nou: { gradient: "from-[#e9a0a0] via-[#c25a5a] to-[#8a2a2a]", leaves: 6 },
  // portocaliu -> ruginiu -> brun de toamnă (cu mai multe frunze)
  sezon: { gradient: "from-[#ff9d1f] via-[#d9541a] to-[#7a3216]", leaves: 10 },
  // vișiniu adânc -> roșu închis
  util: { gradient: "from-[#8a2a2a] via-[#710808] to-[#4a0505]", leaves: 6 },
};

export default function HighlightRibbon({ kind, className }: { kind: HighlightKind; className?: string }) {
  const { gradient, leaves } = STYLE[kind];
  return (
    <span
      className={cn(
        "relative inline-flex max-w-full items-center overflow-hidden rounded-full bg-gradient-to-r px-3 py-1 text-[10px] font-extrabold uppercase tracking-wide text-white shadow-md ring-1 ring-white/30 sm:px-3.5 sm:text-[11px]",
        gradient,
        className
      )}
    >
      <span className="relative z-20 truncate drop-shadow-sm">{HIGHLIGHT_LABELS[kind]}</span>
      <AutumnLeaves count={leaves} scale={0.55} className="!inset-0 z-10" />
    </span>
  );
}
