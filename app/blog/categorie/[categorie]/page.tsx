import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArrowRight, ArrowLeft } from "lucide-react";
import { getSectionFlags } from "@/lib/siteSettings";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/app/components/ui/badge";
import { SITE_NAME } from "@/lib/constants";

export const revalidate = 3600;

const FALLBACK_IMAGE = "https://placehold.co/800x600/D8B2B1/652F37?text=Articol";

const filterTabs = [
  { label: "Toate articolele", href: "/blog" },
  { label: "Ghiduri", href: "/blog/categorie/ghiduri" },
  { label: "Sfaturi", href: "/blog/categorie/sfaturi" },
  { label: "Noutăți", href: "/blog/categorie/noutati" },
  { label: "Comunitate", href: "/blog/categorie/comunitate" },
  { label: "Producție", href: "/blog/categorie/productie" },
];

const categoryNames: Record<string, string> = {
  ghiduri: "Ghiduri",
  sfaturi: "Sfaturi",
  noutati: "Noutăți",
  comunitate: "Comunitate",
  productie: "Producție",
};

export function generateStaticParams() {
  return Object.keys(categoryNames).map((categorie) => ({ categorie }));
}

export async function generateMetadata({ params }: { params: Promise<{ categorie: string }> }): Promise<Metadata> {
  const { categorie } = await params;
  const name = categoryNames[categorie] ?? categorie;
  return { title: `${name} | Blog ${SITE_NAME}` };
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
    <main className="bg-background">
      {/* Hero */}
      <section className="bg-background border-b border-border py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <nav className="flex items-center gap-1.5 text-xs text-muted-foreground mb-4" aria-label="Fir de ariadnă">
            <Link href="/" className="hover:text-accent transition-colors">Acasă</Link>
            <span aria-hidden>›</span>
            <Link href="/blog" className="hover:text-accent transition-colors">Blog</Link>
            <span aria-hidden>›</span>
            <span className="text-primary font-medium">{categoryName}</span>
          </nav>
          <h1 className="text-3xl font-extrabold text-primary">{categoryName}</h1>
          <p className="text-sm text-muted-foreground mt-1">{posts.length} articol{posts.length !== 1 ? "e" : ""}</p>
        </div>
      </section>

      {/* Filter tabs */}
      <section className="border-b border-border bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center gap-1 overflow-x-auto scroll-smooth py-3" style={{ scrollbarWidth: "none" }}>
            {filterTabs.map((tab) => (
              <Link
                key={tab.href}
                href={tab.href}
                className={`shrink-0 text-xs font-bold px-4 py-2 rounded-full transition-all ${
                  tab.href === `/blog/categorie/${categorie}`
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted"
                }`}
              >
                {tab.label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Articles */}
      <section className="bg-background py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          {posts.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-muted-foreground text-sm">Nu există articole în această categorie încă.</p>
              <Link href="/blog" className="inline-flex items-center gap-1.5 text-accent font-bold text-sm mt-4 hover:underline">
                <ArrowLeft className="w-3.5 h-3.5" aria-hidden />
                Înapoi la toate articolele
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.map((post) => (
                <Link key={post.slug} href={`/blog/${post.slug}`} className="group flex flex-col bg-card border border-border rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                  <div className="relative h-48 overflow-hidden">
                    <Image
                      src={post.image ?? FALLBACK_IMAGE}
                      alt={post.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <Badge variant="accent" className="absolute top-3 left-3 shadow-sm">
                      {post.category ?? "General"}
                    </Badge>
                  </div>
                  <div className="flex flex-col flex-1 p-5 gap-3">
                    <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                      <span>{post.createdAt.toLocaleDateString("ro-MD", { day: "numeric", month: "long", year: "numeric" })}</span>
                    </div>
                    <h2 className="font-extrabold text-primary text-sm leading-snug group-hover:text-accent transition-colors line-clamp-2">
                      {post.title}
                    </h2>
                    <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">{post.description}</p>
                    <div className="mt-auto pt-2 flex items-center gap-1 text-accent text-xs font-bold">
                      Citește articolul
                      <ArrowRight className="w-3.5 h-3.5" aria-hidden />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
