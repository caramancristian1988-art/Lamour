import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Phone, MessageCircle, Mail, Clock, HeadphonesIcon } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { fallbackProducts } from "@/lib/fallbackData";
import { getSectionFlags, getContactInfo } from "@/lib/siteSettings";
import { SITE_NAME } from "@/lib/constants";
import ProductsSection from "../components/ProductsSection";
import FaqAccordion, { type FaqItem } from "../components/FaqAccordion";
import ContactForm from "../components/ContactForm";

export const revalidate = 3600;

const FALLBACK_FAQS: FaqItem[] = [
  {
    question: "Cât durează procesarea unei cereri de sprijin?",
    answer: "În medie, revenim în 1-2 zile lucrătoare, în funcție de complexitatea situației și de disponibilitatea echipei.",
  },
  {
    question: "Oferiți sprijin gratuit sau contra cost?",
    answer: "O parte din serviciile noastre sunt oferite gratuit membrilor asociației, iar altele pot implica un cost simbolic. Detaliile se stabilesc de la caz la caz.",
  },
  {
    question: "Asigurați urmărire și sprijin continuu?",
    answer: "Da, oferim programe de urmărire periodică și suport constant pentru toate persoanele înscrise în programele noastre.",
  },
];

async function getRecommendedProducts() {
  try {
    const products = await prisma.product.findMany({
      orderBy: { rating: "desc" },
      take: 4,
    });
    if (products.length === 0) throw new Error("empty");
    return products;
  } catch {
    return fallbackProducts.slice(0, 4);
  }
}

async function getFaqs(): Promise<FaqItem[]> {
  try {
    const faqs = await prisma.faq.findMany({ orderBy: { order: "asc" } });
    if (faqs.length === 0) throw new Error("empty");
    return faqs.map((f) => ({ question: f.question, answer: f.answer }));
  } catch {
    return FALLBACK_FAQS;
  }
}

