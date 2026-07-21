import Link from "next/link";
import type { Metadata } from "next";
import { SITE_NAME } from "@/lib/constants";
import JsonLd from "@/app/components/JsonLd";
import { breadcrumbList } from "@/lib/structuredData";
import { absoluteUrl } from "@/lib/seo";

const TITLE = `Termeni și condiții | ${SITE_NAME}`;
const DESCRIPTION = `Termenii și condițiile de utilizare a site-ului și de accesare a produselor și serviciilor ${SITE_NAME}.`;

export const metadata: Metadata = {
  title: { absolute: TITLE },
  description: DESCRIPTION,
  alternates: { canonical: absoluteUrl("/termeni") },
  openGraph: { title: TITLE, description: DESCRIPTION, url: absoluteUrl("/termeni") },
  twitter: { title: TITLE, description: DESCRIPTION },
};

export default function TermeniPage() {
  return (
    <main className="bg-background min-h-screen">
      <JsonLd data={breadcrumbList([{ name: "Acasă", path: "/" }, { name: "Termeni și condiții", path: "/termeni" }])} />
      <div className="max-w-3xl mx-auto px-5 sm:px-6 py-10 sm:py-14">
        <nav aria-label="Fir de ariadnă" className="flex items-center gap-1.5 text-xs sm:text-sm text-muted-foreground mb-6">
          <Link href="/" className="hover:text-accent transition-colors rounded">Acasă</Link>
          <span aria-hidden>›</span>
          <span className="text-foreground font-medium">Termeni și condiții</span>
        </nav>

        <p className="text-accent text-xs font-bold tracking-widest uppercase mb-3">Legal</p>
        <h1 className="text-3xl sm:text-4xl font-bold text-primary leading-tight tracking-tight mb-3">
          Termeni și condiții
        </h1>
        <p className="text-sm text-muted-foreground mb-10">Ultima actualizare: ianuarie 2025</p>

        <div className="space-y-8 text-[15px] leading-[1.8] text-foreground/85">

          <section>
            <h2 className="text-lg font-bold text-primary mb-3">1. Dispoziții generale</h2>
            <p>
              Prin utilizarea acestui site și prin transmiterea de cereri sau comenzi, acceptați în mod expres
              termenii și condițiile de mai jos. {SITE_NAME} își rezervă dreptul de a modifica acești termeni în
              orice moment, modificările intrând în vigoare de la data publicării pe site.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-primary mb-3">2. Produse și prețuri</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>Toate prețurile sunt exprimate în lei moldovenești (MDL) și includ TVA, acolo unde este aplicabil.</li>
              <li>Ne rezervăm dreptul de a modifica prețurile fără notificare prealabilă.</li>
              <li>Imaginile produselor sunt cu titlu ilustrativ. Aspectul real poate diferi ușor.</li>
              <li>Disponibilitatea produselor este indicativă și se confirmă la procesarea comenzii.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-primary mb-3">3. Plasarea comenzilor și cererilor</h2>
            <p>
              Comenzile și cererile de sprijin se pot plasa online prin completarea formularului de pe site sau
              telefonic. O comandă sau cerere este considerată confirmată după ce un reprezentant al echipei
              noastre vă contactează și confirmă detaliile.
            </p>
            <p className="mt-3">
              Ne rezervăm dreptul de a refuza sau anula o comandă în cazul în care produsul nu este disponibil,
              prețul a fost afișat eronat sau există motive întemeiate.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-primary mb-3">4. Livrare</h2>
            <p>
              Livrăm produse în Chișinău și în toată Republica Moldova. Pentru detalii privind termenele și
              costurile de livrare, te rugăm să ne{" "}
              <Link href="/contact" className="text-accent hover:underline">contactezi</Link>.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-primary mb-3">5. Modalități de plată</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>Numerar la livrare</li>
              <li>Transfer bancar</li>
              <li>Card bancar (online sau la sediu)</li>
            </ul>
            <p className="mt-3">
              Plata în rate poate fi disponibilă prin parteneri bancari. Contactați-ne pentru detalii.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-primary mb-3">6. Garanție</h2>
            <p>
              Toate produsele oferite prin intermediul site-ului beneficiază de garanție conform legislației
              în vigoare și specificațiilor producătorului (minim 12 luni). Garanția acoperă defecțiunile de
              fabricație și nu se aplică în cazul deteriorărilor cauzate de utilizarea necorespunzătoare sau
              intervenții neautorizate.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-primary mb-3">7. Retur</h2>
            <p>
              Aveți dreptul de a returna produsul în termen de 14 zile de la primire, dacă nu a fost utilizat
              și se află în ambalajul original. Pentru a iniția un retur,{" "}
              <Link href="/contact" className="text-accent hover:underline">contactează-ne</Link>.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-primary mb-3">8. Servicii de sprijin</h2>
            <p>
              Serviciile de sprijin sunt prestate de echipa și voluntarii {SITE_NAME}. Beneficiarul este
              responsabil de furnizarea informațiilor necesare pentru derularea corectă a serviciului.
              Garanția lucrărilor de instalare sau montaj este de 12 luni de la data efectuării.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-primary mb-3">9. Proprietate intelectuală</h2>
            <p>
              Conținutul acestui site (texte, imagini, logo-uri, design) este proprietatea {SITE_NAME} și este
              protejat de legislația privind drepturile de autor. Reproducerea parțială sau totală fără acordul
              scris al organizației este interzisă.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-primary mb-3">10. Litigii</h2>
            <p>
              Orice litigiu apărut în legătură cu utilizarea site-ului sau cu produsele/serviciile accesate se
              va soluționa pe cale amiabilă. În caz contrar, instanțele competente din Republica Moldova vor fi
              sesizate. Legislația aplicabilă este cea a Republicii Moldova.
            </p>
          </section>

        </div>

        <div className="mt-12 border-t border-border pt-8 flex flex-col sm:flex-row gap-4">
          <Link href="/confidentialitate" className="text-sm text-accent hover:underline font-medium">
            Politica de confidențialitate →
          </Link>
          <Link href="/contact" className="text-sm text-accent hover:underline font-medium">
            Contactează-ne →
          </Link>
        </div>
      </div>
    </main>
  );
}
