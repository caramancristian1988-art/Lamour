import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

const shared = {
  viewBox: "0 0 64 64",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

function ToiletPaperIcon(props: IconProps) {
  return (
    <svg {...shared} {...props}>
      <path d="M10 22 v20 a16 8 0 0 0 32 0 v-20" />
      <ellipse cx="26" cy="22" rx="16" ry="8" />
      <ellipse cx="26" cy="22" rx="6.5" ry="3.2" />
      <path d="M42 30 q13 3 10 16 q-3 10 -13 7" />
    </svg>
  );
}

function TissueBoxIcon(props: IconProps) {
  return (
    <svg {...shared} {...props}>
      <rect x="10" y="26" width="44" height="26" rx="4" />
      <path d="M19 26 q6 -12 13 0 q6 -12 13 0" />
      <path d="M23 26 q5 -9 9 0" fill="none" />
    </svg>
  );
}

function PaperTowelIcon(props: IconProps) {
  return (
    <svg {...shared} {...props}>
      <line x1="32" y1="8" x2="32" y2="56" />
      <ellipse cx="32" cy="15" rx="11" ry="5" />
      <path d="M21 15 v30 a11 5 0 0 0 22 0 v-30" />
      <ellipse cx="32" cy="45" rx="11" ry="5" />
    </svg>
  );
}

function WetWipesIcon(props: IconProps) {
  return (
    <svg {...shared} {...props}>
      <rect x="11" y="24" width="42" height="30" rx="11" />
      <circle cx="32" cy="24" r="8.5" />
      <path d="M27 23 q5 -9 10 0" />
    </svg>
  );
}

function MatchesIcon(props: IconProps) {
  return (
    <svg {...shared} {...props}>
      <rect x="13" y="26" width="38" height="24" rx="3" />
      <rect x="19" y="31" width="26" height="14" rx="2" />
      <line x1="22" y1="26" x2="20" y2="14" />
      <circle cx="19.6" cy="12.5" r="2.2" fill="currentColor" />
      <line x1="32" y1="26" x2="31" y2="12" />
      <circle cx="30.8" cy="10.5" r="2.2" fill="currentColor" />
      <line x1="42" y1="26" x2="44" y2="14" />
      <circle cx="44.4" cy="12.5" r="2.2" fill="currentColor" />
    </svg>
  );
}

function BottleIcon(props: IconProps) {
  return (
    <svg {...shared} {...props}>
      <rect x="27" y="9" width="10" height="7" rx="1.5" />
      <path d="M25 16 h14 l4 8 v26 a4 4 0 0 1 -4 4 h-14 a4 4 0 0 1 -4 -4 v-26 z" />
      <line x1="21" y1="34" x2="43" y2="34" />
    </svg>
  );
}

export const categoryIcons: Record<string, (props: IconProps) => React.JSX.Element> = {
  "hartie-igienica": ToiletPaperIcon,
  servetele: TissueBoxIcon,
  "prosoape-de-hartie": PaperTowelIcon,
  "servetele-umede": WetWipesIcon,
  chibrite: MatchesIcon,
  "alte-produse": BottleIcon,
};
