import type { Metadata } from "next";
import { SITE_NAME } from "@/lib/constants";
import DivisionHero from "@/app/components/division/DivisionHero";
import ContactForm from "@/app/components/ContactForm";
import JsonLd from "@/app/components/JsonLd";
import { breadcrumbList } from "@/lib/structuredData";
import { absoluteUrl } from "@/lib/seo";

const TITLE = `Fabricație la comandă și ambalaje | ${SITE_NAME}`;
const DESCRIPTION = `Producție sub marcă proprie (private label), fabricație la comandă și servicii de ambalare, de la ${SITE_NAME}.`;

export const metadata: Metadata = {
  title: { absolute: TITLE },
  description: DESCRIPTION,
  alternates: { canonical: absoluteUrl("/productie-la-comanda") },
  openGraph: { title: TITLE, description: DESCRIPTION, url: absoluteUrl("/productie-la-comanda") },
  twitter: { title: TITLE, description: DESCRIPTION },
};

export default function ProductieLaComandaPage() {
  return (
    <main className="bg-background">
      <JsonLd data={breadcrumbList([{ name: "Acasă", path: "/" }, { name: "Fabricație la comandă", path: "/productie-la-comanda" }])} />
      <DivisionHero
        breadcrumbLabel="Fabricație la comandă"
        eyebrow="Fabricație la comandă & Ambalaje"
        title="Producție sub marcă proprie"
        highlighted="și servicii de ambalare"
        description="Punem la dispoziție capacitatea noastră de producție pentru comenzi personalizate — private label, fabricație la comandă și ambalare — pentru parteneri și distribuitori."
        image="https://placehold.co/800x600/710808/ffffff?text=Fabricatie+la+comanda"
        primaryCta={{ label: "Cere o ofertă", href: "#contact" }}
      />

      <section className="py-12 lg:py-16 border-t border-border">
        <div className="max-w-3xl mx-auto px-5 sm:px-6 text-center">
          <p className="text-accent text-xs font-bold tracking-widest uppercase mb-3">Despre divizie</p>
          <h2 className="text-2xl sm:text-3xl font-bold text-primary tracking-tight mb-6">
            Capacitate de producție pentru comenzi personalizate
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
            Oferim servicii de fabricație la comandă și ambalare pentru parteneri care au nevoie de un
            producător de încredere — de la producție sub marcă proprie (private label), până la comenzi
            speciale de volum. Conținutul complet al acestei secțiuni (capacități, linii de producție,
            exemple de proiecte) este în curs de pregătire.
          </p>
        </div>
      </section>

      <section id="contact" className="max-w-3xl mx-auto px-5 sm:px-6 pb-16">
        <h2 className="text-2xl font-bold text-primary tracking-tight mb-6 text-center">Cere o ofertă</h2>
        <ContactForm />
      </section>
    </main>
  );
}
