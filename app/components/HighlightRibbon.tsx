import { cn } from "@/lib/utils";
import { HIGHLIGHT_LABELS, type HighlightKind } from "@/lib/productHighlight";
import AutumnLeaves from "./AutumnLeaves";

// Eticheta specială de pe cardul de produs: fiecare tip are PROPRIUL gradient, ca să se deosebească dintr-o privire:
//  Best seller = aur/chihlimbar · Popular = roșu aprins · Nou = verde proaspăt · Autumn Sale = portocaliu-ruginiu · Foarte util = albastru.
// Peste gradient: o lumină caldă în dreapta și frunze aprinse care cad lent. Doar text (fără pictograme), decor animat (aria-hidden),
// oprit la „mișcare redusă".
const GRADIENT: Record<HighlightKind, string> = {
  bestseller: "linear-gradient(120deg, #6b3d00 0%, #c47a0a 45%, #f2b01e 100%)",
  popular: "linear-gradient(120deg, #5c0a0a 0%, #c62a1c 50%, #ff6a3d 100%)",
  nou: "linear-gradient(120deg, #064e3b 0%, #0f9d6b 48%, #b6e63a 100%)",
  sezon: "linear-gradient(120deg, #4a1804 0%, #c2410c 50%, #ff9d1f 100%)",
  util: "linear-gradient(120deg, #0b2f55 0%, #1c6ba5 50%, #5fb8e8 100%)",
};

const LEAVES: Record<HighlightKind, number> = { bestseller: 7, popular: 7, nou: 9, sezon: 10, util: 6 };

export default function HighlightRibbon({ kind, className }: { kind: HighlightKind; className?: string }) {
  return (
    <span
      style={{ backgroundImage: GRADIENT[kind] }}
      className={cn(
        "relative inline-flex max-w-full items-center overflow-hidden rounded-full px-2 py-[3px] text-[8.5px] font-extrabold uppercase tracking-wide text-white shadow ring-1 ring-white/30 sm:px-2.5 sm:text-[9.5px]",
        className
      )}
    >
      <span className="relative z-20 truncate [text-shadow:0_1px_2px_rgba(0,0,0,0.55)]">{HIGHLIGHT_LABELS[kind]}</span>
      <AutumnLeaves count={LEAVES[kind]} scale={0.4} palette="bright" speed={kind === "nou" ? 1.6 : 1} className="!inset-0 z-10" />
    </span>
  );
}
