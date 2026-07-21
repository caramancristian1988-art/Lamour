import Image from "next/image";
import Link from "next/link";
import NewsletterForm from "@/app/components/NewsletterForm";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArrowRight, CalendarDays, Clock, Mail, Phone, Search, User } from "lucide-react";
import { getSectionFlags } from "@/lib/siteSettings";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/app/components/ui/badge";
import { SITE_NAME } from "@/lib/constants";
import JsonLd from "@/app/components/JsonLd";
import { breadcrumbList, articleSchema } from "@/lib/structuredData";
import { absoluteUrl } from "@/lib/seo";

export const revalidate = 3600;

const FALLBACK_IMAGE = "https://placehold.co/800x600/D8B2B1/652F37?text=Articol";

const BLOG_CATEGORIES: { label: string; slug: string }[] = [
  { label: "Ghiduri", slug: "ghiduri" },
  { label: "Sfaturi", slug: "sfaturi" },
  { label: "Noutăți", slug: "noutati" },
  { label: "Comunitate", slug: "comunitate" },
  { label: "Producție", slug: "productie" },
];

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = await prisma.blogPost.findFirst({ where: { slug, published: true }, select: { title: true, description: true, image: true } });
  if (!post) return { robots: { index: false, follow: true } };
  const title = `${post.title} | Blog ${SITE_NAME}`;
  const canonical = absoluteUrl(`/blog/${slug}`);
  return {
    title: { absolute: title },
    description: post.description,
    alternates: { canonical },
    openGraph: {
      title,
      description: post.description,
      url: canonical,
      ...(post.image ? { images: [{ url: post.image, alt: post.title }] } : {}),
    },
    twitter: {
      title,
      description: post.description,
      ...(post.image ? { images: [post.image] } : {}),
    },
  };
}

