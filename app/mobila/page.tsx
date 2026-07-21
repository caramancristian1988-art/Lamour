import Link from "next/link";
import type { Metadata } from "next";
import { Palette, ShieldCheck, Building2, MapPin } from "lucide-react";
import { SITE_NAME } from "@/lib/constants";
import DivisionHero from "@/app/components/division/DivisionHero";
import DivisionBenefits from "@/app/components/division/DivisionBenefits";
import DivisionCta from "@/app/components/division/DivisionCta";
import ContactForm from "@/app/components/ContactForm";
import FurnitureCard from "@/app/components/FurnitureCard";
import { getFurnitureListings, getFurnitureTypes } from "@/lib/mobilaData";

export const metadata: Metadata = {
  title: `Mobilă | ${SITE_NAME}`,
  description: `Fabricație de mobilier la comandă — birou și casă — de la ${SITE_NAME}.`,
};

const benefits = [
  { icon: Palette, title: "Design la comandă", text: "Fiecare piesă este proiectată după cerințele și spațiul tău." },
  { icon: ShieldCheck, title: "Materiale durabile", text: "Lemn și materiale de calitate, gândite să reziste în timp." },
  { icon: Building2, title: "Birou și casă", text: "Soluții complete atât pentru spații rezidențiale, cât și pentru birouri." },
  { icon: MapPin, title: "Fabricat în Moldova", text: "Producție locală, cu control direct asupra calității." },
];

export default async function MobilaPage({
  searchParams,
}: {
  searchParams: Promise<{ tip?: string }>;
}) {
  const { tip } = await searchParams;
  const [allListings, types] = await Promise.all([getFurnitureListings(), getFurnitureTypes()]);
  const activeType = tip && types.some((t) => t.slug === tip) ? tip : "toate";
  const listings = activeType === "toate" ? allListings : allListings.filter((l) => l.type.slug === activeType);

  return (
    <main className="bg-background">
      <DivisionHero
        breadcrumbLabel="Mobilă"
        eyebrow="Divizia Mobilă"
        title="Mobilier la comandă,"
        highlighted="pentru birou și pentru casă"
        description="Proiectăm și fabricăm mobilier personalizat — de la piese unicat pentru locuință, până la soluții complete de mobilare pentru birouri și spații comerciale."
        image="https://placehold.co/800x600/9D5654/ffffff?text=Mobila+LuminTehnica"
        primaryCta={{ label: "Cere o ofertă", href: "#contact" }}
        secondaryCta={{ label: "Vezi galeria", href: "#galerie" }}
      />

      <section className="py-12 lg:py-16 border-t border-border">
        <div className="max-w-3xl mx-auto px-5 sm:px-6 text-center">
          <p className="text-accent text-xs font-bold tracking-widest uppercase mb-3">Despre divizie</p>
          <h2 className="text-2xl sm:text-3xl font-bold text-primary tracking-tight mb-6">
            Mobilier personalizat, făcut să dureze
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
            Pe lângă producția de hârtie și produse de uz casnic, {SITE_NAME} fabrică mobilier la comandă —
            pentru locuințe, birouri și spații comerciale. Fiecare proiect pornește de la nevoile clientului:
            dimensiuni, materiale, finisaje și buget, pentru un rezultat croit exact pe măsura spațiului tău.
          </p>
        </div>
      </section>

      <section id="galerie" className="py-12 lg:py-16 border-t border-border scroll-mt-24">
        <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-12">
          <div className="text-center mb-8">
            <p className="text-accent text-xs font-bold tracking-widest uppercase mb-3">Galerie</p>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-primary tracking-tight">
              Câteva dintre lucrările noastre
            </h2>
          </div>

          <div className="flex items-center gap-2 flex-wrap justify-center mb-8">
            <Link
              href="/mobila#galerie"
              className={`px-4 py-2 rounded-full text-sm font-bold transition-colors ${
                activeType === "toate"
                  ? "bg-primary text-white"
                  : "bg-card border border-border text-foreground hover:border-accent hover:text-accent"
              }`}
            >
              Toate
            </Link>
            {types.map((type) => (
              <Link
                key={type.id}
                href={`/mobila?tip=${type.slug}#galerie`}
                className={`px-4 py-2 rounded-full text-sm font-bold transition-colors ${
                  activeType === type.slug
                    ? "bg-primary text-white"
                    : "bg-card border border-border text-foreground hover:border-accent hover:text-accent"
                }`}
              >
                {type.name}
              </Link>
            ))}
          </div>

          {listings.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {listings.map((listing) => (
                <FurnitureCard key={listing.slug} listing={listing} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-card border border-border rounded-2xl">
              <p className="text-muted-foreground">Momentan nu există lucrări disponibile în această categorie.</p>
            </div>
          )}
        </div>
      </section>

      <DivisionBenefits eyebrow="De ce noi" title="Avantajele mobilierului la comandă" benefits={benefits} />

      <DivisionCta
        title="Ai un proiect de mobilier în minte?"
        description="Trimite-ne detaliile și revenim cu o ofertă personalizată."
        ctaLabel="Cere o ofertă"
        ctaHref="#contact"
      />

      <section id="contact" className="max-w-3xl mx-auto px-5 sm:px-6 pb-16">
        <h2 className="text-2xl font-bold text-primary tracking-tight mb-6 text-center">Cere o ofertă pentru mobilier</h2>
        <ContactForm />
      </section>
    </main>
  );
}
