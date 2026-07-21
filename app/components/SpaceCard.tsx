import Link from "next/link";
import Image from "next/image";
import { MapPin, Ruler, ArrowRight, ExternalLink, ImageOff } from "lucide-react";
import { Badge } from "@/app/components/ui/badge";
import { mapsSearchUrl, type SpaceListing } from "@/lib/spatiiComercialeData";

export default function SpaceCard({ listing }: { listing: SpaceListing }) {
  const href = `/spatii-comerciale/${listing.slug}`;

  return (
    <div className="group flex flex-col bg-card rounded-2xl border border-border overflow-hidden h-full transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
      <Link href={href} className="contents">
        <div className="relative h-52 bg-muted overflow-hidden flex items-center justify-center">
          {listing.image ? (
            <Image
              src={listing.image}
              alt={listing.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          ) : (
            <ImageOff className="w-8 h-8 text-muted-foreground" aria-hidden />
          )}
          <Badge className="absolute top-3 left-3">{listing.type.name}</Badge>
        </div>
      </Link>
      <div className="flex flex-col flex-1 p-5">
        <Link href={href} className="contents">
          <h3 className="text-sm font-bold text-foreground leading-snug mb-2 line-clamp-2">{listing.title}</h3>
        </Link>
        <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
          <span className="flex items-center gap-1">
            <Ruler className="w-3.5 h-3.5" aria-hidden />
            {listing.area} m²
          </span>
          <a
            href={mapsSearchUrl(listing)}
            target="_blank"
            rel="noopener noreferrer"
            title="Deschide locația în Google Maps"
            className="flex items-center gap-1 text-accent underline decoration-dotted underline-offset-2 hover:text-brand-red-dark transition-colors"
          >
            <MapPin className="w-3.5 h-3.5 shrink-0" aria-hidden />
            {listing.location}
            <ExternalLink className="w-3 h-3 shrink-0" aria-hidden />
          </a>
        </div>
        <Link href={href} className="contents">
          <p className="text-lg font-bold text-primary mb-3">{listing.priceLabel}</p>
          <span className="mt-auto inline-flex items-center gap-1.5 text-sm font-bold text-accent">
            Vezi detalii
            <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" aria-hidden />
          </span>
        </Link>
      </div>
    </div>
  );
}