export default async function BlogArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const [{ blogEnabled }, { slug }] = await Promise.all([getSectionFlags(), params]);
  if (!blogEnabled) notFound();

  const post = await prisma.blogPost.findFirst({ where: { slug, published: true } });
  if (!post) notFound();

  const [recentPosts, relatedPosts, categoryCounts] = await Promise.all([
    prisma.blogPost.findMany({
      where: { published: true, slug: { not: slug } },
      orderBy: { createdAt: "desc" },
      take: 3,
      select: { title: true, slug: true, image: true },
    }),
    post.category
      ? prisma.blogPost.findMany({
          where: { published: true, category: post.category, slug: { not: slug } },
          orderBy: { createdAt: "desc" },
          take: 3,
          select: { title: true, slug: true, image: true, category: true, createdAt: true },
        })
      : Promise.resolve([]),
    Promise.all(BLOG_CATEGORIES.map((c) => prisma.blogPost.count({ where: { published: true, category: c.label } }))),
  ]);

  const article = {
    title: post.title,
    category: post.category ?? "General",
    date: post.createdAt.toLocaleDateString("ro-MD", { day: "numeric", month: "long", year: "numeric" }),
    author: `Echipa ${SITE_NAME}`,
    readTime: "5 min citire",
    image: post.image ?? FALLBACK_IMAGE,
  };

  const categories = BLOG_CATEGORIES.map((c, i) => ({ ...c, count: categoryCounts[i] }));

  return (
    <>
      <JsonLd
        data={articleSchema({
          headline: article.title,
          description: post.description,
          image: post.image,
          datePublished: post.createdAt.toISOString(),
          url: `/blog/${slug}`,
          authorName: article.author,
        })}
      />
      <JsonLd
        data={breadcrumbList([
          { name: "Acasă", path: "/" },
          { name: "Blog", path: "/blog" },
          { name: article.title, path: `/blog/${slug}` },
        ])}
      />

      <main>
        {/* ── HERO ── */}
        <section className="relative h-[320px] sm:h-[420px] lg:h-[500px] overflow-hidden">
          <Image
            src={article.image}
            alt=""
            fill
            className="object-cover object-center"
            priority
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/10" />

          <div className="absolute inset-0 flex flex-col justify-end max-w-7xl mx-auto px-4 sm:px-6 pb-8 sm:pb-12">
            <nav className="flex items-center gap-1.5 text-white/60 text-xs mb-4" aria-label="Fir de ariadnă">
              <Link href="/" className="hover:text-white transition-colors">Acasă</Link>
              <span aria-hidden>/</span>
              <Link href="/blog" className="hover:text-white transition-colors">Blog</Link>
              <span aria-hidden>/</span>
              <span className="text-white/80 line-clamp-1">{article.title}</span>
            </nav>

            <Badge variant="accent" className="self-start mb-3">{article.category}</Badge>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white leading-tight mb-4 max-w-3xl">
              {article.title}
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-white/70 text-xs sm:text-sm">
              <span className="flex items-center gap-1.5">
                <User className="w-4 h-4" aria-hidden />
                {article.author}
              </span>
              <span className="flex items-center gap-1.5">
                <CalendarDays className="w-4 h-4" aria-hidden />
                {article.date}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4" aria-hidden />
                {article.readTime}
              </span>
            </div>
          </div>
        </section>

        {/* ── CONTENT + SIDEBAR ── */}
        <section className="bg-muted py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-10">

              <article className="bg-card rounded-2xl shadow-sm p-6 sm:p-10">
                <p className="text-base sm:text-lg text-foreground/80 leading-relaxed mb-8 font-medium border-l-4 border-accent pl-5">
                  {post.description}
                </p>
                {post.content && (
                  <div
                    className="prose prose-sm sm:prose max-w-none text-foreground/80 leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: post.content }}
                  />
                )}
              </article>

              {/* Sidebar */}
              <aside className="flex flex-col gap-6">

                {/* Search */}
                <div className="bg-card rounded-2xl shadow-sm p-5">
                  <h3 className="text-sm font-extrabold text-primary uppercase tracking-wider mb-3">Caută articole</h3>
                  <div className="relative">
                    <label htmlFor="blog-article-search" className="sr-only">Caută în blog</label>
                    <input
                      id="blog-article-search"
                      type="text"
                      placeholder="Caută în blog..."
                      className="w-full h-10 pl-4 pr-10 rounded-lg border border-border text-sm text-foreground placeholder-muted-foreground focus-visible:outline-none transition-colors"
                    />
                    <button aria-label="Caută" className="absolute right-0 top-0 h-10 w-10 flex items-center justify-center bg-accent rounded-r-lg text-accent-foreground">
                      <Search className="w-4 h-4" aria-hidden />
                    </button>
                  </div>
                </div>

                {/* Categories */}
                <div className="bg-card rounded-2xl shadow-sm p-5">
                  <h3 className="text-sm font-extrabold text-primary uppercase tracking-wider mb-4">Categorii</h3>
                  <ul className="flex flex-col gap-2">
                    {categories.map((cat) => (
                      <li key={cat.slug}>
                        <Link
                          href={`/blog/categorie/${cat.slug}`}
                          className="flex items-center justify-between text-sm text-foreground/80 hover:text-accent transition-colors group py-1.5 border-b border-border"
                        >
                          <span className="flex items-center gap-2">
                            <ArrowRight className="w-3 h-3 text-accent opacity-0 group-hover:opacity-100 transition-opacity" aria-hidden />
                            {cat.label}
                          </span>
                          <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full">{cat.count}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Recent articles */}
                {recentPosts.length > 0 && (
                  <div className="bg-card rounded-2xl shadow-sm p-5">
                    <h3 className="text-sm font-extrabold text-primary uppercase tracking-wider mb-4">Articole recente</h3>
                    <div className="flex flex-col gap-4">
                      {recentPosts.map((a) => (
                        <Link key={a.slug} href={`/blog/${a.slug}`} className="flex gap-3 group">
                          <div className="relative w-16 h-16 rounded-lg overflow-hidden shrink-0">
                            <Image
                              src={a.image ?? FALLBACK_IMAGE}
                              alt=""
                              fill
                              className="object-cover group-hover:scale-105 transition-transform duration-300"
                              loading="lazy"
                              sizes="64px"
                            />
                          </div>
                          <p className="text-xs font-semibold text-primary leading-snug group-hover:text-accent transition-colors line-clamp-2">
                            {a.title}
                          </p>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* Contact button */}
                <Link
                  href="/contact"
                  className="flex items-center justify-center gap-2 bg-primary hover:bg-brand-maroon-dark text-primary-foreground font-bold px-5 py-4 rounded-2xl transition-all text-sm uppercase tracking-wide shadow-sm"
                >
                  <Phone className="w-5 h-5" aria-hidden />
                  Contactează-ne
                </Link>

                {/* Promo banner */}
                <div className="bg-primary rounded-2xl p-5 text-primary-foreground relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-accent/20 rounded-full -translate-y-8 translate-x-8" />
                  <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/5 rounded-full translate-y-6 -translate-x-6" />
                  <p className="text-[10px] font-bold text-primary-foreground/60 uppercase tracking-widest mb-2">{SITE_NAME}</p>
                  <h4 className="text-base font-extrabold mb-2 leading-snug">Alătură-te comunității noastre</h4>
                  <p className="text-xs text-primary-foreground/70 mb-4 leading-relaxed">Voluntariat, donații și proiecte în care te poți implica oricând.</p>
                  <Link
                    href="/despre"
                    className="inline-flex items-center gap-1.5 bg-accent hover:bg-brand-red-dark text-accent-foreground text-xs font-bold px-4 py-2 rounded-lg transition-colors"
                  >
                    Află mai multe
                    <ArrowRight className="w-3.5 h-3.5" aria-hidden />
                  </Link>
                </div>

              </aside>
            </div>
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="bg-primary py-14">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
            <p className="text-[10px] font-bold text-primary-foreground/50 uppercase tracking-widest mb-3">Alătură-te cauzei</p>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-primary-foreground mb-4 max-w-2xl mx-auto leading-tight">
              Vrei să te implici sau ai o întrebare pentru noi?
            </h2>
            <p className="text-primary-foreground/70 text-sm sm:text-base mb-8 max-w-lg mx-auto leading-relaxed">
              Echipa noastră este disponibilă în toată Moldova. Răspuns rapid și deschidere la orice colaborare.
            </p>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 bg-accent hover:bg-brand-red-dark text-accent-foreground font-bold px-8 py-4 rounded-xl transition-all text-sm uppercase tracking-wide shadow-lg hover:-translate-y-0.5"
            >
              Contactează-ne
              <ArrowRight className="w-4 h-4" aria-hidden />
            </Link>
          </div>
        </section>

        {/* ── RELATED ARTICLES ── */}
        {relatedPosts.length > 0 && (
          <section className="bg-muted py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6">
              <h2 className="text-xl font-extrabold text-primary uppercase tracking-wide mb-8">
                Articole <span className="text-accent">similare</span>
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {relatedPosts.map((a) => (
                  <Link key={a.slug} href={`/blog/${a.slug}`} className="group bg-card rounded-2xl shadow-sm overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                    <div className="relative h-48 overflow-hidden">
                      <Image
                        src={a.image ?? FALLBACK_IMAGE}
                        alt={a.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                    </div>
                    <div className="p-5">
                      <span className="text-[10px] font-bold text-accent uppercase tracking-wide">{a.category}</span>
                      <h3 className="text-sm font-bold text-primary mt-1.5 mb-2 leading-snug group-hover:text-accent transition-colors line-clamp-2">
                        {a.title}
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        {a.createdAt.toLocaleDateString("ro-MD", { day: "numeric", month: "long", year: "numeric" })}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ── NEWSLETTER ── */}
        <section className="bg-background border-t border-border py-12">
          <div className="max-w-xl mx-auto px-4 text-center">
            <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="w-6 h-6 text-accent" aria-hidden />
            </div>
            <h2 className="text-xl font-extrabold text-primary mb-2">
              Abonează-te la noutăți
            </h2>
            <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
              Primești ghiduri, noutăți și povești din comunitatea noastră direct pe email.
            </p>
            <div className="bg-primary rounded-2xl p-1">
              <NewsletterForm />
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
