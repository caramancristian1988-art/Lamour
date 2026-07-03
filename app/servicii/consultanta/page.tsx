import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Check, Phone } from "lucide-react";
import { getSectionFlags, getContactInfo } from "@/lib/siteSettings";
import { getPromoProducts } from "@/lib/promoProducts";
import { getServiceDetail } from "@/lib/serviceDetail";
import ProductsSection from "@/app/components/ProductsSection";
import ServiceStepIcon from "@/app/components/ServiceStepIcon";
import ServiceFeatureIcon from "@/app/components/ServiceFeatureIcon";
import { Button } from "@/app/components/ui/button";
import { StarRating } from "@/app/components/ui/star-rating";
import { MotifDivider } from "@/app/components/ui/motif";

export const revalidate = 3600;

const defaultFeatures = [
  { title: "Consilieri cu experiență", desc: "Persoane cu experiență vastă în sprijinirea comunității.", icon: "award" },
  { title: "Recomandare personalizată", desc: "Analizăm situația ta și propunem soluția potrivită nevoilor tale.", icon: "search-plus" },
  { title: "Fără costuri ascunse", desc: "Consultanța este transparentă, fără obligații sau taxe surpriză.", icon: "shield" },
  { title: "Suport complet", desc: "Te ghidăm de la prima discuție până la soluția finală.", icon: "support" },
];

const defaultInclus = [
  "Evaluare gratuită a situației tale",
  "Recomandare de resurse potrivite nevoilor",
  "Comparație opțiuni disponibile",
  "Estimare a pașilor următori",
  "Suport în alegerea finală",
];

const defaultPasi = [
  { nr: "01", title: "Discuție", desc: "Ne spui ce nevoi ai și ce ai încercat până acum.", img: "/IMG_2841.PNG" },
  { nr: "02", title: "Evaluare", desc: "Analizăm situația și parametrii relevanți pentru recomandare.", img: "/IMG_2848.PNG" },
  { nr: "03", title: "Recomandare", desc: "Îți prezentăm cele mai potrivite soluții disponibile.", img: "/IMG_2840.PNG" },
];

const defaultTestimoniale = [
  { text: "Consultanța a fost extrem de utilă. Mi-au recomandat exact ce aveam nevoie, fără presiune.", name: "Radu T.", city: "Chișinău", initials: "RT" },
  { text: "Foarte profesioniști, mi-au explicat clar toate opțiunile. Am ales cu încredere!", name: "Cristina M.", city: "Orhei", initials: "CM" },
  { text: "Mulțumesc pentru recomandare, soluția aleasă se potrivește perfect nevoilor mele.", name: "Sergiu V.", city: "Chișinău", initials: "SV" },
];

