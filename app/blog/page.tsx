import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Send } from "lucide-react";
import { getSectionFlags } from "@/lib/siteSettings";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/app/components/ui/badge";
import { SITE_NAME, SITE_SHORT_NAME } from "@/lib/constants";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Blog | Asociația Nevăzătorilor din Moldova",
  description:
    "Articole, ghiduri și noutăți din activitatea și comunitatea asociației.",
};

const FALLBACK_ARTICLE = {
  slug: "cum-alegi-conditionerul-potrivit",
  title: "Cum poți contribui la incluziunea persoanelor cu deficiențe de vedere",
  excerpt: "Câteva idei simple prin care comunitatea poate sprijini incluziunea persoanelor nevăzătoare.",
  category: "Ghiduri",
  date: "20 Mai 2026",
  readTime: "5 min citire",
  image: "https://placehold.co/800x600/D8B2B1/652F37?text=Articol",
};

async function getArticles() {
  try {
    const posts = await prisma.blogPost.findMany({
      where: { published: true },
      orderBy: { createdAt: "desc" },
      select: { slug: true, title: true, description: true, category: true, image: true, createdAt: true },
    });
    if (posts.length > 0) {
      return posts.map((p) => ({
        slug: p.slug,
        title: p.title,
        excerpt: p.description,
        category: p.category ?? "General",
        date: p.createdAt.toLocaleDateString("ro-MD", { day: "numeric", month: "long", year: "numeric" }),
        readTime: "5 min citire",
        image: p.image ?? "https://placehold.co/800x600/D8B2B1/652F37?text=Articol",
      }));
    }
  } catch {
    // fall through to static fallback
  }
  return [FALLBACK_ARTICLE];
}

const filterTabs = [
  { label: "Toate articolele", href: "/blog" },
  { label: "Ghiduri", href: "/blog/categorie/ghiduri" },
  { label: "Sfaturi", href: "/blog/categorie/sfaturi" },
  { label: "Noutăți", href: "/blog/categorie/noutati" },
  { label: "Comunitate", href: "/blog/categorie/comunitate" },
  { label: "Producție", href: "/blog/categorie/productie" },
];

