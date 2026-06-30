const BLUE = "#1d2353";
const RED = "#c7092b";

function Icon({ children }: { children: React.ReactNode }) {
  return (
    <svg className="w-16 h-16 sm:w-20 sm:h-20" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
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
      <path stroke={BLUE} d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" />
      <rect x="13" y="1.5" width="9.5" height="8" rx="1.2" stroke={RED} />
      <path stroke={RED} d="M13 4.5h9.5M15.5 1.5v2M20 1.5v2" />
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
      <circle cx="10.5" cy="10.5" r="7" stroke={BLUE} />
      <path stroke={BLUE} d="M7.5 10.5h6M10.5 7.5v6" />
      <path stroke={RED} strokeLinecap="round" d="M16 16L21.5 21.5" strokeWidth={2} />
      <circle cx="10.5" cy="10.5" r="2.5" stroke={RED} />
    </Icon>
  ),
  "Reparație": (
    <Icon>
      <path stroke={BLUE} d="M20.01 6.36a4 4 0 01-4.72 3.9L8 18a2.5 2.5 0 01-3.54-3.54l7.27-7.27A4 4 0 0117.65 2l-2.65 2.65 1.35 1.35L19 3.35a4 4 0 011.01 3z" />
      <path stroke={RED} d="M9 14.5l1.5 1.5" />
      <path stroke={RED} d="M12 11.5l1.5 1.5" />
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
    <div className={`flex items-center justify-center bg-white ${className ?? ""}`}>
      {icons[title] ?? fallback}
    </div>
  );
}
