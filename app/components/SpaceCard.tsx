import Link from "next/link";
import Image from "next/image";
import { MapPin, Ruler, ArrowRight, ExternalLink, ImageOff } from "lucide-react";
import { Badge } from "@/app/components/ui/badge";
import ListingPrice from "@/app/components/ListingPrice";
import { mapsSearchUrl, type SpaceListing } from "@/lib/spatiiComercialeData";

// Aceeași aranjare ca la FurnitureCard (vezi comentariul de acolo): imagine 4:3, detalii pe rânduri separate, preț și
// „Vezi detalii” aliniate jos. Locația rămâne link către Google Maps.
export default function SpaceCard({
  listing,
  sizes = "(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 33vw",
}: {
  listing: SpaceListing;
  sizes?: string;
}) {
  const href = `/spatii-comerciale/${listing.slug}`;

  return (
    <div className="group flex flex-col bg-card rounded-2xl border border-border overflow-hidden h-full transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
      <Link href={href} className="contents">
        <div className="relative aspect-[4/3] sm:aspect-auto sm:h-52 bg-muted overflow-hidden flex items-center justify-center">
          {listing.image ? (
            <Image
              src={listing.image}
              alt={listing.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              sizes={sizes}
            />
          ) : (
            <ImageOff className="w-8 h-8 text-muted-foreground" aria-hidden />
          )}
          <Badge className="absolute top-2 left-2 sm:top-3 sm:left-3 max-w-[calc(100%-1rem)] truncate px-2 py-0.5 text-[10px] sm:px-3 sm:py-1 sm:text-xs">
            {listing.type.name}
          </Badge>
        </div>
      </Link>
      <div className="flex flex-col flex-1 p-3.5 sm:p-5">
        <Link href={href} className="contents">
          <h3 className="text-[15px] sm:text-sm font-bold text-foreground leading-snug mb-2 line-clamp-3 sm:line-clamp-2">{listing.title}</h3>
        </Link>
        <ul className="flex flex-col gap-1 text-xs text-muted-foreground mb-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-3">
          <li className="flex items-start gap-1.5">
            <Ruler className="w-3.5 h-3.5 mt-0.5 shrink-0" aria-hidden />
            <span>{listing.area} m²</span>
          </li>
          <li className="flex items-start gap-1.5">
            <MapPin className="w-3.5 h-3.5 mt-0.5 shrink-0" aria-hidden />
            <a
              href={mapsSearchUrl(listing)}
              target="_blank"
              rel="noopener noreferrer"
              title="Deschide locația în Google Maps"
              className="text-accent underline decoration-dotted underline-offset-2 hover:text-brand-red-dark transition-colors"
            >
              <span className="line-clamp-2">{listing.location}</span>
            </a>
            <ExternalLink className="w-3 h-3 mt-0.5 shrink-0 text-accent" aria-hidden />
          </li>
        </ul>
        <div className="mt-auto">
          <Link href={href} className="block">
            <ListingPrice label={listing.priceLabel} className="mb-3" />
            <span className="inline-flex items-center gap-1.5 text-sm font-bold text-accent">
              Vezi detalii
              <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" aria-hidden />
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
}
