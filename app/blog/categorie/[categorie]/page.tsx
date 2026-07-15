import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArrowRight, ArrowLeft } from "lucide-react";
import { getSectionFlags } from "@/lib/siteSettings";
import { Badge } from "@/app/components/ui/badge";
import { SITE_NAME } from "@/lib/constants";

export const revalidate = 3600;

const DEMO_SLUG = "cum-alegi-conditionerul-potrivit";

const allArticles = [
  {
    slug: DEMO_SLUG,
    title: "Cum poți contribui la incluziunea persoanelor cu deficiențe de vedere",
    excerpt: "Câteva idei simple prin care comunitatea poate sprijini incluziunea persoanelor nevăzătoare.",
    category: "Impact social",
    categorySlug: "comunitate",
    date: "20 Mai 2026",
    readTime: "5 min citire",
    image: "https://placehold.co/800x600/D8B2B1/652F37?text=Articol",
  },
  {
    slug: DEMO_SLUG,
    title: "Accesibilitatea digitală: de ce contează pentru fiecare dintre noi",
    excerpt: "Descoperă de ce site-urile și aplicațiile accesibile fac diferența pentru persoanele nevăzătoare.",
    category: "Ghiduri",
    categorySlug: "ghiduri",
    date: "15 Mai 2026",
    readTime: "4 min citire",
    image: "https://placehold.co/800x600/D8B2B1/652F37?text=Articol",
  },
  {
    slug: DEMO_SLUG,
    title: "Cum sprijinim membrii asociației în activitatea zilnică",
    excerpt: "Află despre practicile prin care asociația oferă sprijin constant membrilor săi.",
    category: "Impact social",
    categorySlug: "comunitate",
    date: "10 Mai 2026",
    readTime: "6 min citire",
    image: "https://placehold.co/800x600/D8B2B1/652F37?text=Articol",
  },
  {
    slug: DEMO_SLUG,
    title: "Tehnologii asistive — ce înseamnă și cum ajută în viața de zi cu zi",
    excerpt: "Află ce tehnologii asistive există și de ce sunt un avantaj real pentru independență.",
    category: "Ghiduri",
    categorySlug: "ghiduri",
    date: "5 Mai 2026",
    readTime: "5 min citire",
    image: "https://placehold.co/800x600/D8B2B1/652F37?text=Articol",
  },
  {
    slug: DEMO_SLUG,
    title: "Noutăți din activitatea noastră — 2026",
    excerpt: "Descoperă cele mai noi proiecte și inițiative ale companiei din acest an.",
    category: "Noutăți",
    categorySlug: "noutati",
    date: "1 Mai 2026",
    readTime: "4 min citire",
    image: "https://placehold.co/800x600/D8B2B1/652F37?text=Articol",
  },
  {
    slug: DEMO_SLUG,
    title: "Cum te poți implica ca voluntar în comunitatea noastră",
    excerpt: "7 idei simple prin care te poți implica și sprijini activitatea asociației.",
    category: "Sfaturi",
    categorySlug: "sfaturi",
    date: "24 Apr 2026",
    readTime: "8 min citire",
    image: "https://placehold.co/800x600/D8B2B1/652F37?text=Articol",
  },
];

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
  const articles = allArticles.filter((a) => a.categorySlug === categorie);

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
          <p className="text-sm text-muted-foreground mt-1">{articles.length} articol{articles.length !== 1 ? "e" : ""}</p>
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
          {articles.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-muted-foreground text-sm">Nu există articole în această categorie încă.</p>
              <Link href="/blog" className="inline-flex items-center gap-1.5 text-accent font-bold text-sm mt-4 hover:underline">
                <ArrowLeft className="w-3.5 h-3.5" aria-hidden />
                Înapoi la toate articolele
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {articles.map((article) => (
                <Link key={article.slug} href={`/blog/${article.slug}`} className="group flex flex-col bg-card border border-border rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                  <div className="relative h-48 overflow-hidden">
                    <Image
                      src={article.image}
                      alt={article.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <Badge variant="accent" className="absolute top-3 left-3 shadow-sm">
                      {article.category}
                    </Badge>
                  </div>
                  <div className="flex flex-col flex-1 p-5 gap-3">
                    <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                      <span>{article.date}</span>
                      <span>·</span>
                      <span>{article.readTime}</span>
                    </div>
                    <h2 className="font-extrabold text-primary text-sm leading-snug group-hover:text-accent transition-colors line-clamp-2">
                      {article.title}
                    </h2>
                    <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">{article.excerpt}</p>
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
