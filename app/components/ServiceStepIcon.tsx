const BLUE = "#4da3ff";
const RED = "#ff4d4d";

function Icon({ children }: { children: React.ReactNode }) {
  return (
    <svg className="w-10 h-10 sm:w-12 sm:h-12" fill="none" viewBox="0 0 24 24" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
      {children}
    </svg>
  );
}

const icons: Record<string, React.ReactNode> = {
  "Discuție": (
    <Icon>
      <path stroke={BLUE} d="M3 5a2 2 0 012-2h7a2 2 0 012 2v5a2 2 0 01-2 2H8l-3 3v-3H5a2 2 0 01-2-2V5z" />
      <path stroke={RED} d="M21 11v4a2 2 0 01-2 2h-1v3l-3-3h-2" />
    </Icon>
  ),
  "Consultare": (
    <Icon>
      <path stroke={BLUE} d="M3 5a2 2 0 012-2h7a2 2 0 012 2v5a2 2 0 01-2 2H8l-3 3v-3H5a2 2 0 01-2-2V5z" />
      <path stroke={RED} d="M21 11v4a2 2 0 01-2 2h-1v3l-3-3h-2" />
    </Icon>
  ),
  "Apel & programare": (
    <Icon>
      <path stroke={BLUE} d="M4 4h6l2 5-2.5 1.5a11 11 0 005 5L16 13l5 2v6c0 1-1 2-2 2A16 16 0 014 6c0-1 1-2 2-2z" />
      <path stroke={RED} d="M18 3l2 2-2 2M20 5h-5" />
    </Icon>
  ),
  "Evaluare": (
    <Icon>
      <rect x="5" y="3" width="11" height="15" rx="1.5" stroke={BLUE} />
      <path stroke={BLUE} d="M8 7.5h5M8 10.5h5M8 13.5h3" />
      <circle cx="17.5" cy="17.5" r="3" stroke={RED} />
      <path stroke={RED} d="M19.8 19.8L22 22" />
    </Icon>
  ),
  "Audit tehnic": (
    <Icon>
      <rect x="5" y="3" width="11" height="15" rx="1.5" stroke={BLUE} />
      <path stroke={BLUE} d="M8 7.5h5M8 10.5h5M8 13.5h3" />
      <circle cx="17.5" cy="17.5" r="3" stroke={RED} />
      <path stroke={RED} d="M19.8 19.8L22 22" />
    </Icon>
  ),
  "Inspecție": (
    <Icon>
      <rect x="3" y="6" width="13" height="6" rx="1.5" stroke={BLUE} />
      <path stroke={BLUE} d="M6 12v2M9.5 12v2.5M13 12v2" />
      <circle cx="17.5" cy="16.5" r="3.2" stroke={RED} />
      <path stroke={RED} d="M19.8 18.8L22 21" />
    </Icon>
  ),
  "Programare": (
    <Icon>
      <rect x="3" y="5" width="18" height="16" rx="2" stroke={BLUE} />
      <path stroke={BLUE} d="M3 9.5h18M7.5 3v4M16.5 3v4" />
      <path stroke={RED} d="M8 14l2 2 5-5" />
    </Icon>
  ),
  "Curățare": (
    <Icon>
      <rect x="3" y="3" width="9" height="11" rx="1.2" stroke={BLUE} />
      <path stroke={BLUE} d="M5.5 6.5h4M5.5 9h4M5.5 11.5h2.5" />
      <path stroke={RED} d="M17 9c1.7 2 2.5 3.4 2.5 5a2.5 2.5 0 01-5 0c0-1.6.8-3 2.5-5z" />
      <path stroke={RED} d="M14.5 4.5l.8.8M18 3.5l.5 1" />
    </Icon>
  ),
  "Diagnosticare": (
    <Icon>
      <path stroke={BLUE} d="M5 3v6a4 4 0 008 0V3" />
      <path stroke={BLUE} d="M5 6H3M13 6h2" />
      <circle cx="17.5" cy="16.5" r="3.5" stroke={RED} />
      <path stroke={RED} d="M9 9v3a4 4 0 004 4h1" />
    </Icon>
  ),
  "Reparație": (
    <Icon>
      <path stroke={BLUE} d="M14.5 9.5L20 4l-1.5 4L21 9l-4 1.5z" />
      <path stroke={BLUE} d="M14.5 9.5L5 19l-2 2 2-2 9.5-9.5z" />
      <path stroke={RED} d="M3 21l2-2M5 21l-2-2" />
    </Icon>
  ),
  "Montaj": (
    <Icon>
      <rect x="3" y="4" width="14" height="6" rx="1.5" stroke={BLUE} />
      <path stroke={BLUE} d="M3 10v3a2 2 0 002 2h2M17 7h2a2 2 0 012 2v9" />
      <path stroke={RED} d="M17 14l3 3-3 3M14 17h6" />
    </Icon>
  ),
  "Testare": (
    <Icon>
      <circle cx="11" cy="12" r="8" stroke={BLUE} />
      <path stroke={BLUE} d="M11 7v5l3 2" />
      <path stroke={RED} d="M16 4l2 2M20 8l2 2" />
    </Icon>
  ),
  "Configurare": (
    <Icon>
      <circle cx="9" cy="9" r="3" stroke={BLUE} />
      <path stroke={BLUE} d="M9 2v2M9 14v2M2 9h2M14 9h2M4.5 4.5l1.5 1.5M12 12l1.5 1.5M13.5 4.5L12 6M4.5 13.5L6 12" />
      <path stroke={RED} d="M16 15l4 4M20 15l-4 4" />
    </Icon>
  ),
  "Proiectare": (
    <Icon>
      <path stroke={BLUE} d="M3 17L14 6l4 4L7 21H3v-4z" />
      <path stroke={RED} d="M12 8l4 4M16 4l4 4" />
    </Icon>
  ),
  "Implementare": (
    <Icon>
      <path stroke={BLUE} d="M3 21h18M5 21V7l7-4 7 4v14" />
      <path stroke={BLUE} d="M9 21v-5h6v5" />
      <circle cx="17" cy="6" r="3.4" stroke={RED} />
      <path stroke={RED} d="M15.6 6l1 1 1.8-2" />
    </Icon>
  ),
  "Recomandare": (
    <Icon>
      <path stroke={BLUE} d="M9 18h6M10 21h4" />
      <path stroke={BLUE} d="M12 3a6 6 0 016 6c0 2.5-1.5 4-2.5 5H8.5C7.5 13 6 11.5 6 9a6 6 0 016-6z" />
      <path stroke={RED} d="M12 6v3M10.5 9l1.5 1.5L13.5 8" />
    </Icon>
  ),
};

const fallback = (
  <Icon>
    <path stroke={BLUE} d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" />
  </Icon>
);

export default function ServiceStepIcon({ title, className }: { title: string; className?: string }) {
  return (
    <div className={`flex items-center justify-center bg-[#0b1228] ${className ?? ""}`}>
      {icons[title] ?? fallback}
    </div>
  );
}
