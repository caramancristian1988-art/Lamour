import Link from "next/link";
import Image from "next/image";
import { Button } from "@/app/components/ui/button";
import { SITE_NAME } from "@/lib/constants";

interface Props {
  eyebrow: string;
  title: string;
  highlighted?: string;
  description: string;
  image: string;
  primaryCta: { label: string; href: string };
  secondaryCta?: { label: string; href: string };
  breadcrumbLabel: string;
}

export default function DivisionHero({
  eyebrow,
  title,
  highlighted,
  description,
  image,
  primaryCta,
  secondaryCta,
  breadcrumbLabel,
}: Props) {
  return (
    <section className="relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[300px] lg:min-h-[400px] items-center gap-8 py-8 lg:py-0">
          <div className="relative z-10 py-6 lg:py-10">
            <nav aria-label="Fir de ariadnă" className="flex items-center gap-1.5 text-xs sm:text-sm text-muted-foreground mb-5">
              <Link href="/" className="hover:text-accent transition-colors rounded">Acasă</Link>
              <span aria-hidden>›</span>
              <span className="text-foreground font-medium">{breadcrumbLabel}</span>
            </nav>

            <p className="text-accent text-xs font-bold tracking-widest uppercase mb-4">{eyebrow}</p>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight tracking-tight mb-4 text-primary">
              {title} {highlighted && <span className="text-accent">{highlighted}</span>}
            </h1>

            <p className="text-sm sm:text-base text-foreground/80 leading-relaxed mb-8 max-w-md">{description}</p>

            <div className="flex flex-wrap gap-3">
              <Button asChild variant="accent" size="lg">
                <Link href={primaryCta.href}>{primaryCta.label}</Link>
              </Button>
              {secondaryCta && (
                <Button asChild variant="outline" size="lg">
                  <Link href={secondaryCta.href}>{secondaryCta.label}</Link>
                </Button>
              )}
            </div>
          </div>

          <div className="relative w-full rounded-2xl overflow-hidden shadow-xl aspect-[4/3] lg:aspect-auto lg:h-[380px]">
            <Image
              src={image}
              alt={`${title} — ${SITE_NAME}`}
              fill
              className="object-cover object-center"
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
