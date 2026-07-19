import Link from "next/link";
import Image from "next/image";
import {
  ImageOff, Sofa, BedDouble, UtensilsCrossed, Briefcase,
  Package, TreePine, Building2, Warehouse, Factory, Store,
  ChevronRight,
} from "lucide-react";
import { categoryIcons } from "./CategoryIcons";
import { MotifBackground, HeadingFlourish } from "@/app/components/ui/motif";

/* ── types ─────────────────────────────────────────────────────────── */

interface DbCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
}

interface StaticCategory {
  id: string;
  name: string;
  href: string;
  Icon: React.ComponentType<{ className?: string }>;
}

/* ── static data ────────────────────────────────────────────────────── */

const MOBILA_CATS: StaticCategory[] = [
  { id: "m1", name: "Living & Canapele",      href: "/mobila?cat=living",    Icon: Sofa },
  { id: "m2", name: "Dormitor",               href: "/mobila?cat=dormitor",  Icon: BedDouble },
  { id: "m3", name: "Bucătărie & Sufragerie", href: "/mobila?cat=bucatarie", Icon: UtensilsCrossed },
  { id: "m4", name: "Birou & Office",         href: "/mobila?cat=birou",     Icon: Briefcase },
  { id: "m5", name: "Hol & Depozitare",       href: "/mobila?cat=hol",       Icon: Package },
  { id: "m6", name: "Exterior & Grădină",     href: "/mobila?cat=exterior",  Icon: TreePine },
];

const CHIRIE_CATS: StaticCategory[] = [
  { id: "c1", name: "Birouri",           href: "/spatii-comerciale?tip=birouri",           Icon: Building2 },
  { id: "c2", name: "Depozite",          href: "/spatii-comerciale?tip=depozite",          Icon: Warehouse },
  { id: "c3", name: "Hale industriale",  href: "/spatii-comerciale?tip=hale",              Icon: Factory },
  { id: "c4", name: "Spații comerciale", href: "/spatii-comerciale?tip=spatii-comerciale", Icon: Store },
];

/* ── sub-components ─────────────────────────────────────────────────── */

function DivisionHeader({ title, href, viewAllLabel }: { title: string; href: string; viewAllLabel: string }) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <span className="w-1 h-5 rounded-full bg-primary shrink-0" />
      <h3 className="text-base sm:text-lg font-bold text-primary uppercase tracking-wide">
        {title}
      </h3>
      <span className="h-px flex-1 bg-gradient-to-r from-brand-rose/60 to-transparent" />
      <Link
        href={href}
        className="flex items-center gap-1 text-xs sm:text-sm font-bold text-accent hover:underline shrink-0"
      >
        {viewAllLabel}
        <ChevronRight className="w-3.5 h-3.5" />
      </Link>
    </div>
  );
}

function CategoryCard({ cat }: { cat: DbCategory }) {
  const Icon = categoryIcons[cat.slug];
  return (
    <Link
      href={`/produse?cat=${cat.slug}`}
      className="group flex flex-col items-center text-center gap-2.5"
    >
      <div className="relative w-full aspect-square rounded-2xl overflow-hidden bg-secondary/25 flex items-center justify-center transition-transform duration-300 group-hover:-translate-y-1 group-hover:shadow-lg">
        {cat.image ? (
          <Image
            src={cat.image}
            alt={cat.name}
            fill
            sizes="(max-width: 640px) 45vw, 160px"
            className="object-contain p-5"
          />
        ) : Icon ? (
          <Icon className="w-1/2 h-1/2 text-primary" />
        ) : (
          <ImageOff className="w-8 h-8 text-muted-foreground" aria-hidden />
        )}
      </div>
      <h4 className="text-xs sm:text-sm font-bold text-foreground leading-snug line-clamp-2">
        {cat.name}
      </h4>
    </Link>
  );
}

function StaticCategoryCard({ cat }: { cat: StaticCategory }) {
  return (
    <Link
      href={cat.href}
      className="group flex flex-col items-center text-center gap-2.5"
    >
      <div className="relative w-full aspect-square rounded-2xl bg-secondary/25 flex items-center justify-center transition-transform duration-300 group-hover:-translate-y-1 group-hover:shadow-lg">
        <cat.Icon className="w-1/2 h-1/2 text-primary" />
      </div>
      <h4 className="text-xs sm:text-sm font-bold text-foreground leading-snug line-clamp-2">
        {cat.name}
      </h4>
    </Link>
  );
}

/* ── main component ─────────────────────────────────────────────────── */

interface Props {
  categories: DbCategory[];
}

export default function CategoryGrid({ categories }: Props) {
  return (
    <section className="relative overflow-hidden py-12 sm:py-16 bg-background">
      <MotifBackground />
      <div className="relative max-w-7xl mx-auto px-4 space-y-10">

        {/* ── Main heading ──────────────────────────────────────────── */}
        <div className="flex items-center gap-4 flex-wrap">
          <h2 className="text-2xl sm:text-3xl font-bold text-primary tracking-tight uppercase shrink-0">
            Categorii populare
          </h2>
          <div className="flex items-center gap-3 flex-1 min-w-[60px]">
            <HeadingFlourish />
            <span className="h-px flex-1 bg-gradient-to-r from-brand-rose to-transparent" />
          </div>
        </div>

        {/* ── Row 1: Produse de uz casnic ───────────────────────────── */}
        <div>
          <DivisionHeader
            title="Produse de uz casnic"
            href="/produse"
            viewAllLabel="Vezi toate"
          />
          <div
            className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4"
            style={{
              gridTemplateColumns: `repeat(${Math.min(categories.length, 7)}, minmax(0, 1fr))`,
            }}
          >
            {categories.map((cat) => (
              <CategoryCard key={cat.id} cat={cat} />
            ))}
          </div>
        </div>

        {/* ── Row 2: Mobilă ─────────────────────────────────────────── */}
        <div>
          <DivisionHeader
            title="Mobilă"
            href="/mobila"
            viewAllLabel="Vezi tot mobilierul"
          />
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
            {MOBILA_CATS.map((cat) => (
              <StaticCategoryCard key={cat.id} cat={cat} />
            ))}
          </div>
        </div>

        {/* ── Row 3: Chirie ─────────────────────────────────────────── */}
        <div>
          <DivisionHeader
            title="Chirie"
            href="/spatii-comerciale"
            viewAllLabel="Vezi toate spațiile"
          />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            {CHIRIE_CATS.map((cat) => (
              <StaticCategoryCard key={cat.id} cat={cat} />
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
