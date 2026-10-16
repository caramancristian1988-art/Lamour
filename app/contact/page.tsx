import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Phone, Mail, Clock, HeadphonesIcon, MapPin, ArrowRight } from "lucide-react";
import { WhatsAppIcon, ViberIcon } from "@/app/components/ui/brand-icons";
import { prisma } from "@/lib/prisma";
import { onlyVisible } from "@/lib/productVisibility";
import { fallbackProducts } from "@/lib/fallbackData";
import { getSectionFlags, getContactInfo } from "@/lib/siteSettings";
import { SITE_NAME } from "@/lib/constants";
import ProductsSection from "../components/ProductsSection";
import FaqAccordion, { type FaqItem } from "../components/FaqAccordion";
import ContactForm from "../components/ContactForm";
import { PageHeader } from "../components/PageHeader";
import LocationMap from "../components/LocationMap";
import { HeadingFlourish } from "@/app/components/ui/motif";
import JsonLd from "../components/JsonLd";
import { breadcrumbList } from "@/lib/structuredData";
import { absoluteUrl } from "@/lib/seo";

export const revalidate = 3600;

const CONTACT_TITLE = `Contact | ${SITE_NAME}`;
const CONTACT_DESCRIPTION = `Ai nevoie de sprijin, consultanță sau informații despre produsele și serviciile ${SITE_NAME}? Scrie-ne și revenim rapid cu un răspuns.`;

export const metadata: Metadata = {
  title: { absolute: CONTACT_TITLE },
  description: CONTACT_DESCRIPTION,
  alternates: { canonical: absoluteUrl("/contact") },
  openGraph: {
    title: CONTACT_TITLE,
    description: CONTACT_DESCRIPTION,
    url: absoluteUrl("/contact"),
  },
  twitter: {
    title: CONTACT_TITLE,
    description: CONTACT_DESCRIPTION,
  },
};

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
      where: onlyVisible(),
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

