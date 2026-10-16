// Ajutoare comune pentru paginile de blog (listă, categorii, articol).

export const BLOG_CATEGORIES: { label: string; slug: string }[] = [
  { label: "Ghiduri", slug: "ghiduri" },
  { label: "Sfaturi", slug: "sfaturi" },
  { label: "Noutăți", slug: "noutati" },
  { label: "Comunitate", slug: "comunitate" },
  { label: "Producție", slug: "productie" },
];

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
