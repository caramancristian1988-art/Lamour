import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Termeni și condiții | Climat Rapid",
  description: "Termenii și condițiile de utilizare a site-ului și de achiziție a produselor și serviciilor Climat Rapid.",
};

export default function TermeniPage() {
  return (
    <main className="bg-white min-h-screen">
      <div className="max-w-3xl mx-auto px-4 py-10 sm:py-14">
        <nav className="flex items-center gap-1.5 text-xs text-gray-400 mb-6">
          <Link href="/" className="hover:text-[#c7092b] transition-colors">Acasă</Link>
          <span>›</span>
          <span className="text-gray-600">Termeni și condiții</span>
        </nav>

        <p className="text-[#c7092b] text-[11px] font-extrabold tracking-widest uppercase mb-3">Legal</p>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#1d2353] leading-tight mb-3">
          Termeni și condiții
        </h1>
        <p className="text-sm text-gray-400 mb-10">Ultima actualizare: ianuarie 2025</p>

        <div className="prose prose-sm max-w-none text-gray-600 space-y-8">

          <section>
            <h2 className="text-lg font-extrabold text-[#1d2353] mb-3">1. Dispoziții generale</h2>
            <p>
              Prin utilizarea site-ului climatrapid.md și prin plasarea comenzilor, acceptați în mod expres termenii
              și condițiile de mai jos. Climat Rapid își rezervă dreptul de a modifica acești termeni în orice moment,
              modificările intrând în vigoare de la data publicării pe site.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-extrabold text-[#1d2353] mb-3">2. Produse și prețuri</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>Toate prețurile sunt exprimate în lei moldovenești (MDL) și includ TVA, acolo unde este aplicabil.</li>
              <li>Climat Rapid își rezervă dreptul de a modifica prețurile fără notificare prealabilă.</li>
              <li>Imaginile produselor sunt cu titlu ilustrativ. Aspectul real poate diferi ușor.</li>
              <li>Disponibilitatea produselor este indicativă și se confirmă la procesarea comenzii.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-extrabold text-[#1d2353] mb-3">3. Plasarea comenzilor</h2>
            <p>
              Comenzile se pot plasa online prin completarea formularului de comandă sau telefonic. O comandă este
              considerată confirmată după ce un reprezentant Climat Rapid vă contactează și confirmă disponibilitatea
              produsului și detaliile livrării.
            </p>
            <p className="mt-3">
              Climat Rapid poate refuza sau anula o comandă în cazul în care produsul nu este disponibil, prețul a
              fost afișat eronat sau există motive întemeiate.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-extrabold text-[#1d2353] mb-3">4. Livrare</h2>
            <p>
              Livrăm produse în Chișinău și în toată Republica Moldova. Pentru detalii privind termenele și
              costurile de livrare, te rugăm să ne{" "}
              <Link href="/contact" className="text-[#c7092b] hover:underline">contactezi</Link>.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-extrabold text-[#1d2353] mb-3">5. Modalități de plată</h2>
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
            <h2 className="text-lg font-extrabold text-[#1d2353] mb-3">6. Garanție</h2>
            <p>
              Toate produsele comercializate de Climat Rapid beneficiază de garanție conform legislației în vigoare
              și specificațiilor producătorului (minim 12 luni). Garanția acoperă defecțiunile de fabricație și nu
              se aplică în cazul deteriorărilor cauzate de utilizarea necorespunzătoare sau intervenții neautorizate.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-extrabold text-[#1d2353] mb-3">7. Retur</h2>
            <p>
              Clientul are dreptul de a returna produsul în termen de 14 zile de la primire, dacă nu a fost utilizat
              și se află în ambalajul original. Pentru a iniția un retur,{" "}
              <Link href="/contact" className="text-[#c7092b] hover:underline">contactează-ne</Link>.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-extrabold text-[#1d2353] mb-3">8. Servicii de instalare</h2>
            <p>
              Serviciile de instalare se prestează de tehnicienii autorizați Climat Rapid. Clientul este responsabil
              de asigurarea accesului și condițiilor necesare pentru instalare. Garanția instalației este de 12 luni
              de la data efectuării lucrărilor.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-extrabold text-[#1d2353] mb-3">9. Proprietate intelectuală</h2>
            <p>
              Conținutul acestui site (texte, imagini, logo-uri, design) este proprietatea Climat Rapid și este
              protejat de legislația privind drepturile de autor. Reproducerea parțială sau totală fără acordul
              scris al Climat Rapid este interzisă.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-extrabold text-[#1d2353] mb-3">10. Litigii</h2>
            <p>
              Orice litigiu apărut în legătură cu utilizarea site-ului sau cu produsele/serviciile achiziționate se
              va soluționa pe cale amiabilă. În caz contrar, instanțele competente din Republica Moldova vor fi
              sesizate. Legislația aplicabilă este cea a Republicii Moldova.
            </p>
          </section>

        </div>

        <div className="mt-12 border-t border-gray-100 pt-8 flex flex-col sm:flex-row gap-4">
          <Link href="/confidentialitate" className="text-sm text-[#c7092b] hover:underline font-medium">
            Politica de confidențialitate →
          </Link>
          <Link href="/contact" className="text-sm text-[#c7092b] hover:underline font-medium">
            Contactează-ne →
          </Link>
        </div>
      </div>
    </main>
  );
}
