import Link from "next/link";
import SpaceCard from "./SpaceCard";
import { Button } from "@/app/components/ui/button";
import { MotifBackground, HeadingFlourish } from "@/app/components/ui/motif";
import type { SpaceListing } from "@/lib/spatiiComercialeData";

interface Props {
  listings: SpaceListing[];
  title?: string;
  highlighted?: string;
  viewAllHref?: string;
  viewAllLabel?: string;
  bg?: string;
}

export default function SpaceSection({
  listings,
  title = "Chirie",
  highlighted = "spații disponibile",
  viewAllHref = "/produse?division=chirie",
  viewAllLabel = "Vezi toate spațiile",
  bg = "bg-background",
}: Props) {
  return (
    <section className={`relative overflow-hidden py-12 sm:py-16 ${bg}`}>
      <MotifBackground />
      <div className="relative max-w-7xl mx-auto px-4">
        <div className="flex items-center gap-4 mb-10 flex-wrap">
          <h2 className="text-2xl sm:text-3xl font-bold text-primary tracking-tight uppercase shrink-0">
            {title} <span className="text-accent">{highlighted}</span>
          </h2>
          <div className="flex items-center gap-3 flex-1 min-w-[60px]">
            <HeadingFlourish />
            <span className="h-px flex-1 bg-gradient-to-r from-brand-rose to-transparent" />
          </div>
          <Button asChild variant="accent" size="sm" className="shrink-0">
            <Link href={viewAllHref}>{viewAllLabel}</Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-5">
          {listings.map((listing) => (
            <SpaceCard key={listing.slug} listing={listing} />
          ))}
        </div>
      </div>
    </section>
  );
}
