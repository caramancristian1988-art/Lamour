// Ajutoare comune pentru paginile de blog (listă, categorii, articol).

export const BLOG_CATEGORIES: { label: string; slug: string }[] = [
  { label: "Ghiduri", slug: "ghiduri" },
  { label: "Sfaturi", slug: "sfaturi" },
  { label: "Noutăți", slug: "noutati" },
  { label: "Comunitate", slug: "comunitate" },
  { label: "Producție", slug: "productie" },
];

import { INTRO_VIDEO } from "./siteVideos";

/** Articole care au un videoclip (de pe Facebook) afișat în text, sub paragraful introductiv. */
export const ARTICLE_VIDEOS: Record<string, { url: string; title: string; poster: string }> = {
  "cum-te-poti-implica-ca-voluntar": INTRO_VIDEO,
};

export const BLOG_FALLBACK_IMAGE = "https://placehold.co/800x600/D8B2B1/652F37?text=Articol";

export function formatBlogDate(date: Date): string {
  return date.toLocaleDateString("ro-MD", { day: "numeric", month: "long", year: "numeric" });
}

/** Timpul de citire din textul articolului (≈200 de cuvinte pe minut; cel puțin 1 minut). */
export function readingTime(html: string | null | undefined): string {
  const words = (html ?? "")
    .replace(/<[^>]*>/g, " ")
    .split(/\s+/)
    .filter(Boolean).length;
  return `${Math.max(1, Math.round(words / 200))} min citire`;
}
