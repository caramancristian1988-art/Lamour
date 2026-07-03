import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, HeartHandshake, ShieldCheck, Wrench, Users, HandHeart } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getSectionFlags } from "@/lib/siteSettings";
import { Button } from "@/app/components/ui/button";
import { MotifDivider } from "@/app/components/ui/motif";

export const revalidate = 3600;

const fallbackServiciiPrincipale = [
  {
    id: "fallback-1",
    image: "/IMG_2838.PNG",
    title: "Sprijin și îndrumare personalizată",
    description: "Consiliere individuală adaptată nevoilor fiecărei persoane cu deficiențe de vedere.",
    href: "/servicii/instalare",
  },
  {
    id: "fallback-2",
    image: "/IMG_2839.PNG",
    title: "Mentenanță & suport continuu",
    description: "Sprijin constant, verificări periodice și acompaniere pe termen lung.",
    href: "/servicii/mentenanta",
  },
  {
    id: "fallback-3",
    image: "/IMG_2840.PNG",
    title: "Evaluare & diagnosticare",
    description: "Evaluăm nevoile specifice și identificăm rapid soluțiile potrivite.",
    href: "/servicii/diagnosticare",
  },
];

const fallbackServiciiAvansate = [
  {
    id: "fallback-4",
    image: "/IMG_2841.PNG",
    title: "Consultanță",
    description: "Te ajutăm să găsești resursele și programele potrivite nevoilor tale.",
    href: "/servicii/consultanta",
  },
  {
    id: "fallback-5",
    image: "/IMG_2843.PNG",
    title: "Programe integrate de sprijin",
    description: "Servicii combinate, coordonate printr-un singur punct de contact.",
    href: "/servicii/multisplit",
  },
  {
    id: "fallback-6",
    image: "/IMG_2842.PNG",
    title: "Parteneriate instituționale",
    description: "Soluții de accesibilitate pentru instituții, companii și autorități publice.",
    href: "/servicii/comerciale",
  },
];

const fallbackServiciiSuplimentare = [
  { id: "fallback-7", title: "Orientare & mobilitate", description: "Sesiuni de orientare spațială și deplasare independentă în siguranță." },
  { id: "fallback-8", title: "Verificări periodice", description: "Reevaluăm periodic nevoile și ajustăm planul de sprijin." },
  { id: "fallback-9", title: "Programe de voluntariat", description: "Însoțire, activități sociale și implicare comunitară constantă." },
];

const suplimentareIcons: Record<string, React.ReactNode> = {
  "Orientare & mobilitate": <Users className="w-6 h-6 sm:w-7 sm:h-7 text-primary" aria-hidden />,
  "Verificări periodice": <ShieldCheck className="w-6 h-6 sm:w-7 sm:h-7 text-primary" aria-hidden />,
  "Programe de voluntariat": <HandHeart className="w-6 h-6 sm:w-7 sm:h-7 text-primary" aria-hidden />,
};

const genericServiceIcon = <HeartHandshake className="w-6 h-6 sm:w-7 sm:h-7 text-primary" aria-hidden />;

async function getServicesByCategorie() {
  try {
    const services = await prisma.service.findMany({ orderBy: [{ section: "asc" }, { order: "asc" }] });
    if (services.length === 0) throw new Error("empty");
    return {
      principale: services.filter((s) => s.section === "principale"),
      avansate: services.filter((s) => s.section === "avansate"),
      suplimentare: services.filter((s) => s.section === "suplimentare"),
    };
  } catch {
    return {
      principale: fallbackServiciiPrincipale,
      avansate: fallbackServiciiAvansate,
      suplimentare: fallbackServiciiSuplimentare,
    };
  }
}

