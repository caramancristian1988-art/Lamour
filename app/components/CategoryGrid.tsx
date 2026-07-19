"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ImageOff, Sofa, BedDouble, UtensilsCrossed, Briefcase,
  Package, TreePine, Building2, Warehouse, Factory, Store,
} from "lucide-react";
import { Button } from "@/app/components/ui/button";
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
  slug: string;
  href: string;
  Icon: React.ComponentType<{ className?: string }>;
}

/* ── static data ────────────────────────────────────────────────────── */

const MOBILA_CATS: StaticCategory[] = [
  { id: "m1", name: "Living & Canapele",       slug: "living",    href: "/mobila?cat=living",    Icon: Sofa },
  { id: "m2", name: "Dormitor",                slug: "dormitor",  href: "/mobila?cat=dormitor",  Icon: BedDouble },
  { id: "m3", name: "Bucătărie & Sufragerie",  slug: "bucatarie", href: "/mobila?cat=bucatarie", Icon: UtensilsCrossed },
  { id: "m4", name: "Birou & Office",          slug: "birou",     href: "/mobila?cat=birou",     Icon: Briefcase },
  { id: "m5", name: "Hol & Depozitare",        slug: "hol",       href: "/mobila?cat=hol",       Icon: Package },
  { id: "m6", name: "Exterior & Grădină",      slug: "exterior",  href: "/mobila?cat=exterior",  Icon: TreePine },
];

const CHIRIE_CATS: StaticCategory[] = [
  { id: "c1", name: "Birouri",          slug: "birouri",  href: "/spatii-comerciale?tip=birouri",           Icon: Building2 },
  { id: "c2", name: "Depozite",         slug: "depozite", href: "/spatii-comerciale?tip=depozite",          Icon: Warehouse },
  { id: "c3", name: "Hale industriale", slug: "hale",     href: "/spatii-comerciale?tip=hale",              Icon: Factory },
  { id: "c4", name: "Spații comerciale",slug: "spatii",   href: "/spatii-comerciale?tip=spatii-comerciale", Icon: Store },
];

const DIVISIONS = [
  {
    key:        "produse" as const,
    label:      "Produse de uz casnic",
    viewAllHref:  "/produse",
    viewAllLabel: "Vezi toate categoriile",
  },
  {
    key:        "mobila" as const,
    label:      "Mobilă",
    viewAllHref:  "/mobila",
    viewAllLabel: "Vezi tot mobilierul",
  },
  {
    key:        "chirie" as const,
    label:      "Chirie",
    viewAllHref:  "/spatii-comerciale",
    viewAllLabel: "Vezi toate spațiile",
  },
];

type Division = "produse" | "mobila" | "chirie";

/* ── component ─────────────────────────────────────────────────────── */

interface Props {
  categories: DbCategory[];
}

export default function CategoryGrid({ categories }: Props) {
  const [division, setDivision] = useState<Division>("produse");

  const active = DIVISIONS.find((d) => d.key === division)!;

  const produseCols = categories.length || 7;

  return (
    <section className="relative overflow-hidden py-12 sm:py-16 bg-background">
      <MotifBackground />
      <div className="relative max-w-7xl mx-auto px-4">

        {/* ── Division switcher ─────────────────────────────────────── */}
        <div className="flex flex-wrap gap-2 mb-8">
          {DIVISIONS.map((d) => (
            <button
              key={d.key}
              onClick={() => setDivision(d.key)}
              className={[
                "px-4 py-1.5 rounded-full text-sm font-bold border transition-colors",
                division === d.key
                  ? "bg-primary text-white border-primary"
                  : "bg-transparent text-primary border-primary/40 hover:border-primary hover:bg-secondary/30",
              ].join(" ")}
            >
              {d.label}
            </button>
          ))}
        </div>

        {/* ── Section heading ───────────────────────────────────────── */}
        <div className="flex items-center gap-4 mb-10 flex-wrap">
          <h2 className="text-2xl sm:text-3xl font-bold text-primary tracking-tight uppercase shrink-0">
            Categorii populare
          </h2>
          <div className="flex items-center gap-3 flex-1 min-w-[60px]">
            <HeadingFlourish />
            <span className="h-px flex-1 bg-gradient-to-r from-brand-rose to-transparent" />
          </div>
          <Button asChild variant="accent" size="sm" className="shrink-0">
            <Link href={active.viewAllHref}>{active.viewAllLabel}</Link>
          </Button>
        </div>

        {/* ── Grid: Produse de uz casnic (DB) ──────────────────────── */}
        {division === "produse" && (
          <div
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-[repeat(var(--cat-count),minmax(0,1fr))] gap-3 sm:gap-4"
            style={{ "--cat-count": produseCols } as React.CSSProperties}
          >
            {categories.map((cat) => {
              const Icon = categoryIcons[cat.slug];
              return (
                <Link
                  key={cat.id}
                  href={`/produse?cat=${cat.slug}`}
                  className="group flex flex-col items-center text-center gap-3"
                >
                  <div className="relative w-full aspect-square rounded-2xl overflow-hidden bg-secondary/25 flex items-center justify-center transition-transform duration-300 group-hover:-translate-y-1 group-hover:shadow-lg">
                    {cat.image ? (
                      <Image
                        src={cat.image}
                        alt={cat.name}
                        fill
                        sizes="(max-width: 640px) 45vw, 200px"
                        className="object-contain p-6"
                      />
                    ) : Icon ? (
                      <Icon className="w-1/2 h-1/2 text-primary" />
                    ) : (
                      <ImageOff className="w-8 h-8 text-muted-foreground" aria-hidden />
                    )}
                  </div>
                  <h3 className="text-sm sm:text-base font-bold text-foreground leading-snug line-clamp-2">
                    {cat.name}
                  </h3>
                </Link>
              );
            })}
          </div>
        )}

        {/* ── Grid: Mobilă (static) ─────────────────────────────────── */}
        {division === "mobila" && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
            {MOBILA_CATS.map((cat) => (
              <Link
                key={cat.id}
                href={cat.href}
                className="group flex flex-col items-center text-center gap-3"
              >
                <div className="relative w-full aspect-square rounded-2xl bg-secondary/25 flex items-center justify-center transition-transform duration-300 group-hover:-translate-y-1 group-hover:shadow-lg">
                  <cat.Icon className="w-1/2 h-1/2 text-primary" />
                </div>
                <h3 className="text-sm sm:text-base font-bold text-foreground leading-snug line-clamp-2">
                  {cat.name}
                </h3>
              </Link>
            ))}
          </div>
        )}

        {/* ── Grid: Chirie (static) ─────────────────────────────────── */}
        {division === "chirie" && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            {CHIRIE_CATS.map((cat) => (
              <Link
                key={cat.id}
                href={cat.href}
                className="group flex flex-col items-center text-center gap-3"
              >
                <div className="relative w-full aspect-square rounded-2xl bg-secondary/25 flex items-center justify-center transition-transform duration-300 group-hover:-translate-y-1 group-hover:shadow-lg">
                  <cat.Icon className="w-1/2 h-1/2 text-primary" />
                </div>
                <h3 className="text-sm sm:text-base font-bold text-foreground leading-snug line-clamp-2">
                  {cat.name}
                </h3>
              </Link>
            ))}
          </div>
        )}

      </div>
    </section>
  );
}