export default async function BlogPage() {
  const [{ blogEnabled }, articles] = await Promise.all([getSectionFlags(), getArticles()]);
  if (!blogEnabled) notFound();

  return (
    <main className="bg-background">

        {/* ── HEADER SECTION ── */}

        {/* MOBILE hero (sm:hidden) */}
        <section className="sm:hidden relative h-[300px] overflow-hidden">
          <Image
            src="/noutati.png"
            alt=""
            fill
            className="object-cover object-center"
            priority
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background/90 from-10% via-background/55 via-40% to-transparent to-70% pointer-events-none" />
          <div className="absolute top-0 left-0 z-10 flex flex-col justify-start px-4 pt-4">
            <nav className="flex items-center gap-1 text-[10px] text-muted-foreground mb-3" aria-label="Fir de ariadnă">
              <Link href="/" className="hover:text-accent transition-colors">Acasă</Link>
              <span aria-hidden>›</span>
              <span className="text-foreground">Blog</span>
            </nav>
            <h1 className="text-2xl font-extrabold text-primary mb-2">Blog</h1>
            <p className="text-foreground/80 text-xs max-w-[180px] leading-relaxed">
              Articole, ghiduri și noutăți din activitatea și comunitatea asociației.
            </p>
          </div>
        </section>

        {/* DESKTOP hero (hidden sm:block) */}
        <section className="hidden sm:block relative bg-background overflow-hidden h-[340px] lg:h-[380px]">
          <div className="absolute inset-0 flex justify-end">
            <div className="w-[65%] h-full relative">
              <Image
                src="/noutati.png"
                alt=""
                fill
                className="object-cover object-center"
                priority
                sizes="65vw"
              />
            </div>
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-background from-25% via-background/60 via-40% to-transparent to-65% pointer-events-none" />
          <div className="absolute inset-0 flex flex-col justify-start pt-3 px-8 lg:px-12">
            <nav className="flex items-center gap-1.5 text-xs text-muted-foreground mb-4" aria-label="Fir de ariadnă">
              <Link href="/" className="hover:text-accent transition-colors">Acasă</Link>
              <span aria-hidden>›</span>
              <span className="text-foreground">Blog</span>
            </nav>
            <h1 className="text-4xl lg:text-5xl font-extrabold text-primary mb-4">Blog</h1>
            <p className="text-foreground/80 text-sm lg:text-[17px] max-w-xs lg:max-w-sm leading-relaxed">
              Articole, ghiduri și noutăți din activitatea și comunitatea asociației.
            </p>
          </div>
        </section>

        {/* ── FILTER TABS ── */}
        <section className="border-y border-border bg-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="flex items-center justify-between gap-4 py-3">
              {/* Tabs */}
              <div className="flex items-center gap-1 overflow-x-auto scroll-smooth" style={{scrollbarWidth:"none"}}>
                {filterTabs.map((tab, i) => (
                  <Link
                    key={tab.href}
                    href={tab.href}
                    className={`shrink-0 text-xs font-bold px-4 py-2 rounded-full transition-all ${
                      i === 0
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    {tab.label}
                  </Link>
                ))}
              </div>
              {/* Sort dropdown */}
              <div className="hidden sm:flex items-center shrink-0">
                <label htmlFor="blog-sort" className="sr-only">Sortează articolele</label>
                <select
                  id="blog-sort"
                  className="text-xs font-semibold text-foreground border border-border rounded-lg px-3 py-2 focus-visible:outline-none bg-card"
                >
                  <option>Cele mai noi</option>
                  <option>Cele mai vechi</option>
                  <option>Populare</option>
                </select>
              </div>
            </div>
          </div>
        </section>

        {/* ── ARTICLES GRID ── */}
        <section className="bg-background py-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {articles.map((article) => (
                <Link
                  key={article.slug}
                  href={`/blog/${article.slug}`}
                  className="group flex flex-col rounded-2xl border border-border overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 bg-card"
                >
                  {/* Image */}
                  <div className="relative h-52 overflow-hidden">
                    <Image
                      src={article.image}
                      alt={article.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                    {/* Category badge on image */}
                    <Badge variant="accent" className="absolute bottom-3 left-3 shadow-sm">
                      {article.category}
                    </Badge>
                  </div>

                  {/* Content */}
                  <div className="flex flex-col flex-1 p-5">
                    <h2 className="text-sm font-bold text-primary leading-snug mb-2 line-clamp-2 group-hover:text-accent transition-colors">
                      {article.title}
                    </h2>
                    <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2 flex-1 mb-4">
                      {article.excerpt}
                    </p>
                    {/* Footer meta */}
                    <div className="flex items-center gap-2 pt-3 border-t border-border">
                      <span className="text-[11px] font-semibold text-muted-foreground">{SITE_SHORT_NAME}</span>
                      <span className="text-border">·</span>
                      <span className="text-[11px] text-muted-foreground">{article.date}</span>
                      <span className="text-border">·</span>
                      <span className="text-[11px] text-muted-foreground">{article.readTime}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ── NEWSLETTER ── */}
        <section className="bg-muted border-t border-border py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="text-center sm:text-left">
                <h2 className="text-xl sm:text-2xl font-extrabold text-primary mb-1">
                  Rămâi la curent cu noutățile {SITE_NAME}
                </h2>
                <p className="text-sm text-muted-foreground">
                  Abonează-te și primești cele mai utile informații direct pe email.
                </p>
              </div>
              <form className="flex gap-0 rounded-xl overflow-hidden border border-border shrink-0 w-full sm:w-auto shadow-sm">
                <label htmlFor="blog-newsletter-email" className="sr-only">Emailul tău</label>
                <input
                  id="blog-newsletter-email"
                  type="email"
                  placeholder="Emailul tău"
                  className="h-12 px-5 text-sm text-foreground placeholder-muted-foreground bg-card focus-visible:outline-none w-full sm:w-64"
                />
                <button
                  type="submit"
                  className="h-12 px-6 bg-accent hover:bg-brand-red-dark text-accent-foreground text-xs font-bold uppercase tracking-wide flex items-center gap-2 transition-colors shrink-0"
                >
                  Abonează-te
                  <Send className="w-3.5 h-3.5" aria-hidden />
                </button>
              </form>
            </div>
          </div>
        </section>

    </main>
  );
}
