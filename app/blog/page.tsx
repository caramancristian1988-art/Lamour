import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getSectionFlags } from "@/lib/siteSettings";
import { prisma } from "@/lib/prisma";
import { SITE_NAME } from "@/lib/constants";
import { BLOG_FALLBACK_IMAGE, formatBlogDate, readingTime } from "@/lib/blog";
import { BlogHeader, BlogTabs, BlogCard, FeaturedCard, BlogNewsletter, type BlogCardData } from "@/app/components/blog/BlogParts";
import JsonLd from "@/app/components/JsonLd";
import { breadcrumbList, collectionPage } from "@/lib/structuredData";
import { absoluteUrl } from "@/lib/seo";

export const revalidate = 3600;

const BLOG_TITLE = `Blog | ${SITE_NAME}`;
const BLOG_DESCRIPTION = `Articole, ghiduri și noutăți din activitatea ${SITE_NAME}.`;

export const metadata: Metadata = {
  title: { absolute: BLOG_TITLE },
  description: BLOG_DESCRIPTION,
  alternates: { canonical: absoluteUrl("/blog") },
  openGraph: {
    title: BLOG_TITLE,
    description: BLOG_DESCRIPTION,
    url: absoluteUrl("/blog"),
  },
  twitter: {
    title: BLOG_TITLE,
    description: BLOG_DESCRIPTION,
  },
};

const FALLBACK_ARTICLE: BlogCardData = {
  slug: "cum-poti-contribui-la-incluziunea-persoanelor-nevazatoare",
  title: "Cum poți contribui la incluziunea persoanelor cu deficiențe de vedere",
  excerpt: "Câteva idei simple prin care comunitatea poate sprijini incluziunea persoanelor nevăzătoare.",
  category: "Comunitate",
  date: "20 Mai 2026",
  readTime: "5 min citire",
  image: BLOG_FALLBACK_IMAGE,
};

async function getArticles(): Promise<BlogCardData[]> {
  try {
    const posts = await prisma.blogPost.findMany({
      where: { published: true },
      orderBy: { createdAt: "desc" },
      select: { slug: true, title: true, description: true, category: true, image: true, createdAt: true, content: true },
    });
    if (posts.length > 0) {
      return posts.map((p) => ({
        slug: p.slug,
        title: p.title,
        excerpt: p.description,
        category: p.category ?? "General",
        date: formatBlogDate(p.createdAt),
        readTime: readingTime(p.content),
        image: p.image ?? BLOG_FALLBACK_IMAGE,
      }));
    }
  } catch {
    // fall through to static fallback
  }
  return [FALLBACK_ARTICLE];
}

export default async function BlogPage() {
  const [{ blogEnabled }, articles] = await Promise.all([getSectionFlags(), getArticles()]);
  if (!blogEnabled) notFound();

  const [featured, ...rest] = articles;

  return (
    <main className="page-motif">
      <JsonLd data={breadcrumbList([{ name: "Acasă", path: "/" }, { name: "Blog", path: "/blog" }])} />
      <JsonLd
        data={collectionPage({
          name: BLOG_TITLE,
          description: BLOG_DESCRIPTION,
          url: "/blog",
          items: articles.map((a) => ({ name: a.title, url: `/blog/${a.slug}`, image: a.image })),
        })}
      />

      <BlogHeader
        title="Blog"
        description={`Articole, ghiduri și noutăți din activitatea ${SITE_NAME}.`}
        crumbs={[{ label: "Acasă", href: "/" }, { label: "Blog" }]}
      />
      <BlogTabs active="toate" />

      <section className="py-10 sm:py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <FeaturedCard post={featured} />

          {rest.length > 0 && (
            <>
              <h2 className="mb-6 mt-12 font-serif text-2xl font-bold uppercase tracking-tight text-primary sm:text-3xl">
                Mai multe <span className="text-accent">articole</span>
              </h2>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {rest.map((a) => (
                  <BlogCard key={a.slug} post={a} />
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      <BlogNewsletter />
    </main>
  );
}
