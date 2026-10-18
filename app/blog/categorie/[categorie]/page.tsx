import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getSectionFlags } from "@/lib/siteSettings";
import { prisma } from "@/lib/prisma";
import { SITE_NAME } from "@/lib/constants";
import JsonLd from "@/app/components/JsonLd";
import { breadcrumbList, collectionPage } from "@/lib/structuredData";
import { absoluteUrl } from "@/lib/seo";
import { BLOG_CATEGORIES, BLOG_FALLBACK_IMAGE, formatBlogDate, readingTime } from "@/lib/blog";
import { BlogHeader, BlogTabs, BlogCard, BlogNewsletter } from "@/app/components/blog/BlogParts";

export const revalidate = 86400;

const categoryNames: Record<string, string> = Object.fromEntries(BLOG_CATEGORIES.map((c) => [c.slug, c.label]));

export function generateStaticParams() {
  return Object.keys(categoryNames).map((categorie) => ({ categorie }));
}

export async function generateMetadata({ params }: { params: Promise<{ categorie: string }> }): Promise<Metadata> {
  const { categorie } = await params;
  if (!categoryNames[categorie]) return { robots: { index: false, follow: true } };
  const name = categoryNames[categorie];
  const title = `${name} | Blog ${SITE_NAME}`;
  const canonical = absoluteUrl(`/blog/categorie/${categorie}`);
  return {
    title: { absolute: title },
    alternates: { canonical },
    openGraph: { title, url: canonical },
    twitter: { title },
  };
}

export default async function CategoriePage({ params }: { params: Promise<{ categorie: string }> }) {
  const { blogEnabled } = await getSectionFlags();
  if (!blogEnabled) notFound();

  const { categorie } = await params;
  const categoryName = categoryNames[categorie] ?? categorie;

  const posts = await prisma.blogPost.findMany({
    where: { published: true, category: categoryName },
    orderBy: { createdAt: "desc" },
  });

  return (
    <main className="page-motif">
      <JsonLd
        data={breadcrumbList([
          { name: "Acasă", path: "/" },
          { name: "Blog", path: "/blog" },
          { name: categoryName, path: `/blog/categorie/${categorie}` },
        ])}
      />
      <JsonLd
        data={collectionPage({
          name: `${categoryName} | Blog ${SITE_NAME}`,
          url: `/blog/categorie/${categorie}`,
          items: posts.map((p) => ({ name: p.title, url: `/blog/${p.slug}`, image: p.image })),
        })}
      />

      <BlogHeader
        title={categoryName}
        description={`${posts.length} articol${posts.length !== 1 ? "e" : ""} în această categorie.`}
        crumbs={[{ label: "Acasă", href: "/" }, { label: "Blog", href: "/blog" }, { label: categoryName }]}
      />
      <BlogTabs active={categorie} />

      <section className="py-10 sm:py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          {posts.length === 0 ? (
            <div className="mx-auto max-w-md rounded-3xl border border-brand-rose/60 bg-card px-6 py-14 text-center shadow-sm">
              <p className="font-serif text-xl font-bold text-primary">Nu există articole în această categorie încă.</p>
              <p className="mt-2 text-sm text-muted-foreground">Revino curând sau citește articolele din alte categorii.</p>
              <Link
                href="/blog"
                className="mt-6 inline-flex h-11 items-center gap-2 rounded-full bg-accent px-6 text-sm font-bold uppercase tracking-wide text-accent-foreground shadow-md transition-colors hover:bg-brand-red-dark"
              >
                <ArrowLeft className="h-4 w-4" aria-hidden />
                Toate articolele
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {posts.map((p) => (
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
          )}
        </div>
      </section>

      <BlogNewsletter />
    </main>
  );
}
