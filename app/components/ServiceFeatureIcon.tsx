function Svg({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <svg className={className ?? "w-6 h-6 text-[#c7092b]"} fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      {children}
    </svg>
  );
}

const icons: Record<string, (className?: string) => React.ReactNode> = {
  award: (c) => <Svg className={c}><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></Svg>,
  clock: (c) => <Svg className={c}><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></Svg>,
  shield: (c) => <Svg className={c}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><path d="M9 12l2 2 4-4" /></Svg>,
  support: (c) => <Svg className={c}><path d="M3 18v-6a9 9 0 0 1 18 0v6" /><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3z" /><path d="M3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" /></Svg>,
  package: (c) => <Svg className={c}><path d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2v-4M9 21H5a2 2 0 01-2-2v-4m0 0h18" /></Svg>,
  calendar: (c) => <Svg className={c}><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></Svg>,
  search: (c) => <Svg className={c}><circle cx="11" cy="11" r="7" /><path d="M21 21l-4.35-4.35" /></Svg>,
  wrench: (c) => <Svg className={c}><path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z" /></Svg>,
  "search-plus": (c) => <Svg className={c}><circle cx="11" cy="11" r="7" /><path d="M21 21l-4.35-4.35" /><path d="M8.5 11h5" /></Svg>,
  grid: (c) => <Svg className={c}><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></Svg>,
  "clock-alt": (c) => <Svg className={c}><circle cx="12" cy="12" r="9" /><path d="M12 8v4l3 2" /></Svg>,
  bolt: (c) => <Svg className={c}><path d="M13 2L4 14h6l-1 8 9-12h-6l1-8z" /></Svg>,
  home: (c) => <Svg className={c}><path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1h-5v-7H9v7H4a1 1 0 01-1-1V9.5z" /></Svg>,
  building: (c) => <Svg className={c}><path d="M3 21V8l9-5 9 5v13" /><path d="M9 21V12h6v9" /></Svg>,
  blueprint: (c) => <Svg className={c}><path d="M4 19h16M4 19V7l5-3 5 3v12M14 19v-7l5-3v10" /></Svg>,
  users: (c) => <Svg className={c}><circle cx="9" cy="7" r="3" /><circle cx="17" cy="9" r="2.5" /><path d="M3 21v-2a5 5 0 015-5h2a5 5 0 015 5v2" /><path d="M16 21v-1.5a4 4 0 00-2-3.464" /></Svg>,
};

export const ICON_OPTIONS = [
  { value: "award", label: "Premiu / Certificare" },
  { value: "clock", label: "Ceas (rapid)" },
  { value: "shield", label: "Scut / Garanție" },
  { value: "support", label: "Suport / Asistență" },
  { value: "package", label: "Pachet / Produse" },
  { value: "calendar", label: "Calendar / Programare" },
  { value: "search", label: "Lupă / Diagnosticare" },
  { value: "wrench", label: "Cheie / Piese" },
  { value: "search-plus", label: "Lupă+ / Recomandare" },
  { value: "grid", label: "Grilă / Camere" },
  { value: "clock-alt", label: "Ceas / Control" },
  { value: "bolt", label: "Fulger / Eficiență" },
  { value: "home", label: "Casă / Montaj" },
  { value: "building", label: "Clădire / Capacități" },
  { value: "blueprint", label: "Plan / Proiectare" },
  { value: "users", label: "Echipă / Utilizatori" },
];

export default function ServiceFeatureIcon({ icon, className }: { icon: string; className?: string }) {
  const render = icons[icon] ?? icons.award;
  return <>{render(className)}</>;
}
