import Link from "next/link";
import Image from "next/image";
import { Layers, Clock, ArrowRight, ImageOff } from "lucide-react";
import { Badge } from "@/app/components/ui/badge";
import { type FurnitureListing } from "@/lib/mobilaData";

export default function FurnitureCard({ listing }: { listing: FurnitureListing }) {
  return (
    <Link
      href={`/mobila/${listing.slug}`}
      className="group flex flex-col bg-card rounded-2xl border border-border overflow-hidden h-full transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
    >
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
      <div className="flex flex-col flex-1 p-5">
        <h3 className="text-sm font-bold text-foreground leading-snug mb-2 line-clamp-2">{listing.title}</h3>
        <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
          <span className="flex items-center gap-1">
            <Layers className="w-3.5 h-3.5" aria-hidden />
            {listing.material}
          </span>
          {listing.leadTime && (
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" aria-hidden />
              {listing.leadTime}
            </span>
          )}
        </div>
        <p className="text-lg font-bold text-primary mb-3">{listing.priceLabel}</p>
        <span className="mt-auto inline-flex items-center gap-1.5 text-sm font-bold text-accent">
          Vezi detalii
          <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" aria-hidden />
        </span>
      </div>
    </Link>
  );
}