export default async function ServiciiPage() {
  const { serviciiEnabled } = await getSectionFlags();
  if (!serviciiEnabled) notFound();

  const { principale, avansate, suplimentare: serviciiSuplimentare } = await getServicesByCategorie();
  const serviciiToate = [...principale, ...avansate];

  return (
    <div className="bg-background">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="relative h-[70vw] max-h-[420px] min-h-[280px] sm:h-[45vh] sm:min-h-[320px]">
          <Image
            src="/IMG_2851.PNG"
            alt=""
            fill
            className="object-cover object-center"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background from-10% via-background/70 via-40% to-transparent to-75%" />
          <div className="absolute inset-0 flex flex-col justify-center max-w-7xl mx-auto px-5 sm:px-6 lg:px-12">
            <nav aria-label="Fir de ariadnă" className="flex items-center gap-1.5 text-xs sm:text-sm text-muted-foreground mb-4">
              <Link href="/" className="hover:text-accent transition-colors rounded">Acasă</Link>
              <span aria-hidden>›</span>
              <span className="text-foreground font-medium">Servicii</span>
            </nav>
            <p className="text-accent text-xs font-bold tracking-widest uppercase mb-3">Servicii</p>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight tracking-tight mb-4 text-primary max-w-lg">
              Sprijin real, <span className="text-accent">la fiecare pas.</span>
            </h1>
            <p className="text-sm sm:text-base text-foreground/80 leading-relaxed max-w-sm">
              Oferim servicii complete de sprijin, orientare și asistență pentru persoanele
              nevăzătoare și cu deficiențe de vedere din Moldova.
            </p>
          </div>
        </div>
      </section>

      {/* Servicii principale */}
      <section className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-12 pt-12 pb-14">
        <p className="text-xs font-bold tracking-widest uppercase text-accent mb-2">Serviciile noastre</p>
        <h2 className="text-2xl sm:text-3xl font-bold text-primary tracking-tight mb-8">
          Cu ce te putem ajuta
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-6">
          {serviciiToate.map((s) => (
            <Link
              key={s.id}
              href={s.href ?? "/servicii"}
              className="group flex flex-col rounded-2xl bg-card border border-border overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
            >
              <div className="relative" style={{ aspectRatio: "1/1" }}>
                {s.image && (
                  <Image
                    src={s.image}
                    alt=""
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                )}
              </div>
              <div className="px-3 sm:px-6 pt-3 sm:pt-4 pb-4 sm:pb-8 flex flex-col gap-2 sm:gap-4">
                <h3 className="text-sm sm:text-base font-bold text-foreground group-hover:text-accent transition-colors leading-snug">
                  {s.title}
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">{s.description}</p>
                <span className="text-accent text-[11px] sm:text-xs font-bold flex items-center gap-1 group-hover:gap-2 transition-all mt-1 uppercase tracking-wide">
                  Află mai multe
                  <ArrowRight className="w-3.5 h-3.5" aria-hidden />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <MotifDivider />

      {/* Servicii suplimentare */}
      <section className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-12 pb-14">
        <p className="text-xs font-bold tracking-widest uppercase text-accent mb-2">Servicii suplimentare</p>
        <h2 className="text-2xl sm:text-3xl font-bold text-primary tracking-tight mb-8">
          Alte forme de sprijin
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-6">
          {serviciiSuplimentare.map((s) => (
            <div key={s.id} className="flex items-start gap-3 sm:gap-4 p-4 sm:p-5 bg-card border border-border rounded-2xl hover:shadow-sm transition-shadow">
              <div className="shrink-0 w-11 sm:w-14 h-11 sm:h-14 bg-secondary/30 rounded-xl flex items-center justify-center">
                {suplimentareIcons[s.title] ?? genericServiceIcon}
              </div>
              <div className="min-w-0">
                <p className="font-bold text-sm mb-1 text-foreground">{s.title}</p>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">{s.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Banner */}
      <section className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-12 pb-16">
        <div className="bg-primary rounded-2xl px-6 sm:px-8 py-8 sm:py-10 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-12 h-12 bg-accent rounded-full flex items-center justify-center shrink-0">
              <Wrench className="w-6 h-6 text-white" aria-hidden />
            </div>
            <div>
              <p className="text-white font-bold text-lg">Ai nevoie de sprijin acum?</p>
              <p className="text-white/70 text-sm mt-0.5">Echipa noastră este pregătită să te asculte.</p>
            </div>
          </div>
          <Button asChild variant="accent" size="lg" className="shrink-0">
            <Link href="/contact">
              Contactează-ne
              <ArrowRight className="w-4 h-4" aria-hidden />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
