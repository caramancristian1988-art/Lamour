export default function TopBar() {
  return (
    <div className="bg-[#1d2353] text-white text-xs py-2 px-4">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center sm:justify-between gap-1.5 sm:gap-4">
        <div className="flex items-center gap-1.5 sm:ml-16">
          <svg className="w-3.5 h-3.5 text-white/60 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8l1.647 7.412A2 2 0 008.607 17h6.786a2 2 0 001.96-1.588L19 8M10 12h4" />
          </svg>
          <span className="text-center">Transport gratuit pentru comenzi peste 1500 MDL</span>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-10 sm:mr-24">
          <a href="tel:+37369000000" className="flex items-center gap-1.5 hover:text-[#c7092b] transition-colors">
            <svg className="w-3.5 h-3.5 text-white/60" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" />
            </svg>
            +373 69 000 000
          </a>
          <a href="mailto:contact@climatrapid.md" className="flex items-center gap-1.5 hover:text-[#c7092b] transition-colors">
            <svg className="w-3.5 h-3.5 text-white/60" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
            </svg>
            contact@climatrapid.md
          </a>
        </div>
      </div>
    </div>
  );
}
