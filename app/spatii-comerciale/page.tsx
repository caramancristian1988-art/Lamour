import type { Metadata } from "next";
import { SITE_NAME } from "@/lib/constants";
import DivisionHero from "@/app/components/division/DivisionHero";
import ContactForm from "@/app/components/ContactForm";

export const metadata: Metadata = {
  title: `Spații comerciale | ${SITE_NAME}`,
  description: `Birouri, depozite și spații industriale disponibile spre închiriere, de la ${SITE_NAME}.`,
};

export default function SpatiiComercialePage() {
  return (
    <main className="bg-background">
      <DivisionHero
        breadcrumbLabel="Spații comerciale"
        eyebrow="Spații comerciale și industriale"
        title="Birouri, depozite"
        highlighted="și spații industriale"
        description="Punem la dispoziție spre închiriere birouri, depozite și spații industriale, potrivite pentru afaceri de diverse dimensiuni."
        image="https://placehold.co/800x600/D8B2B1/652F37?text=Spatii+comerciale"
        primaryCta={{ label: "Cere detalii de închiriere", href: "#contact" }}
      />

      <section className="py-12 lg:py-16 border-t border-border">
        <div className="max-w-3xl mx-auto px-5 sm:px-6 text-center">
          <p className="text-accent text-xs font-bold tracking-widest uppercase mb-3">Despre divizie</p>
          <h2 className="text-2xl sm:text-3xl font-bold text-primary tracking-tight mb-6">
            Spații disponibile pentru afacerea ta
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
            Deținem și administrăm spații comerciale și industriale — birouri, depozite și hale — pe care le
            oferim spre închiriere. Lista completă de spații disponibile, cu suprafețe și fotografii, este
            în curs de pregătire. Până atunci, scrie-ne cu cerințele tale și revenim cu opțiuni potrivite.
          </p>
        </div>
      </section>

      <section id="contact" className="max-w-3xl mx-auto px-5 sm:px-6 pb-16">
        <h2 className="text-2xl font-bold text-primary tracking-tight mb-6 text-center">Cere detalii de închiriere</h2>
        <ContactForm />
      </section>
    </main>
  );
}
