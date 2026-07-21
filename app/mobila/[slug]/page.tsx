import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Layers, Clock, ArrowRight, MessageCircle, ImageOff } from "lucide-react";
import { Badge } from "@/app/components/ui/badge";
import { Button } from "@/app/components/ui/button";
import FurnitureCard from "@/app/components/FurnitureCard";
import ContactForm from "@/app/components/ContactForm";
import { SITE_NAME } from "@/lib/constants";
import { getFurnitureListingBySlug, getFurnitureListings } from "@/lib/mobilaData";
import JsonLd from "@/app/components/JsonLd";
import { breadcrumbList, serviceSchema } from "@/lib/structuredData";
import { absoluteUrl } from "@/lib/seo";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const listing = await getFurnitureListingBySlug(slug);
  if (!listing) return { title: { absolute: `Mobilă | ${SITE_NAME}` }, robots: { index: false, follow: true } };
  const title = `${listing.title} | ${SITE_NAME}`;
  const description = listing.description ?? `Descoperă ${listing.title} din gama de mobilier la comandă ${SITE_NAME}.`;
  const canonical = absoluteUrl(`/mobila/${slug}`);
  return {
    title: { absolute: title },
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical,
      ...(listing.image ? { images: [{ url: listing.image, width: 800, height: 600, alt: listing.title }] } : {}),
    },
    twitter: {
      title,
      description,
      ...(listing.image ? { images: [listing.image] } : {}),
    },
  };
}

export default async function FurnitureDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const listing = await getFurnitureListingBySlug(slug);
  if (!listing) notFound();

  const allListings = await getFurnitureListings();
  const related = allListings.filter((l) => l.typeId === listing.typeId && l.slug !== listing.slug).slice(0, 3);

  return (
    <main className="bg-background">
      <JsonLd
        data={breadcrumbList([
          { name: "Acasă", path: "/" },
          { name: "Mobilă", path: "/mobila" },
          { name: listing.title, path: `/mobila/${listing.slug}` },
        ])}
      />
      <JsonLd
        data={serviceSchema({
          name: listing.title,
          description: listing.description ?? `Mobilier la comandă produs în fabrica proprie ${SITE_NAME}.`,
          url: `/mobila/${listing.slug}`,
        })}
      />
      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 pt-5 pb-2">
        <nav className="flex items-center gap-1.5 text-xs text-muted-foreground flex-wrap" aria-label="Fir de ariadnă">
          <Link href="/" className="hover:text-accent transition-colors">Acasă</Link>
          <span aria-hidden>›</span>
          <Link href="/mobila" className="hover:text-accent transition-colors">Mobilă</Link>
          <span aria-hidden>›</span>
          <span className="text-foreground truncate max-w-[220px]">{listing.title}</span>
        </nav>
      </div>

      {/* Title row */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 pb-6">
        <Badge className="mb-3">{listing.type.name}</Badge>
        <h1 className="text-2xl sm:text-3xl lg:text-[32px] font-extrabold text-primary leading-tight mb-2">
          {listing.title}
        </h1>
        <div className="flex items-center gap-4 flex-wrap text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <Layers className="w-4 h-4" aria-hidden />
            {listing.material}
          </span>
          {listing.leadTime && (
            <span className="flex items-center gap-1.5">
              <Clock className="w-4 h-4" aria-hidden />
              {listing.leadTime}
            </span>
          )}
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
                  Cere o ofertă
                </Link>
              </Button>
              <p className="text-xs text-muted-foreground text-center">
                Îți răspundem rapid cu detalii suplimentare și un cost estimativ.
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
              Lucrări <span className="text-accent">similare</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {related.map((l) => (
                <FurnitureCard key={l.slug} listing={l} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Contact */}
      <section id="contact" className="max-w-3xl mx-auto px-5 sm:px-6 py-16 scroll-mt-24">
        <h2 className="text-2xl font-bold text-primary tracking-tight mb-2 text-center">Cere o ofertă</h2>
        <p className="text-sm text-muted-foreground text-center mb-6">
          Scrie-ne pentru <span className="font-semibold text-foreground">{listing.title}</span> și îți răspundem rapid.
        </p>
        <ContactForm />
      </section>

      {/* Back link */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 pb-12 text-center">
        <Link href="/mobila" className="inline-flex items-center gap-1.5 text-sm font-bold text-accent hover:underline">
          <ArrowRight className="w-4 h-4 rotate-180" aria-hidden />
          Vezi toate lucrările
        </Link>
      </div>
    </main>
  );
}
