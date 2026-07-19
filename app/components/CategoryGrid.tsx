import Link from "next/link";
import Image from "next/image";
import { ImageOff } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { categoryIcons } from "./CategoryIcons";
import { MotifBackground, HeadingFlourish } from "@/app/components/ui/motif";

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
}

interface Props {
  categories: Category[];
}

export default function CategoryGrid({ categories }: Props) {
  return (
    <section className="relative overflow-hidden py-12 sm:py-16 bg-background">
      <MotifBackground />
      <div className="relative max-w-7xl mx-auto px-4">
        {/* ── Division links ────────────────────────────────────────── */}
        <div className="flex flex-wrap gap-2 mb-6">
          {[
            { label: "Produse de uz casnic", href: "/produse" },
            { label: "Mobilă",               href: "/mobila" },
            { label: "Chirie",               href: "/spatii-comerciale" },
          ].map((d) => (
            <Link
              key={d.href}
              href={d.href}
              className="px-4 py-1.5 rounded-full text-sm font-bold border border-primary/40 text-primary hover:bg-primary hover:text-white hover:border-primary transition-colors"
            >
              {d.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-4 mb-10 flex-wrap">
          <h2 className="text-2xl sm:text-3xl font-bold text-primary tracking-tight uppercase shrink-0">
            Categorii populare
          </h2>
          <div className="flex items-center gap-3 flex-1 min-w-[60px]">
            <HeadingFlourish />
            <span className="h-px flex-1 bg-gradient-to-r from-brand-rose to-transparent" />
          </div>
          <Button asChild variant="accent" size="sm" className="shrink-0">
            <Link href="/produse">Vezi toate categoriile</Link>
          </Button>
        </div>

        <div
          className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-[repeat(var(--cat-count),minmax(0,1fr))] gap-3 sm:gap-4"
          style={{ "--cat-count": categories.length } as React.CSSProperties}
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
      </div>
    </section>
  );
}
