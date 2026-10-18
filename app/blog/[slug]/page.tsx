import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, CalendarDays, Clock } from "lucide-react";
import { getSectionFlags } from "@/lib/siteSettings";
import { prisma } from "@/lib/prisma";
import { SITE_NAME } from "@/lib/constants";
import JsonLd from "@/app/components/JsonLd";
import { Logo } from "@/app/components/Logo";
import { breadcrumbList, articleSchema } from "@/lib/structuredData";
import { absoluteUrl } from "@/lib/seo";
import { ARTICLE_VIDEOS, BLOG_CATEGORIES, BLOG_FALLBACK_IMAGE, formatBlogDate, readingTime } from "@/lib/blog";
import FacebookVideo from "@/app/components/FacebookVideo";
import ProductsSection from "@/app/components/ProductsSection";
import { getRecommendedProducts } from "@/lib/recommendedProducts";
import { BlogCard, BlogNewsletter } from "@/app/components/blog/BlogParts";
import { HeadingFlourish } from "@/app/components/ui/motif";

export const revalidate = 86400;

export async function generateStaticParams() {
  try {
    const posts = await prisma.blogPost.findMany({ where: { published: true }, select: { slug: true } });
    return posts.map((p) => ({ slug: p.slug }));
  } catch {
    return [];
  }
}

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

  const [relatedPosts, recentPosts, recommendedProducts] = await Promise.all([
    post.category
      ? prisma.blogPost.findMany({
          where: { published: true, category: post.category, slug: { not: slug } },
          orderBy: { createdAt: "desc" },
          take: 3,
        })
      : Promise.resolve([]),
    prisma.blogPost.findMany({
      where: { published: true, slug: { not: slug } },
      orderBy: { createdAt: "desc" },
      take: 3,
    }),
    getRecommendedProducts(),
  ]);
  // „Citește și": întâi din aceeași categorie, completat cu cele mai recente
  const more = [...relatedPosts, ...recentPosts.filter((r) => !relatedPosts.some((x) => x.slug === r.slug))].slice(0, 3);

  const categorySlug = BLOG_CATEGORIES.find((c) => c.label === post.category)?.slug;
  const article = {
    title: post.title,
    category: post.category ?? "General",
    date: formatBlogDate(post.createdAt),
    author: `Echipa ${SITE_NAME}`,
    readTime: readingTime(post.content),
  };

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

      <main className="page-motif">
        {/* Fără banner: articolul începe direct cu titlul. */}
        <header className="mx-auto max-w-3xl px-4 pb-8 pt-8 sm:px-6 sm:pt-12">
          <nav className="mb-6 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground" aria-label="Fir de ariadnă">
            <Link href="/" className="rounded transition-colors hover:text-accent">Acasă</Link>
            <span aria-hidden>›</span>
            <Link href="/blog" className="rounded transition-colors hover:text-accent">Blog</Link>
            {categorySlug && (
              <>
                <span aria-hidden>›</span>
                <Link href={`/blog/categorie/${categorySlug}`} className="rounded transition-colors hover:text-accent">{article.category}</Link>
              </>
            )}
          </nav>

          <Link
            href={categorySlug ? `/blog/categorie/${categorySlug}` : "/blog"}
            className="inline-flex rounded-full bg-accent px-4 py-1.5 text-xs font-bold uppercase tracking-wide text-accent-foreground shadow-sm transition-colors hover:bg-brand-red-dark"
          >
            {article.category}
          </Link>

          <h1 className="mt-4 text-balance font-serif text-3xl font-bold leading-tight text-primary sm:text-4xl lg:text-5xl">
            {article.title}
          </h1>

          <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 border-y border-brand-rose/60 py-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-2.5 font-semibold text-foreground">
              <Logo size={36} className="border border-logo-silver" />
              {article.author}
            </span>
            <span className="flex items-center gap-1.5">
              <CalendarDays className="h-4 w-4 text-accent" aria-hidden />
              {article.date}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="h-4 w-4 text-accent" aria-hidden />
              {article.readTime}
            </span>
          </div>
        </header>

        <article className="mx-auto max-w-3xl px-4 pb-12 sm:px-6">
          <div className="rounded-3xl border border-brand-rose/50 bg-card p-6 shadow-sm sm:p-10">
            <p className="mb-8 border-l-4 border-accent pl-5 font-serif text-lg italic leading-relaxed text-foreground/80 sm:text-xl">
              {post.description}
            </p>
            {ARTICLE_VIDEOS[slug] && (
              <figure className="mb-10 overflow-hidden rounded-2xl border border-brand-rose/60 shadow-md">
                <FacebookVideo
                  videoUrl={ARTICLE_VIDEOS[slug].url}
                  poster={ARTICLE_VIDEOS[slug].poster}
                  title={ARTICLE_VIDEOS[slug].title}
                  className="aspect-video w-full"
                />
                <figcaption className="flex items-start gap-2 bg-card px-5 py-3 text-sm text-muted-foreground">
                  <span className="font-bold text-primary">Video:</span>
                  {ARTICLE_VIDEOS[slug].title}
                </figcaption>
              </figure>
            )}
            {post.content && <div className="blog-content" dangerouslySetInnerHTML={{ __html: post.content }} />}
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
            <Link href="/blog" className="inline-flex items-center gap-2 text-sm font-bold text-accent hover:underline">
              <ArrowLeft className="h-4 w-4" aria-hidden />
              Toate articolele
            </Link>
            <Link
              href="/contact"
              className="inline-flex h-11 items-center gap-2 rounded-full bg-accent px-6 text-sm font-bold uppercase tracking-wide text-accent-foreground shadow-md transition-colors hover:bg-brand-red-dark"
            >
              Contactează-ne
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </div>
        </article>

        {more.length > 0 && (
          <section className="pb-12 pt-4" aria-labelledby="citeste-si">
            <div className="mx-auto max-w-7xl px-4 sm:px-6">
              <div className="mb-6 flex items-center gap-4">
                <h2 id="citeste-si" className="font-serif text-2xl font-bold uppercase tracking-tight text-primary sm:text-3xl">
                  Citește <span className="text-accent">și</span>
                </h2>
                <HeadingFlourish />
                <span aria-hidden className="h-px flex-1 bg-gradient-to-r from-brand-rose to-brand-rose/10" />
              </div>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {more.map((p) => (
                  <BlogCard
                    key={p.slug}
                    post={{
                      slug: p.slug,
                      title: p.title,
                      excerpt: p.description,
                      category: p.category ?? "General",
                      date: formatBlogDate(p.createdAt),
                      readTime: readingTime(p.content),
                      image: p.image ?? BLOG_FALLBACK_IMAGE,
                    }}
                  />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Produse recomandate (toate cele bifate în admin) */}
        <ProductsSection products={recommendedProducts} viewAllHref="/produse" />

        <BlogNewsletter />
      </main>
    </>
  );
}