// Un card de contact (telefon / WhatsApp / Viber / email): pictogramă mare într-un cerc, valoarea, butonul-pastilă dedesubt.
function ContactCard({
  icon,
  label,
  value,
  href,
  action,
  external,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  href: string;
  action: string;
  external?: boolean;
  tone: string;
}) {
  return (
    <div className="group flex flex-col items-center gap-3 rounded-3xl border border-brand-rose/60 bg-card p-6 text-center shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md">
      <div className={`flex h-16 w-16 items-center justify-center rounded-full ring-4 ring-brand-rose/20 transition-transform duration-300 group-hover:scale-105 ${tone}`}>{icon}</div>
      <p className="font-serif text-lg font-bold text-primary">{label}</p>
      <p className="break-all text-sm font-bold text-foreground">{value}</p>
      <a
        href={href}
        {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        className="mt-auto inline-flex h-11 w-full items-center justify-center gap-2 rounded-full bg-accent text-sm font-bold uppercase tracking-wide text-accent-foreground shadow-md transition-colors hover:bg-brand-red-dark"
      >
        {action}
        {external && <span className="sr-only">(se deschide într-o fereastră nouă)</span>}
      </a>
    </div>
  );
}

function SectionHeading({ id, children }: { id?: string; children: React.ReactNode }) {
  return (
    <div className="mb-6 flex items-center gap-4">
      <h2 id={id} className="font-serif text-2xl font-bold uppercase tracking-tight text-primary sm:text-3xl">
        {children}
      </h2>
      <HeadingFlourish />
      <span aria-hidden className="h-px flex-1 bg-gradient-to-r from-brand-rose to-brand-rose/10" />
    </div>
  );
}

export default async function ContactPage() {
  const { contactEnabled } = await getSectionFlags();
  if (!contactEnabled) notFound();

  const products = await getRecommendedProducts();
  const faqs = await getFaqs();
  const { phone, phoneTel, phoneDigits, email, address } = await getContactInfo();

  return (
    <main className="page-motif">
      <JsonLd data={breadcrumbList([{ name: "Acasă", path: "/" }, { name: "Contact", path: "/contact" }])} />

      <PageHeader
        title="Contact"
        description="Ai nevoie de sprijin, consultanță sau informații despre produsele noastre? Scrie-ne și revenim rapid cu un răspuns."
        crumbs={[{ label: "Acasă", href: "/" }, { label: "Contact" }]}
      />

      {/* Moduri de contact */}
      <section className="mx-auto max-w-7xl px-4 pb-12 pt-10 sm:px-6 sm:pt-12" aria-label="Moduri de contact">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <ContactCard
            icon={<Phone className="h-7 w-7 text-white" aria-hidden />}
            tone="bg-primary"
            label="Telefon"
            value={phone}
            href={`tel:${phoneTel}`}
            action="Sună acum"
          />
          <ContactCard
            icon={<WhatsAppIcon className="h-7 w-7 text-white" />}
            tone="bg-[#25D366]"
            label="WhatsApp"
            value={phone}
            href={`https://wa.me/${phoneDigits}`}
            action="Scrie pe WhatsApp"
            external
          />
          <ContactCard
            icon={<ViberIcon className="h-7 w-7 text-white" />}
            tone="bg-[#7360F2]"
            label="Viber"
            value={phone}
            href={`viber://chat?number=%2B${phoneDigits}`}
            action="Scrie pe Viber"
          />
          <ContactCard
            icon={<Mail className="h-7 w-7 text-white" aria-hidden />}
            tone="bg-accent"
            label="Email"
            value={email}
            href={`mailto:${email}`}
            action="Trimite email"
          />
        </div>
      </section>

      {/* Formular + informații */}
      <section className="mx-auto max-w-7xl px-4 pb-14 sm:px-6" aria-labelledby="mesaj-titlu">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1.6fr_1fr]">
          <div className="rounded-3xl border border-brand-rose/60 bg-card p-6 shadow-sm sm:p-9">
            <h2 id="mesaj-titlu" className="font-serif text-2xl font-bold text-primary sm:text-3xl">
              Trimite-ne un mesaj
            </h2>
            <p className="mb-6 mt-2 text-sm text-muted-foreground">Completează câmpurile de mai jos și te sunăm noi.</p>
            <ContactForm />
          </div>

          <div className="flex flex-col gap-4">
            <div className="rounded-3xl border border-brand-rose/60 bg-card p-6 shadow-sm">
              <div className="mb-4 flex items-center gap-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary text-white">
                  <MapPin className="h-5 w-5" aria-hidden />
                </span>
                <h3 className="font-serif text-lg font-bold text-primary">Adresa</h3>
              </div>
              <p className="text-sm text-foreground">{address}</p>
              <Link href="#harta" className="mt-3 inline-flex items-center gap-1.5 text-sm font-bold text-accent hover:underline">
                Vezi pe hartă
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            </div>

            <div className="rounded-3xl border border-brand-rose/60 bg-card p-6 shadow-sm">
              <div className="mb-4 flex items-center gap-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary text-white">
                  <Clock className="h-5 w-5" aria-hidden />
                </span>
                <h3 className="font-serif text-lg font-bold text-primary">Program</h3>
              </div>
              <dl className="flex flex-col gap-2 text-sm">
                <div className="flex justify-between gap-4 border-b border-border pb-2">
                  <dt className="text-muted-foreground">Luni - Vineri</dt>
                  <dd className="font-semibold text-foreground">09:00 - 18:00</dd>
                </div>
                <div className="flex justify-between gap-4 border-b border-border pb-2">
                  <dt className="text-muted-foreground">Sâmbătă</dt>
                  <dd className="font-semibold text-foreground">10:00 - 14:00</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-muted-foreground">Duminică</dt>
                  <dd className="font-semibold text-foreground">Închis</dd>
                </div>
              </dl>
            </div>

            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-maroon-dark via-brand-maroon to-brand-maroon-dark p-6 text-white shadow-sm">
              <div aria-hidden className="pointer-events-none absolute inset-0 bg-footer-pattern opacity-[0.08]" />
              <div className="relative">
                <div className="mb-3 flex items-center gap-3">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/10 ring-1 ring-white/25">
                    <HeadphonesIcon className="h-5 w-5 text-brand-rose-light" aria-hidden />
                  </span>
                  <h3 className="font-serif text-lg font-bold">Suport</h3>
                </div>
                <p className="text-sm leading-relaxed text-white/85">
                  Echipa noastră îți stă la dispoziție pentru orice întrebare legată de produse, comenzi sau livrare.
                </p>
                <Link href="#faq" className="mt-4 inline-flex items-center gap-1.5 text-sm font-bold text-white underline-offset-4 hover:underline">
                  Întrebări frecvente
                  <ArrowRight className="h-4 w-4" aria-hidden />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="mx-auto max-w-4xl scroll-mt-24 px-4 pb-14 sm:px-6" aria-labelledby="faq-titlu">
        <SectionHeading id="faq-titlu">
          Întrebări <span className="text-accent">frecvente</span>
        </SectionHeading>
        <FaqAccordion faqs={faqs} />
      </section>

      <LocationMap />

      {/* Produse recomandate */}
      <ProductsSection products={products} viewAllHref="/produse" />
    </main>
  );
}
