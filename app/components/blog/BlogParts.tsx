import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CalendarDays, Clock, Mail } from "lucide-react";
import NewsletterForm from "@/app/components/NewsletterForm";
import { BLOG_CATEGORIES } from "@/lib/blog";
import { MotifRosette } from "@/app/components/ui/motif";

export interface BlogCardData {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  date: string;
  readTime: string;
  image: string;
}

// Antet de pagină: bandă vișinie cu modelul discret al site-ului (ca bara de sus / subsolul), rozete în colțuri,
// firimituri de pan, titlu serif mare și o linie roz „brodată" la bază.
export function BlogHeader({
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

// Categoriile ca „pastile": cea curentă e plină, celelalte au contur; pe telefon se derulează orizontal.
export function BlogTabs({ active }: { active: string }) {
  const tabs = [{ label: "Toate articolele", slug: "toate", href: "/blog" }, ...BLOG_CATEGORIES.map((c) => ({ ...c, href: `/blog/categorie/${c.slug}` }))];
  return (
    <nav aria-label="Categorii de articole" className="border-b border-border bg-card/80 backdrop-blur">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <ul className="flex items-center gap-2 overflow-x-auto py-3.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {tabs.map((t) => {
            const isActive = t.slug === active;
            return (
              <li key={t.slug} className="shrink-0">
                <Link
                  href={t.href}
                  aria-current={isActive ? "page" : undefined}
                  className={`inline-flex h-10 items-center rounded-full px-5 text-sm font-bold transition-colors ${
                    isActive
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "border border-brand-rose bg-card text-foreground hover:border-accent hover:text-accent"
                  }`}
                >
                  {t.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}

function Meta({ date, readTime }: { date: string; readTime: string }) {
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
      <span className="flex items-center gap-1.5">
        <CalendarDays className="h-3.5 w-3.5 text-accent" aria-hidden />
        {date}
      </span>
      <span className="flex items-center gap-1.5">
        <Clock className="h-3.5 w-3.5 text-accent" aria-hidden />
        {readTime}
      </span>
    </div>
  );
}

// Articolul principal: mare, imaginea lângă text (pe telefon, deasupra).
export function FeaturedCard({ post }: { post: BlogCardData }) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group grid overflow-hidden rounded-3xl border border-brand-rose/60 bg-card shadow-sm transition-shadow duration-300 hover:shadow-md md:grid-cols-[1.15fr_1fr]"
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-muted md:aspect-auto md:min-h-[22rem]">
        <Image
          src={post.image}
          alt=""
          fill
          priority
          sizes="(max-width: 768px) 100vw, 60vw"
          className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
        />
        <span className="absolute left-4 top-4 rounded-full bg-accent px-3.5 py-1.5 text-xs font-bold uppercase tracking-wide text-accent-foreground shadow-md">
          {post.category}
        </span>
      </div>
      <div className="flex flex-col justify-center gap-4 p-6 sm:p-8 lg:p-10">
        <span className="text-xs font-bold uppercase tracking-widest text-accent">Cel mai recent articol</span>
        <h2 className="font-serif text-2xl font-bold leading-tight text-primary transition-colors group-hover:text-accent sm:text-3xl">
          {post.title}
        </h2>
        <p className="line-clamp-4 text-base leading-relaxed text-foreground/75">{post.excerpt}</p>
        <Meta date={post.date} readTime={post.readTime} />
        <span className="mt-1 inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-accent">
          Citește articolul
          <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" aria-hidden />
        </span>
      </div>
    </Link>
  );
}

export function BlogCard({ post }: { post: BlogCardData }) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-brand-rose/60 bg-card shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-muted">
        <Image
          src={post.image}
          alt=""
          fill
          loading="lazy"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
        />
        <span className="absolute left-3 top-3 rounded-full bg-accent px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-accent-foreground shadow-sm">
          {post.category}
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-3 p-5">
        <Meta date={post.date} readTime={post.readTime} />
        <h2 className="font-serif text-xl font-bold leading-snug text-primary transition-colors group-hover:text-accent line-clamp-2">
          {post.title}
        </h2>
        <p className="line-clamp-3 flex-1 text-sm leading-relaxed text-foreground/70">{post.excerpt}</p>
        <span className="inline-flex items-center gap-1.5 text-sm font-bold text-accent">
          Citește articolul
          <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" aria-hidden />
        </span>
      </div>
    </Link>
  );
}

// Abonare la noutăți: card vișiniu cu model, același formular funcțional ca în subsol (înainte pagina de blog avea un formular fals).
export function BlogNewsletter() {
  return (
    <section className="px-4 pb-14 pt-4 sm:px-6">
      <div className="relative mx-auto max-w-4xl overflow-hidden rounded-3xl bg-gradient-to-br from-brand-maroon-dark via-brand-maroon to-brand-maroon-dark px-6 py-10 text-center text-white shadow-lg sm:px-12 sm:py-12">
        <div aria-hidden className="pointer-events-none absolute inset-0 bg-footer-pattern opacity-[0.08]" />
        <MotifRosette className="pointer-events-none absolute -right-14 -top-14 h-52 w-52 opacity-[0.14]" />
        <div className="relative mx-auto max-w-md">
          <span className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 ring-1 ring-white/25">
            <Mail className="h-6 w-6 text-brand-rose-light" aria-hidden />
          </span>
          <h2 className="font-serif text-2xl font-bold italic sm:text-3xl">Rămâi la curent cu noutățile</h2>
          <p className="mb-6 mt-2 text-sm leading-relaxed text-white/80 sm:text-base">
            Primești ghiduri, noutăți și povești din comunitatea noastră direct pe email.
          </p>
          <NewsletterForm />
        </div>
      </div>
    </section>
  );
}
