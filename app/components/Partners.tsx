// Placeholder partner names — swap for real partner logos when available.
const partners = [
  "Asociația Nevăzătorilor din Moldova",
  "Camera de Comerț și Industrie",
  "Made in Moldova",
  "Farmec Distribuție",
  "Agroindbank",
  "Poșta Moldovei",
];

export default function Partners() {
  const track = [...partners, ...partners];

  return (
    <section className="py-12 sm:py-14 bg-background border-y border-border overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 mb-6">
        <p className="text-center text-xs font-bold text-muted-foreground uppercase tracking-widest">
          Parteneri și colaboratori
        </p>
      </div>

      <div className="relative">
        <div className="flex w-max gap-12 animate-marquee">
          {track.map((name, i) => (
            <div
              key={`${name}-${i}`}
              className="shrink-0 h-14 px-8 flex items-center justify-center rounded-xl bg-card border border-border text-sm font-bold text-muted-foreground whitespace-nowrap"
            >
              {name}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
