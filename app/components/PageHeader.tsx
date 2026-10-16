import Link from "next/link";
import { MotifRosette } from "@/app/components/ui/motif";

// Antet de pagină: bandă vișinie cu modelul discret al site-ului (ca bara de sus / subsolul), rozete în colțuri,
// firimituri de pan, titlu serif mare și o linie roz „brodată" la bază.
export function PageHeader({
  title,
  description,
  crumbs,
}: {
  title: string;
  description?: string;
  crumbs: { label: string; href?: string }[];
}) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-brand-maroon-dark via-brand-maroon to-brand-maroon-dark text-white">
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-footer-pattern opacity-[0.08]" />
      <MotifRosette className="pointer-events-none absolute -right-16 -top-20 h-72 w-72 opacity-[0.14] sm:h-96 sm:w-96" />
      <MotifRosette className="pointer-events-none absolute -bottom-24 -left-20 hidden h-72 w-72 opacity-[0.1] sm:block" />

      <div className="relative mx-auto max-w-7xl px-4 pb-10 pt-6 sm:px-6 sm:pb-14 sm:pt-8">
        <nav className="mb-5 flex flex-wrap items-center gap-1.5 text-xs text-white/70" aria-label="Fir de ariadnă">
          {crumbs.map((c, i) => (
            <span key={c.label} className="flex items-center gap-1.5">
              {i > 0 && <span aria-hidden>›</span>}
              {c.href ? (
                <Link href={c.href} className="rounded transition-colors hover:text-white">
                  {c.label}
                </Link>
              ) : (
                <span className="font-semibold text-white">{c.label}</span>
              )}
            </span>
          ))}
        </nav>
        <h1 className="font-serif text-4xl font-bold italic tracking-tight text-white sm:text-5xl lg:text-6xl">{title}</h1>
        {description && <p className="mt-3 max-w-xl text-base leading-relaxed text-white/80 sm:text-lg">{description}</p>}
      </div>
      <div aria-hidden className="h-px bg-gradient-to-r from-transparent via-brand-rose/70 to-transparent" />
    </section>
  );
}