export default async function ContactPage() {
  const { contactEnabled } = await getSectionFlags();
  if (!contactEnabled) notFound();

  const products = await getRecommendedProducts();
  const faqs = await getFaqs();
  const { phone, phoneTel, phoneDigits, email } = await getContactInfo();

  return (
    <div className="bg-background">
      {/* ── HERO SECTION — MOBILE ── */}
      <section className="sm:hidden relative bg-background">
        <div className="px-5 pt-5 pb-4">
          <nav aria-label="Fir de ariadnă" className="flex items-center gap-1.5 text-xs text-muted-foreground mb-5">
            <Link href="/" className="hover:text-accent transition-colors rounded">Acasă</Link>
            <span aria-hidden>›</span>
            <span className="text-foreground font-medium">Contact</span>
          </nav>
          <p className="text-accent text-xs font-bold tracking-widest uppercase mb-3">Contact</p>
          <h1 className="text-3xl font-bold leading-tight tracking-tight mb-4 text-primary">
            Contactează <span className="text-accent">{SITE_NAME}</span>
          </h1>
          <p className="text-sm text-foreground/80 leading-relaxed">
            Ai nevoie de sprijin, consultanță sau informații despre programele noastre?
            Scrie-ne și revenim rapid cu un răspuns.
          </p>
        </div>
        <div className="relative w-full aspect-[3/4]">
          <Image
            src="/contact-nevazatori-mobil.png"
            alt="Susținem nevăzătorii — persoană cu baston alb"
            fill
            priority
            className="object-cover object-top"
            sizes="100vw"
          />
        </div>
      </section>

      {/* ── HERO SECTION — TABLET / DESKTOP ── */}
      <section className="hidden sm:block relative overflow-hidden bg-background pb-10 lg:pb-12">
        <div className="relative min-h-[400px] lg:min-h-[460px]">
          <Image
            src="/contact-nevazatori.png"
            alt="Susținem nevăzătorii — persoană cu baston alb"
            fill
            priority
            className="object-cover object-[32%_center] lg:object-center"
            sizes="100vw"
          />
          <div className="relative max-w-7xl mx-auto px-6 lg:px-12 h-full">
            <div className="flex items-center min-h-[400px] lg:min-h-[460px] py-6">
              <div className="relative z-10 max-w-sm lg:max-w-md">
                <nav aria-label="Fir de ariadnă" className="flex items-center gap-1.5 text-sm text-muted-foreground mb-5">
                  <Link href="/" className="hover:text-accent transition-colors rounded">Acasă</Link>
                  <span aria-hidden>›</span>
                  <span className="text-foreground font-medium">Contact</span>
                </nav>
                <p className="text-accent text-xs font-bold tracking-widest uppercase mb-3">Contact</p>
                <h1 className="text-4xl lg:text-5xl font-bold leading-tight tracking-tight mb-4 text-primary">
                  Contactează <span className="text-accent">{SITE_NAME}</span>
                </h1>
                <p className="text-base text-foreground/80 leading-relaxed">
                  Ai nevoie de sprijin, consultanță sau informații despre programele noastre?
                  Scrie-ne și revenim rapid cu un răspuns.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact cards */}
      <section className="max-w-7xl mx-auto px-5 sm:px-6 pb-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div className="border border-border bg-card rounded-2xl p-6 flex flex-col items-center text-center gap-3 hover:shadow-md transition-shadow">
            <div className="w-14 h-14 bg-secondary/30 rounded-full flex items-center justify-center">
              <Phone className="w-7 h-7 text-primary" aria-hidden />
            </div>
            <p className="font-bold text-sm text-foreground">Telefon</p>
            <p className="text-accent font-bold text-sm">{phone}</p>
            <a
              href={`tel:${phoneTel}`}
              className="w-full border border-primary text-primary text-xs font-bold py-2.5 rounded-lg hover:bg-primary hover:text-primary-foreground transition-colors"
            >
              Sună acum
            </a>
          </div>

          <div className="border border-border bg-card rounded-2xl p-6 flex flex-col items-center text-center gap-3 hover:shadow-md transition-shadow">
            <div className="w-14 h-14 bg-success/10 rounded-full flex items-center justify-center">
              <MessageCircle className="w-7 h-7 text-success" aria-hidden />
            </div>
            <p className="font-bold text-sm text-foreground">WhatsApp</p>
            <p className="text-success font-bold text-sm">{phone}</p>
            <a
              href={`https://wa.me/${phoneDigits}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full border border-success text-success text-xs font-bold py-2.5 rounded-lg hover:bg-success hover:text-success-foreground transition-colors"
            >
              Scrie pe WhatsApp
            </a>
          </div>

          <div className="border border-border bg-card rounded-2xl p-6 flex flex-col items-center text-center gap-3 hover:shadow-md transition-shadow">
            <div className="w-14 h-14 bg-secondary/30 rounded-full flex items-center justify-center">
              <MessageCircle className="w-7 h-7 text-primary" aria-hidden />
            </div>
            <p className="font-bold text-sm text-foreground">Viber</p>
            <p className="text-primary font-bold text-sm">{phone}</p>
            <a
              href={`viber://chat?number=${phoneDigits}`}
              className="w-full border border-primary text-primary text-xs font-bold py-2.5 rounded-lg hover:bg-primary hover:text-primary-foreground transition-colors"
            >
              Scrie pe Viber
            </a>
          </div>

          <div className="border border-border bg-card rounded-2xl p-6 flex flex-col items-center text-center gap-3 hover:shadow-md transition-shadow">
            <div className="w-14 h-14 bg-accent/10 rounded-full flex items-center justify-center">
              <Mail className="w-7 h-7 text-accent" aria-hidden />
            </div>
            <p className="font-bold text-sm text-foreground">Email</p>
            <p className="text-accent font-bold text-xs break-all">{email}</p>
            <a
              href={`mailto:${email}`}
              className="w-full border border-primary text-primary text-xs font-bold py-2.5 rounded-lg hover:bg-primary hover:text-primary-foreground transition-colors"
            >
              Trimite email
            </a>
          </div>
        </div>
      </section>

      {/* Form + Sidebar */}
      <section className="max-w-7xl mx-auto px-5 sm:px-6 pb-14">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* Form */}
          <div className="md:col-span-2">
            <h2 className="text-2xl font-bold text-primary tracking-tight mb-6">Trimite-ne un mesaj</h2>
            <ContactForm />
          </div>

          {/* Sidebar */}
          <div className="flex flex-col gap-4">
            <div className="border border-border bg-card rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white shrink-0">
                  <Clock className="w-5 h-5" aria-hidden />
                </div>
                <p className="font-bold text-foreground">Program</p>
              </div>
              <div className="flex flex-col gap-1 text-sm text-muted-foreground">
                <p>Luni - Vineri: 09:00 - 18:00</p>
                <p>Sâmbătă: 10:00 - 14:00</p>
                <p>Duminică: Închis</p>
              </div>
            </div>

            <div className="border border-border bg-card rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white shrink-0">
                  <HeadphonesIcon className="w-5 h-5" aria-hidden />
                </div>
                <p className="font-bold text-foreground">Suport</p>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Echipa noastră îți stă la dispoziție pentru orice întrebare legată de
                servicii, programe sau modalități de sprijin.
              </p>
              <Link
                href="#faq"
                className="text-accent font-bold text-xs mt-4 block hover:underline"
              >
                Întrebări frecvente →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="max-w-7xl mx-auto px-5 sm:px-6 pb-14">
        <h2 className="text-2xl font-bold text-primary tracking-tight mb-2">Întrebări frecvente</h2>
        <div className="w-10 h-[3px] bg-accent rounded-full mb-6" />
        <FaqAccordion faqs={faqs} />
      </section>

      {/* Recommended products */}
      <ProductsSection products={products} viewAllHref="/produse" />
    </div>
  );
}