export default async function ConsultantaPage() {
  const { serviciiEnabled } = await getSectionFlags();
  const { phone, phoneTel } = await getContactInfo();
  if (!serviciiEnabled) notFound();
  const produse = await getPromoProducts();
  const {
    heroImageDesktop,
    steps: pasi,
    features,
    checklist: inclus,
    testimonials: testimoniale,
  } = await getServiceDetail("/servicii/consultanta", {
    detailImage: "/IMG_2965.PNG",
    heroImageDesktop: "/IMG_2848.PNG",
    steps: defaultPasi,
    features: defaultFeatures,
    checklist: defaultInclus,
    testimonials: defaultTestimoniale,
  });

  return (
    <div className="bg-background">
      {/* ── HERO ── */}
      <section className="relative overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[340px] lg:min-h-[440px]">
          <div className="flex flex-col justify-center px-5 sm:px-6 lg:px-12 py-10 lg:py-12 bg-background">
            <nav aria-label="Fir de ariadnă" className="flex items-center gap-1.5 text-xs sm:text-sm text-muted-foreground mb-5">
              <Link href="/" className="hover:text-accent transition-colors rounded">Acasă</Link>
              <span aria-hidden>›</span>
              <Link href="/servicii" className="hover:text-accent transition-colors rounded">Servicii</Link>
              <span aria-hidden>›</span>
              <span className="text-foreground font-medium">Consultanță</span>
            </nav>
            <p className="text-accent text-xs font-bold tracking-widest uppercase mb-3">Serviciu</p>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight tracking-tight mb-4 text-primary">
              Consultanță <span className="text-accent">personalizată</span>
            </h1>
            <p className="text-sm sm:text-base text-foreground/80 leading-relaxed max-w-sm mb-8">
              Te ajutăm să găsești resursele și sprijinul potrivit nevoilor tale, fără obligații.
            </p>
            <div className="flex items-center gap-3 flex-wrap">
              <Button asChild variant="accent" size="lg">
                <Link href="/contact">Solicită consultanță</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/servicii/consultanta#detalii">Vezi detalii</Link>
              </Button>
            </div>
          </div>
          <div className="relative min-h-[240px] lg:min-h-0">
            <Image src={heroImageDesktop} alt="" fill className="object-cover object-center" priority />
          </div>
        </div>
      </section>

      {/* ── FEATURES BAR ── */}
      <section className="max-w-7xl mx-auto px-5 sm:px-6 pb-8 -mt-6 sm:-mt-8 relative z-10">
        <div className="bg-card rounded-2xl shadow-lg border border-border grid grid-cols-2 lg:grid-cols-4 divide-x divide-y lg:divide-y-0 divide-border">
          {features.map((f) => (
            <div key={f.title} className="flex flex-col gap-2 p-6">
              <ServiceFeatureIcon icon={f.icon} className="w-6 h-6 text-accent" />
              <p className="font-bold text-sm text-foreground mt-1">{f.title}</p>
              <p className="text-xs text-muted-foreground leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── DESPRE SERVICIU ── */}
      <section id="detalii" className="max-w-7xl mx-auto px-5 sm:px-6 py-12 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div>
          <p className="text-accent text-xs font-bold tracking-widest uppercase mb-3">Despre serviciu</p>
          <h2 className="text-2xl lg:text-3xl font-bold text-primary leading-snug tracking-tight mb-4">
            Alegerea potrivită, de la început
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
            Alegerea resurselor și sprijinului potrivit poate fi confuză. Consilierii noștri
            analizează situația, nevoile și contextul tău pentru a-ți recomanda soluția ideală,
            fără presiune.
          </p>
        </div>
        <div className="flex flex-col justify-center gap-4 px-6 py-8 bg-card rounded-2xl shadow-sm border border-border">
          {inclus.map((item) => (
            <div key={item} className="flex items-center gap-3">
              <span className="shrink-0 w-6 h-6 rounded-full bg-accent/10 text-accent flex items-center justify-center">
                <Check className="w-3.5 h-3.5" strokeWidth={3} aria-hidden />
              </span>
              <span className="text-sm text-foreground leading-snug">{item}</span>
            </div>
          ))}
        </div>
      </section>

      <MotifDivider className="max-w-7xl mx-auto" />

      {/* ── CUM LUCRĂM ── */}
      <section className="max-w-7xl mx-auto px-5 sm:px-6 py-10">
        <p className="text-xs font-bold tracking-widest uppercase text-accent mb-2">Cum lucrăm</p>
        <h2 className="text-2xl sm:text-3xl font-bold text-primary tracking-tight mb-8">Pașii consultanței</h2>
        <div className="flex flex-col sm:flex-row items-stretch gap-3">
          {pasi.map((pas, i) => (
            <div key={pas.nr} className="flex items-stretch gap-3 flex-1">
              <div className="flex items-center gap-0 rounded-xl overflow-hidden border border-border flex-1 bg-card">
                <ServiceStepIcon title={pas.title} className="relative w-28 lg:w-36 shrink-0 self-stretch" />
                <div className="px-4 py-4 flex flex-col gap-1">
                  <span className="text-2xl font-bold text-accent leading-none">{pas.nr}</span>
                  <p className="font-bold text-sm mt-1 text-foreground">{pas.title}</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">{pas.desc}</p>
                </div>
              </div>
              {i < pasi.length - 1 && (
                <div className="hidden sm:flex items-center shrink-0">
                  <ArrowRight className="w-5 h-5 text-accent" aria-hidden />
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ── REDUCERI LA PRODUSE ── */}
      <ProductsSection
        products={produse}
        title="Reduceri"
        highlighted="la produse"
        viewAllHref="/produse?oferte=1"
        showDiscount
      />

      {/* ── TESTIMONIALE ── */}
      <section className="max-w-7xl mx-auto px-5 sm:px-6 py-10">
        <p className="text-xs font-bold tracking-widest uppercase text-accent mb-2">Ce spun cei ajutați</p>
        <h2 className="text-2xl sm:text-3xl font-bold text-primary tracking-tight mb-8">Mărturii din comunitate</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {testimoniale.map((t) => (
            <div key={t.name} className="bg-primary rounded-2xl p-6 flex flex-col gap-4 relative">
              <StarRating rating={5} className="[&_svg]:text-brand-rose-light [&_svg]:fill-brand-rose-light" />
              <p className="text-white/80 text-sm leading-relaxed">{t.text}</p>
              <div className="flex items-center gap-3 mt-auto pt-3 border-t border-white/10">
                <div className="w-11 h-11 rounded-full bg-accent flex items-center justify-center text-white text-sm font-bold shrink-0 ring-2 ring-white/20">
                  {t.initials}
                </div>
                <div>
                  <p className="text-white text-sm font-bold">{t.name}</p>
                  <p className="text-white/50 text-xs">{t.city}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA BANNER ── */}
      <section className="max-w-7xl mx-auto px-5 sm:px-6 pb-16">
        <div className="bg-primary rounded-2xl px-6 sm:px-8 py-8 sm:py-10 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <p className="text-white font-bold text-xl lg:text-2xl leading-snug max-w-xs">
              Nu știi de unde să începi?
            </p>
            <p className="text-white/70 text-sm mt-2">Programează o consultanță gratuită și primești recomandarea potrivită.</p>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-4 shrink-0">
            <Button asChild variant="accent" size="lg">
              <Link href="/contact">Contactează-ne</Link>
            </Button>
            <a
              href={`tel:${phoneTel}`}
              className="flex items-center gap-3 text-white hover:text-white/80 transition-colors rounded"
            >
              <div className="w-10 h-10 rounded-full border border-white/30 flex items-center justify-center shrink-0">
                <Phone className="w-5 h-5" aria-hidden />
              </div>
              <span className="font-bold text-lg tracking-wide">{phone}</span>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
