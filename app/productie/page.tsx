import type { Metadata } from "next";
import { Award, BadgeCheck, ShieldCheck, CheckCircle2 } from "lucide-react";
import { SITE_NAME } from "@/lib/constants";
import DivisionHero from "@/app/components/division/DivisionHero";
import DivisionGallery from "@/app/components/division/DivisionGallery";
import DivisionCta from "@/app/components/division/DivisionCta";
import ContactForm from "@/app/components/ContactForm";

export const metadata: Metadata = {
  title: `Producție | ${SITE_NAME}`,
  description: `Fabrica, echipamentele, liniile de producție și certificările ${SITE_NAME}.`,
};

const galleryPhotos = [
  { label: "Linia de producție", color: "9D5654" },
  { label: "Utilaje moderne", color: "710808" },
  { label: "Control calitate", color: "D8B2B1" },
  { label: "Depozitare și livrare", color: "9D5654" },
];

const certifications = [
  { icon: Award, label: "ISO 9001" },
  { icon: ShieldCheck, label: "Control calitate" },
  { icon: BadgeCheck, label: "Made in Moldova" },
  { icon: CheckCircle2, label: "Materie primă certificată" },
];

export default function ProductiePage() {
  return (
    <main className="bg-background">
      <DivisionHero
        breadcrumbLabel="Producție"
        eyebrow="Fabrica noastră"
        title="De la materie primă,"
        highlighted="la produsul finit"
        description="Producem în Moldova, cu echipamente moderne și control riguros al calității — de la materia primă, până la produsul ambalat și livrat."
        image="https://placehold.co/800x600/710808/ffffff?text=Fabrica+Lamour"
        primaryCta={{ label: "Cere detalii de producție", href: "#contact" }}
        secondaryCta={{ label: "Vezi fabrica", href: "#galerie" }}
      />

      <div id="galerie">
        <DivisionGallery eyebrow="Fabrica noastră" title="Echipamente și linii de producție" photos={galleryPhotos} />
      </div>

      <section className="py-12 lg:py-16">
        <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-12">
          <div className="text-center mb-10">
            <p className="text-accent text-xs font-bold tracking-widest uppercase mb-3">Certificări</p>
            <h2 className="text-2xl sm:text-3xl font-bold text-primary tracking-tight">Calitate verificată la fiecare pas</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {certifications.map((c) => (
              <div
                key={c.label}
                className="flex flex-col items-center text-center gap-3 bg-card border border-border rounded-2xl p-6"
              >
                <c.icon className="w-8 h-8 text-primary" aria-hidden />
                <p className="text-sm font-bold text-foreground">{c.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <DivisionCta
        title="Vrei să afli mai multe despre capacitatea noastră de producție?"
        description="Scrie-ne și discutăm despre o posibilă colaborare."
        ctaLabel="Contactează-ne"
        ctaHref="#contact"
      />

      <section id="contact" className="max-w-3xl mx-auto px-5 sm:px-6 pb-16">
        <h2 className="text-2xl font-bold text-primary tracking-tight mb-6 text-center">Cere detalii de producție</h2>
        <ContactForm />
      </section>
    </main>
  );
}
