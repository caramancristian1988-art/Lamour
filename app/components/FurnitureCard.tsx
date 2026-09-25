import Link from "next/link";
import Image from "next/image";
import { Layers, Clock, ArrowRight, ImageOff } from "lucide-react";
import { Badge } from "@/app/components/ui/badge";
import ListingPrice from "@/app/components/ListingPrice";
import { type FurnitureListing } from "@/lib/mobilaData";

// Pe telefon, în lista cu 2 coloane, cardul are ~170 px lățime: imagine 4:3 (ca la produsele de uz casnic, nu înaltă și
// decupată; de la 640 px în sus rămâne înălțimea fixă de dinainte), padding mai mic, titlu pe până la 3 rânduri, detaliile pe rânduri separate (nu unul lângă altul, unde se rupeau
// în 4 linii), iar prețul și „Vezi detalii” rămân mereu jos, aliniate între carduri. `sizes` = lățimea reală a cardului.
export default function FurnitureCard({
  listing,
  sizes = "(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 33vw",
}: {
  listing: FurnitureListing;
  sizes?: string;
}) {
  return (
    <Link
      href={`/mobila/${listing.slug}`}
      className="group flex flex-col bg-card rounded-2xl border border-border overflow-hidden h-full transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
    >
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
      <div className="flex flex-col flex-1 p-3.5 sm:p-5">
        <h3 className="text-[15px] sm:text-sm font-bold text-foreground leading-snug mb-2 line-clamp-3 sm:line-clamp-2">{listing.title}</h3>
        <ul className="flex flex-col gap-1 text-xs text-muted-foreground mb-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-3">
          <li className="flex items-start gap-1.5">
            <Layers className="w-3.5 h-3.5 mt-0.5 shrink-0" aria-hidden />
            <span className="line-clamp-2">{listing.material}</span>
          </li>
          {listing.leadTime && (
            <li className="flex items-start gap-1.5">
              <Clock className="w-3.5 h-3.5 mt-0.5 shrink-0" aria-hidden />
              <span>{listing.leadTime}</span>
            </li>
          )}
        </ul>
        <div className="mt-auto">
          <ListingPrice label={listing.priceLabel} className="mb-3" />
          <span className="inline-flex items-center gap-1.5 text-sm font-bold text-accent">
            Vezi detalii
            <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" aria-hidden />
          </span>
        </div>
      </div>
    </Link>
  );
}
