import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MapPin, Ruler, ArrowRight, ExternalLink, MessageCircle, ImageOff } from "lucide-react";
import { Badge } from "@/app/components/ui/badge";
import { Button } from "@/app/components/ui/button";
import SpaceCard from "@/app/components/SpaceCard";
import ContactForm from "@/app/components/ContactForm";
import { SITE_NAME } from "@/lib/constants";
import { getSpaceListingBySlug, getSpaceListings, mapsSearchUrl } from "@/lib/spatiiComercialeData";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const listing = await getSpaceListingBySlug(slug);
  if (!listing) return { title: `Spații comerciale | ${SITE_NAME}` };
  return {
    title: `${listing.title} | ${SITE_NAME}`,
    description: listing.description ?? undefined,
  };
}

export default async function SpaceDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const listing = await getSpaceListingBySlug(slug);
  if (!listing) notFound();

  const allListings = await getSpaceListings();
  const related = allListings.filter((l) => l.type === listing.type && l.slug !== listing.slug).slice(0, 3);

  return (
    <main className="bg-background">
      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 pt-5 pb-2">
        <nav className="flex items-center gap-1.5 text-xs text-muted-foreground flex-wrap" aria-label="Fir de ariadnă">
          <Link href="/" className="hover:text-accent transition-colors">Acasă</Link>
          <span aria-hidden>›</span>
          <Link href="/spatii-comerciale" className="hover:text-accent transition-colors">Spații comerciale</Link>
          <span aria-hidden>›</span>
          <span className="text-foreground truncate max-w-[220px]">{listing.title}</span>
        </nav>
      </div>

      {/* Title row */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 pb-6">
        <Badge className="mb-3">{listing.type}</Badge>
        <h1 className="text-2xl sm:text-3xl lg:text-[32px] font-extrabold text-primary leading-tight mb-2">
          {listing.title}
        </h1>
        <div className="flex items-center gap-4 flex-wrap text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <Ruler className="w-4 h-4" aria-hidden />
            {listing.area} m²
          </span>
          <a
            href={mapsSearchUrl(listing.location)}
            target="_blank"
            rel="noopener noreferrer"
            title="Deschide locația în Google Maps"
            className="flex items-center gap-1.5 text-accent underline decoration-dotted underline-offset-2 hover:text-brand-red-dark transition-colors"
          >
            <MapPin className="w-4 h-4 shrink-0" aria-hidden />
            {listing.location}
            <ExternalLink className="w-3.5 h-3.5 shrink-0" aria-hidden />
          </a>
        </div>
      </section>

      {/* Top section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 pb-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <div className="relative h-72 sm:h-96 rounded-2xl overflow-hidden bg-muted flex items-center justify-center">
            {listing.image ? (
              <Image src={listing.image} alt={listing.title} fill className="object-cover" priority sizes="(max-width: 1024px) 100vw, 50vw" />
            ) : (
              <ImageOff className="w-10 h-10 text-muted-foreground" aria-hidden />
            )}
          </div>

          <div className="flex flex-col gap-6">
            <p className="text-foreground/80 text-[15px] leading-relaxed">{listing.description}</p>

            <div className="border border-border rounded-2xl p-5 bg-card">
              <span className="text-2xl font-extrabold text-primary block mb-4">{listing.priceLabel}</span>
              <Button asChild variant="accent" size="lg" className="w-full mb-3">
                <Link href="#contact">
                  <MessageCircle className="w-4 h-4" aria-hidden />
                  Cere consultanță
                </Link>
              </Button>
              <p className="text-xs text-muted-foreground text-center">
                Îți răspundem rapid cu detalii suplimentare și disponibilitate.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Characteristics */}
      {listing.characteristics.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 pb-12">
          <h2 className="text-2xl font-extrabold text-primary mb-6">Caracteristici</h2>
          <div className="border border-border rounded-2xl overflow-hidden bg-card max-w-2xl">
            {listing.characteristics.map((spec, i) => (
              <div
                key={`${spec.label}-${i}`}
                className={`flex items-center justify-between px-5 py-3 ${i > 0 ? "border-t border-border" : ""} ${i % 2 === 1 ? "bg-muted/40" : ""}`}
              >
                <span className="text-sm text-muted-foreground">{spec.label}</span>
                <span className="text-sm font-bold text-primary text-right">{spec.value}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Related */}
      {related.length > 0 && (
        <section className="bg-secondary/15 py-14">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
            <h2 className="text-2xl font-extrabold text-foreground uppercase tracking-wide mb-8">
              Spații <span className="text-accent">similare</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {related.map((l) => (
                <SpaceCard key={l.slug} listing={l} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Contact */}
      <section id="contact" className="max-w-3xl mx-auto px-5 sm:px-6 py-16 scroll-mt-24">
        <h2 className="text-2xl font-bold text-primary tracking-tight mb-2 text-center">Cere consultanță</h2>
        <p className="text-sm text-muted-foreground text-center mb-6">
          Scrie-ne pentru <span className="font-semibold text-foreground">{listing.title}</span> și îți răspundem rapid.
        </p>
        <ContactForm />
      </section>

      {/* Back link */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 pb-12 text-center">
        <Link href="/spatii-comerciale" className="inline-flex items-center gap-1.5 text-sm font-bold text-accent hover:underline">
          <ArrowRight className="w-4 h-4 rotate-180" aria-hidden />
          Vezi toate spațiile disponibile
        </Link>
      </div>
    </main>
  );
}
