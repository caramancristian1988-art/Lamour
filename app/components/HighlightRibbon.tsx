import { cn } from "@/lib/utils";
import { HIGHLIGHT_LABELS, type HighlightKind } from "@/lib/productHighlight";
import AutumnLeaves from "./AutumnLeaves";

// Eticheta specială de pe cardul de produs, în stilul „seară de toamnă": fundal închis (brun-vișiniu) cu o lumină caldă
// în dreapta (gradient radial, o culoare diferită pentru fiecare tip) și frunze aprinse (roșu, portocaliu, galben) care cad lent.
// Doar text, fără pictograme. Decor animat (aria-hidden), oprit la „mișcare redusă".
const BASE = "linear-gradient(135deg, #200000 0%, #552200 52%, #110000 100%)";

const GLOW: Record<HighlightKind, string> = {
  bestseller: "rgba(255, 207, 90, 0.95)", // aur
  popular: "rgba(255, 82, 52, 0.9)", // roșu aprins
  nou: "rgba(255, 168, 190, 0.9)", // roz pudrat
  sezon: "rgba(255, 238, 204, 0.95)", // lumină de apus
  util: "rgba(255, 190, 110, 0.85)", // chihlimbar
};

const LEAVES: Record<HighlightKind, number> = { bestseller: 7, popular: 7, nou: 6, sezon: 10, util: 6 };

export default function HighlightRibbon({ kind, className }: { kind: HighlightKind; className?: string }) {
  return (
    <span
      style={{
        backgroundImage: `radial-gradient(circle at 108% 50%, ${GLOW[kind]} 0%, rgba(255, 119, 17, 0) 46%), ${BASE}`,
      }}
      className={cn(
        "relative inline-flex max-w-full items-center overflow-hidden rounded-full px-2 py-[3px] text-[8.5px] font-extrabold uppercase tracking-wide text-white shadow ring-1 ring-white/25 sm:px-2.5 sm:text-[9.5px]",
        className
      )}
    >
      <span className="relative z-20 truncate [text-shadow:0_1px_2px_rgba(0,0,0,0.65)]">{HIGHLIGHT_LABELS[kind]}</span>
      <AutumnLeaves count={LEAVES[kind]} scale={0.4} palette="bright" className="!inset-0 z-10" />
    </span>
  );
}
