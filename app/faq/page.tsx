import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { SITE_NAME } from "@/lib/constants";
import FaqAccordion, { type FaqItem } from "@/app/components/FaqAccordion";
import { Button } from "@/app/components/ui/button";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: `Întrebări frecvente | ${SITE_NAME}`,
  description: `Răspunsuri la cele mai frecvente întrebări despre serviciile și programele ${SITE_NAME}.`,
};

const FALLBACK_FAQS: FaqItem[] = [
  { question: "Ce servicii oferiți persoanelor nevăzătoare?", answer: "Oferim o gamă variată de servicii: consultanță, orientare și mobilitate, sprijin practic, mentenanță și programe integrate de sprijin." },
  { question: "Cum mă pot înscrie într-un program de sprijin?", answer: "Poți completa formularul de contact sau ne poți suna direct, iar echipa noastră îți va prezenta pașii următori." },
  { question: "Serviciile sunt gratuite?", answer: "O parte din serviciile noastre sunt gratuite pentru membrii asociației. Detaliile se stabilesc individual, în funcție de situație." },
  { question: "Activați în toată Moldova?", answer: "Da, activăm în Chișinău și în multe localități din Moldova. Detalii despre acoperire poți afla contactându-ne." },
];

async function getFaqs(): Promise<FaqItem[]> {
  try {
    const faqs = await prisma.faq.findMany({ orderBy: { order: "asc" } });
    if (faqs.length === 0) throw new Error("empty");
    return faqs.map((f) => ({ question: f.question, answer: f.answer }));
  } catch {
    return FALLBACK_FAQS;
  }
}

export default async function FaqPage() {
  const faqs = await getFaqs();

  return (
    <main className="bg-background min-h-screen">
      <div className="max-w-3xl mx-auto px-5 sm:px-6 py-10 sm:py-14">
        <nav aria-label="Fir de ariadnă" className="flex items-center gap-1.5 text-xs sm:text-sm text-muted-foreground mb-6">
          <Link href="/" className="hover:text-accent transition-colors rounded">Acasă</Link>
          <span aria-hidden>›</span>
          <span className="text-foreground font-medium">Întrebări frecvente</span>
        </nav>

        <p className="text-accent text-xs font-bold tracking-widest uppercase mb-3">Suport</p>
        <h1 className="text-3xl sm:text-4xl font-bold text-primary leading-tight tracking-tight mb-3">
          Întrebări frecvente
        </h1>
        <p className="text-muted-foreground text-sm sm:text-base leading-relaxed mb-10">
          Găsești mai jos răspunsuri la cele mai comune întrebări. Dacă nu găsești ce cauți,{" "}
          <Link href="/contact" className="text-accent hover:underline">contactează-ne</Link>.
        </p>

        <FaqAccordion faqs={faqs} />

        <div className="mt-12 bg-muted rounded-2xl p-6 text-center border border-border">
          <p className="font-bold text-foreground mb-1">Nu ai găsit răspunsul?</p>
          <p className="text-sm text-muted-foreground mb-4">Echipa noastră îți stă la dispoziție pentru orice întrebare.</p>
          <Button asChild variant="accent">
            <Link href="/contact">
              Contactează-ne
              <ArrowRight className="w-4 h-4" aria-hidden />
            </Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
