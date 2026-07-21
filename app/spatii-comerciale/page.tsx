import Link from "next/link";
import type { Metadata } from "next";
import DivisionHero from "@/app/components/division/DivisionHero";
import SpaceCard from "@/app/components/SpaceCard";
import ContactForm from "@/app/components/ContactForm";
import { getSpaceListings, getSpaceTypes } from "@/lib/spatiiComercialeData";
import JsonLd from "@/app/components/JsonLd";
import { breadcrumbList, collectionPage } from "@/lib/structuredData";
import { absoluteUrl } from "@/lib/seo";

const SPATII_TITLE = "Spații de închiriat în Moldova | LuminTehnica";
const SPATII_DESCRIPTION =
  "Descoperă apartamentele, birourile, spațiile comerciale și depozitele oferite spre închiriere de LuminTehnica.";

export const metadata: Metadata = {
  title: { absolute: SPATII_TITLE },
  description: SPATII_DESCRIPTION,
  alternates: { canonical: absoluteUrl("/spatii-comerciale") },
  openGraph: {
    title: SPATII_TITLE,
    description: SPATII_DESCRIPTION,
    url: absoluteUrl("/spatii-comerciale"),
  },
  twitter: {
    title: SPATII_TITLE,
    description: SPATII_DESCRIPTION,
  },
};

export default async function SpatiiComercialePage({
  searchParams,
}: {
  searchParams: Promise<{ tip?: string }>;
}) {
  const { tip } = await searchParams;
  const [allListings, types] = await Promise.all([getSpaceListings(), getSpaceTypes()]);
  const activeType = tip && types.some((t) => t.slug === tip) ? tip : "toate";
  const listings = activeType === "toate" ? allListings : allListings.filter((l) => l.type.slug === activeType);

  return (
    <main className="bg-background">
      <JsonLd data={breadcrumbList([{ name: "Acasă", path: "/" }, { name: "Spații comerciale", path: "/spatii-comerciale" }])} />
      <JsonLd
        data={collectionPage({
          name: SPATII_TITLE,
          description: SPATII_DESCRIPTION,
          url: "/spatii-comerciale",
          items: listings.map((l) => ({ name: l.title, url: `/spatii-comerciale/${l.slug}`, image: l.image })),
        })}
      />
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
                key={type.id}
                href={`/spatii-comerciale?tip=${type.slug}`}
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
