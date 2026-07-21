import Link from "next/link";
import type { Metadata } from "next";
import { SITE_NAME } from "@/lib/constants";
import DivisionHero from "@/app/components/division/DivisionHero";
import SpaceCard from "@/app/components/SpaceCard";
import ContactForm from "@/app/components/ContactForm";
import { getSpaceListings } from "@/lib/spatiiComercialeData";

export const metadata: Metadata = {
  title: `Spații comerciale | ${SITE_NAME}`,
  description: `Apartamente, spații comerciale, birouri și depozite disponibile spre închiriere, de la ${SITE_NAME}.`,
};

export default async function SpatiiComercialePage({
  searchParams,
}: {
  searchParams: Promise<{ tip?: string }>;
}) {
  const { tip } = await searchParams;
  const allListings = await getSpaceListings();
  const types = Array.from(new Set(allListings.map((l) => l.type))).sort();
  const activeType = tip && types.includes(tip) ? tip : "toate";
  const listings = activeType === "toate" ? allListings : allListings.filter((l) => l.type === activeType);

  return (
    <main className="bg-background">
      <DivisionHero
        breadcrumbLabel="Spații comerciale"
        eyebrow="Spații comerciale și industriale"
        title="Apartamente, birouri"
        highlighted="și spații comerciale"
        description="Punem la dispoziție spre închiriere apartamente, spații comerciale, birouri și depozite, potrivite pentru locuit sau pentru afaceri de diverse dimensiuni."
        image="https://placehold.co/800x600/D8B2B1/652F37?text=Spatii+comerciale"
        primaryCta={{ label: "Vezi ofertele", href: "#oferte" }}
        secondaryCta={{ label: "Cere consultanță", href: "#contact" }}
      />

      <section id="oferte" className="py-12 lg:py-16 border-t border-border scroll-mt-24">
        <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-12">
          <div className="flex items-center gap-2 flex-wrap mb-8">
            <Link
              href="/spatii-comerciale"
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
                key={type}
                href={`/spatii-comerciale?tip=${encodeURIComponent(type)}`}
                className={`px-4 py-2 rounded-full text-sm font-bold transition-colors ${
                  activeType === type
                    ? "bg-primary text-white"
                    : "bg-card border border-border text-foreground hover:border-accent hover:text-accent"
                }`}
              >
                {type}
              </Link>
            ))}
          </div>

          {listings.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {listings.map((listing) => (
                <SpaceCard key={listing.slug} listing={listing} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-card border border-border rounded-2xl">
              <p className="text-muted-foreground">Momentan nu există spații disponibile în această categorie.</p>
            </div>
          )}
        </div>
      </section>

      <section id="contact" className="max-w-3xl mx-auto px-5 sm:px-6 pb-16">
        <h2 className="text-2xl font-bold text-primary tracking-tight mb-2 text-center">Cere consultanță</h2>
        <p className="text-sm text-muted-foreground text-center mb-6">
          Nu ai găsit ce cauți? Scrie-ne cerințele tale și revenim cu opțiuni potrivite.
        </p>
        <ContactForm />
      </section>
    </main>
  );
}
