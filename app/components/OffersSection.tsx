import Link from "next/link";
import { Percent, PackageCheck, HeartHandshake, ArrowRight } from "lucide-react";
import { Badge } from "@/app/components/ui/badge";
import { Button } from "@/app/components/ui/button";

const offers = [
  {
    badge: "Ofertă sezon",
    title: "Reduceri de sezon până la -20%",
    description:
      "Profită de reducerile noastre pentru cele mai populare produse din catalog.",
    cta: "Descoperă ofertele",
    href: "/produse?reducere=true",
    bgClass: "bg-accent",
    icon: Percent,
  },
  {
    badge: "Pachet complet",
    title: "Produs + livrare inclusă",
    description:
      "Cumperi produsul, iar livrarea este inclusă gratuit. Fără costuri ascunse, fără surprize.",
    cta: "Vezi pachetele",
    href: "/pachete",
    bgClass: "bg-primary",
    icon: PackageCheck,
  },
  {
    badge: "Gratuit",
    title: "Consultanță gratuită",
    description:
      "Echipa noastră te ajută să alegi produsul potrivit nevoilor tale, fără costuri.",
    cta: "Solicită consultanță",
    href: "/contact",
    bgClass: "bg-brand-maroon-dark",
    icon: HeartHandshake,
  },
];

export default function OffersSection() {
  return (
    <section className="py-16 bg-muted">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-primary tracking-tight">Oferte speciale</h2>
          <p className="text-muted-foreground mt-2">Nu rata cele mai bune oferte ale lunii</p>
        </div>

        <div className="grid md:grid-cols-3 gap-5">
          {offers.map((offer) => (
            <div
              key={offer.title}
              className={`${offer.bgClass} rounded-2xl p-7 relative overflow-hidden flex flex-col`}
            >
              {/* Background icon */}
              <offer.icon className="absolute top-4 right-4 w-12 h-12 text-white/20" aria-hidden />

              <Badge variant="outline" className="self-start bg-white/15 border-transparent text-white mb-4">
                {offer.badge}
              </Badge>

              <h3 className="text-xl font-bold text-white mb-2 leading-snug">
                {offer.title}
              </h3>
              <p className="text-white/75 text-sm mb-6 leading-relaxed flex-1">
                {offer.description}
              </p>

              <Button asChild variant="secondary" className="self-start">
                <Link href={offer.href}>
                  {offer.cta}
                  <ArrowRight className="w-3.5 h-3.5" aria-hidden />
                </Link>
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
