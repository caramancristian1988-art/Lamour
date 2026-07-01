import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getSectionFlags } from "@/lib/siteSettings";

export const revalidate = 3600;

const allArticles = [
  {
    slug: "cum-alegi-conditionerul-potrivit",
    title: "Cum alegi aparatul de aer condiționat potrivit pentru casa ta?",
    excerpt: "Află tot ce trebuie să știi pentru a alege un aparat de aer condiționat potrivit și eficient.",
    category: "Ghiduri",
    categorySlug: "ghiduri",
    categoryColor: "bg-[#c7092b]",
    date: "20 Mai 2026",
    readTime: "5 min read",
    image: "/30634e25-d3ae-42fc-b1cd-cb9ab4ce60da.png",
  },
  {
    slug: "temperatura-ideala-vara",
    title: "Temperatura ideală vara: cât de rece ar trebui setat AC-ul?",
    excerpt: "Descoperă care este temperatura optimă pentru confort și cum să economisești energie în același timp.",
    category: "Sfaturi",
    categorySlug: "sfaturi",
    categoryColor: "bg-[#2563eb]",
    date: "15 Mai 2026",
    readTime: "4 min read",
    image: "/30634e25-d3ae-42fc-b1cd-cb9ab4ce60da.png",
  },
  {
    slug: "intretinerea-corecta-ac",
    title: "Întreținerea corectă a aparatului de aer condiționat",
    excerpt: "Află practicile pentru prelungirea vieții și menținerea unui randament optim al aparatului tău.",
    category: "Întreținere",
    categorySlug: "intretinere",
    categoryColor: "bg-[#16a34a]",
    date: "10 Mai 2026",
    readTime: "6 min read",
    image: "/30634e25-d3ae-42fc-b1cd-cb9ab4ce60da.png",
  },
  {
    slug: "inverter-vs-on-off",
    title: "Inverter vs. On/Off — care este diferența?",
    excerpt: "Află ce înseamnă tehnologia inverter și de ce este mai avantajoasă pentru tine pe termen lung.",
    category: "Tehnologie",
    categorySlug: "tehnologie",
    categoryColor: "bg-[#7c3aed]",
    date: "5 Mai 2026",
    readTime: "5 min read",
    image: "/30634e25-d3ae-42fc-b1cd-cb9ab4ce60da.png",
  },
  {
    slug: "noutati-climatizare-2024",
    title: "Noutăți în domeniul climatizării — 2024",
    excerpt: "Descoperă cele mai noi funcții și tehnologii care diferențiază aparatele de acest an.",
    category: "Noutăți",
    categorySlug: "noutati",
    categoryColor: "bg-[#ea580c]",
    date: "1 Mai 2026",
    readTime: "4 min read",
    image: "/30634e25-d3ae-42fc-b1cd-cb9ab4ce60da.png",
  },
  {
    slug: "reducere-consum-energie",
    title: "Cum să reduci consumul de energie al aparatului de aer condiționat",
    excerpt: "7 sfaturi simple care te ajută să te bucuri de confort și să economisești la factură.",
    category: "Sfaturi",
    categorySlug: "sfaturi",
    categoryColor: "bg-[#2563eb]",
    date: "24 Apr 2026",
    readTime: "8 min read",
    image: "/30634e25-d3ae-42fc-b1cd-cb9ab4ce60da.png",
  },
];

const filterTabs = [
  { label: "Toate articolele", href: "/blog" },
  { label: "Ghiduri", href: "/blog/categorie/ghiduri" },
  { label: "Sfaturi", href: "/blog/categorie/sfaturi" },
  { label: "Întreținere", href: "/blog/categorie/intretinere" },
  { label: "Noutăți", href: "/blog/categorie/noutati" },
  { label: "Tehnologie", href: "/blog/categorie/tehnologie" },
];

const categoryNames: Record<string, string> = {
  ghiduri: "Ghiduri",
  sfaturi: "Sfaturi",
  intretinere: "Întreținere",
  noutati: "Noutăți",
  tehnologie: "Tehnologie",
};

export function generateStaticParams() {
  return Object.keys(categoryNames).map((categorie) => ({ categorie }));
}

export async function generateMetadata({ params }: { params: Promise<{ categorie: string }> }): Promise<Metadata> {
  const { categorie } = await params;
  const name = categoryNames[categorie] ?? categorie;
  return { title: `${name} | Blog Climat Rapid` };
}

export default async function CategoriePage({ params }: { params: Promise<{ categorie: string }> }) {
  const { blogEnabled } = await getSectionFlags();
  if (!blogEnabled) notFound();

  const { categorie } = await params;
  const categoryName = categoryNames[categorie] ?? categorie;
  const articles = allArticles.filter((a) => a.categorySlug === categorie);

  return (
    <main className="bg-white">
      {/* Hero */}
      <section className="bg-white border-b border-gray-100 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <nav className="flex items-center gap-1.5 text-xs text-gray-400 mb-4">
            <Link href="/" className="hover:text-[#c7092b] transition-colors">Acasă</Link>
            <span>›</span>
            <Link href="/blog" className="hover:text-[#c7092b] transition-colors">Blog</Link>
            <span>›</span>
            <span className="text-[#1d2353] font-medium">{categoryName}</span>
          </nav>
          <h1 className="text-3xl font-extrabold text-[#1d2353]">{categoryName}</h1>
          <p className="text-sm text-gray-500 mt-1">{articles.length} articol{articles.length !== 1 ? "e" : ""}</p>
        </div>
      </section>

      {/* Filter tabs */}
      <section className="border-b border-gray-100 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center gap-1 overflow-x-auto scroll-smooth py-3" style={{ scrollbarWidth: "none" }}>
            {filterTabs.map((tab) => (
              <Link
                key={tab.href}
                href={tab.href}
                className={`shrink-0 text-xs font-bold px-4 py-2 rounded-full transition-all ${
                  tab.href === `/blog/categorie/${categorie}`
                    ? "bg-[#1d2353] text-white"
                    : "text-gray-500 hover:bg-gray-100"
                }`}
              >
                {tab.label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Articles */}
      <section className="bg-white py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          {articles.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-gray-400 text-sm">Nu există articole în această categorie încă.</p>
              <Link href="/blog" className="text-[#c7092b] font-bold text-sm mt-4 inline-block hover:underline">
                ← Înapoi la toate articolele
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {articles.map((article) => (
                <Link key={article.slug} href={`/blog/${article.slug}`} className="group flex flex-col bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                  <div className="relative h-48 overflow-hidden">
                    <Image
                      src={article.image}
                      alt={article.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <span className={`absolute top-3 left-3 ${article.categoryColor} text-white text-[10px] font-bold px-2.5 py-1 rounded-full`}>
                      {article.category}
                    </span>
                  </div>
                  <div className="flex flex-col flex-1 p-5 gap-3">
                    <div className="flex items-center gap-3 text-[11px] text-gray-400">
                      <span>{article.date}</span>
                      <span>·</span>
                      <span>{article.readTime}</span>
                    </div>
                    <h2 className="font-extrabold text-[#1d2353] text-sm leading-snug group-hover:text-[#c7092b] transition-colors line-clamp-2">
                      {article.title}
                    </h2>
                    <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">{article.excerpt}</p>
                    <div className="mt-auto pt-2 flex items-center gap-1 text-[#c7092b] text-xs font-bold">
                      Citește articolul
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
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
