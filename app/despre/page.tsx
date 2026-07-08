import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { getSectionFlags } from "@/lib/siteSettings";
import { SITE_NAME } from "@/lib/constants";
import { Button } from "@/app/components/ui/button";
import { MotifDivider } from "@/app/components/ui/motif";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: `Despre noi | ${SITE_NAME}`,
  description: `Află povestea ${SITE_NAME}, producător moldovenesc de hârtie igienică și produse de uz casnic, dedicat calității și incluziunii sociale.`,
};

const stats = [
  { value: "10+", label: "Ani de activitate" },
  { value: "50+", label: "Angajați" },
  { value: "12+", label: "Produse în gamă" },
  { value: "100%", label: "Celuloză" },
];

// Placeholder team — swap for real staff photos when available.
const team = [
  { name: "Alexandru Popescu", role: "Director executiv", image: "https://placehold.co/400x400/D8B2B1/652F37?text=Foto+echipa" },
  { name: "Mihai Rotaru", role: "Responsabil producție", image: "https://placehold.co/400x400/D8B2B1/652F37?text=Foto+echipa" },
  { name: "Ion Cebotari", role: "Specialist control calitate", image: "https://placehold.co/400x400/D8B2B1/652F37?text=Foto+echipa" },
  { name: "Vladimir Turcanu", role: "Coordonator incluziune socială", image: "https://placehold.co/400x400/D8B2B1/652F37?text=Foto+echipa" },
];

export default async function DesprePage() {
  const { despreEnabled } = await getSectionFlags();
  if (!despreEnabled) notFound();

  return (
    <main className="bg-background">
      {/* ── HERO SECTION ── */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[300px] lg:min-h-[400px] items-center gap-8 py-8 lg:py-0">
            {/* LEFT */}
            <div className="relative z-10 py-6 lg:py-10">
              <nav aria-label="Fir de ariadnă" className="flex items-center gap-1.5 text-xs sm:text-sm text-muted-foreground mb-5">
                <Link href="/" className="hover:text-accent transition-colors rounded">Acasă</Link>
                <span aria-hidden>›</span>
                <span className="text-foreground font-medium">Despre noi</span>
              </nav>

              <p className="text-accent text-xs font-bold tracking-widest uppercase mb-4">
                Despre {SITE_NAME}
              </p>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight tracking-tight mb-4 text-primary">
                Calitate cu <span className="text-accent">suflet</span>, în fiecare produs.
              </h1>

              <p className="text-sm sm:text-base text-foreground/80 leading-relaxed mb-8 max-w-md">
                Producem hârtie igienică, șervețele și alte produse de uz casnic din 100% celuloză,
                cu grijă pentru oameni și pentru natură. Ne implicăm activ în susținerea incluziunii
                sociale, oferind locuri de muncă persoanelor cu dizabilități.
              </p>

              <div className="flex flex-wrap gap-3">
                <Button asChild variant="accent" size="lg">
                  <Link href="/produse">Vezi produsele</Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link href="/contact">Contactează-ne</Link>
                </Button>
              </div>
            </div>

            {/* RIGHT: Image */}
            <div className="relative w-full rounded-2xl overflow-hidden shadow-xl aspect-[4/3] lg:aspect-auto lg:h-[380px]">
              {/* Placeholder — swap for a real production-line/factory photo. */}
              <Image
                src="https://placehold.co/800x600/9D5654/ffffff?text=Fabrica+noastra"
                alt=""
                fill
                className="object-cover object-center"
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── POVESTEA NOASTRĂ ── */}
      <section className="py-12 lg:py-16 border-t border-border">
        <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-14 items-center">
            <div className="order-1 lg:order-2">
              <p className="text-accent text-xs font-bold tracking-widest uppercase mb-3">
                Povestea noastră
              </p>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-primary leading-tight tracking-tight mb-6">
                Experiență, încredere și dedicare
              </h2>
              <div className="space-y-4 text-sm sm:text-base text-muted-foreground leading-relaxed">
                <p>
                  {SITE_NAME} a apărut din dorința de a oferi familiilor din Moldova produse de
                  hârtie și igienă de calitate, fabricate local, din 100% celuloză.
                </p>
                <p>
                  De peste 10 ani, am crescut alături de comunitate și am dezvoltat parteneriate
                  solide, susținând totodată incluziunea socială prin colaborarea cu Asociația
                  Nevăzătorilor din Moldova, care ne oferă o parte din echipă.
                </p>
                <p>
                  Fiecare produs care iese din fabrica noastră poartă grija pentru oameni și pentru
                  natură, de la materia primă până la ambalaj.
                </p>
              </div>
            </div>

            <div className="relative order-2 lg:order-1">
              <div className="relative h-[220px] sm:h-[300px] lg:h-[360px] rounded-2xl overflow-hidden shadow-xl">
                {/* Placeholder — swap for a real photo of the production/packaging line. */}
                <Image
                  src="https://placehold.co/800x600/D8B2B1/652F37?text=Productia+noastra"
                  alt=""
                  fill
                  className="object-cover object-center"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <MotifDivider className="max-w-7xl mx-auto" />

      {/* ── STATISTICI ── */}
      <section className="py-10">
        <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-12">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {stats.map((stat) => (
              <div
                key={stat.value}
                className="bg-card border border-border rounded-2xl shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 px-6 py-8 text-center"
              >
                <div className="text-3xl sm:text-4xl font-bold text-accent mb-2">{stat.value}</div>
                <div className="text-sm text-muted-foreground font-medium leading-snug">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── ECHIPA NOASTRĂ ── */}
      <section className="py-12 lg:py-16">
        <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-10 lg:gap-16 items-start">
            <div className="lg:pt-4">
              <p className="text-accent text-xs font-bold tracking-widest uppercase mb-3">
                Echipa noastră
              </p>
              <h2 className="text-2xl sm:text-3xl font-bold text-primary leading-tight tracking-tight">
                Profesioniști de încredere, la dispoziția ta
              </h2>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {team.map((member) => (
                <div
                  key={member.name}
                  className="group bg-card border border-border rounded-2xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden"
                >
                  <div className="h-44 relative overflow-hidden">
                    <Image
                      src={member.image}
                      alt=""
                      fill
                      className="object-cover object-top group-hover:scale-105 transition-transform duration-300"
                      sizes="(max-width: 768px) 50vw, 25vw"
                    />
                  </div>
                  <div className="px-4 py-4 text-center">
                    <h3 className="font-bold text-foreground text-sm mb-1">{member.name}</h3>
                    <p className="text-accent text-[11px] font-semibold">{member.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA SECTION ── */}
      <section className="px-5 sm:px-6 lg:px-12 pb-12">
        <div className="max-w-7xl mx-auto bg-primary rounded-2xl py-10 lg:py-12 px-6 sm:px-8 lg:px-12">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white leading-tight tracking-tight mb-2">
                Ai întrebări? Suntem aici pentru tine!
              </h2>
              <p className="text-white/70 text-sm max-w-md">
                Echipa noastră îți stă la dispoziție pentru orice informații sau recomandări personalizate.
              </p>
            </div>
            <div className="shrink-0">
              <Button asChild variant="accent" size="lg">
                <Link href="/contact">
                  Contactează-ne
                  <ArrowRight className="w-4 h-4" aria-hidden />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
