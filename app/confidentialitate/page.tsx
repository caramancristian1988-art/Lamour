import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Politica de confidențialitate | Climat Rapid",
  description: "Politica de confidențialitate a companiei Climat Rapid. Află cum colectăm, utilizăm și protejăm datele tale personale.",
};

export default function ConfidentialitatePage() {
  return (
    <main className="bg-white min-h-screen">
      <div className="max-w-3xl mx-auto px-4 py-10 sm:py-14">
        <nav className="flex items-center gap-1.5 text-xs text-gray-400 mb-6">
          <Link href="/" className="hover:text-[#c7092b] transition-colors">Acasă</Link>
          <span>›</span>
          <span className="text-gray-600">Politica de confidențialitate</span>
        </nav>

        <p className="text-[#c7092b] text-[11px] font-extrabold tracking-widest uppercase mb-3">Legal</p>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#1d2353] leading-tight mb-3">
          Politica de confidențialitate
        </h1>
        <p className="text-sm text-gray-400 mb-10">Ultima actualizare: ianuarie 2025</p>

        <div className="prose prose-sm max-w-none text-gray-600 space-y-8">

          <section>
            <h2 className="text-lg font-extrabold text-[#1d2353] mb-3">1. Cine suntem</h2>
            <p>
              Climat Rapid este o companie cu sediul în Republica Moldova, specializată în vânzarea, instalarea și
              mentenanța sistemelor de climatizare. Puteți lua legătura cu noi prin intermediul paginii{" "}
              <Link href="/contact" className="text-[#c7092b] hover:underline">Contact</Link>.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-extrabold text-[#1d2353] mb-3">2. Ce date colectăm</h2>
            <p>Colectăm datele pe care ni le furnizați direct, prin intermediul formularelor de pe site:</p>
            <ul className="list-disc pl-5 mt-3 space-y-1">
              <li><strong>Nume și prenume</strong> — pentru identificarea și personalizarea comunicării</li>
              <li><strong>Număr de telefon</strong> — pentru confirmarea comenzilor și servicii de asistență</li>
              <li><strong>Adresă de e-mail</strong> — pentru confirmări și comunicare</li>
              <li><strong>Mesajul transmis</strong> — conținutul cererii sau întrebării dumneavoastră</li>
            </ul>
            <p className="mt-3">
              Nu colectăm date de plată (carduri bancare). Tranzacțiile se efectuează prin metode sigure, externe site-ului.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-extrabold text-[#1d2353] mb-3">3. Cum utilizăm datele</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>Procesarea și confirmarea comenzilor și cererilor de ofertă</li>
              <li>Comunicarea cu dumneavoastră privind serviciile solicitate</li>
              <li>Îmbunătățirea calității serviciilor noastre</li>
              <li>Trimiterea de informații despre oferte, dacă v-ați abonat la newsletter</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-extrabold text-[#1d2353] mb-3">4. Temeiul legal</h2>
            <p>
              Prelucrarea datelor personale se realizează în conformitate cu Legea nr. 133/2011 privind protecția
              datelor cu caracter personal din Republica Moldova, pe baza:
            </p>
            <ul className="list-disc pl-5 mt-3 space-y-1">
              <li>Consimțământului dumneavoastră (formulare de contact, newsletter)</li>
              <li>Executării unui contract sau a unor măsuri precontractuale (comenzi, cereri de ofertă)</li>
              <li>Interesului nostru legitim în îmbunătățirea serviciilor</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-extrabold text-[#1d2353] mb-3">5. Partajarea datelor</h2>
            <p>Nu vindem și nu închiriem datele dumneavoastră personale. Datele pot fi accesate de:</p>
            <ul className="list-disc pl-5 mt-3 space-y-1">
              <li>Echipa internă Climat Rapid, pentru procesarea cererilor</li>
              <li>Furnizori de servicii tehnice (hosting, notificări interne), strict în scopul funcționării site-ului</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-extrabold text-[#1d2353] mb-3">6. Perioada de stocare</h2>
            <p>
              Păstrăm datele dumneavoastră atât timp cât este necesar pentru scopul pentru care au fost colectate
              sau conform obligațiilor legale, dar nu mai mult de 3 ani de la ultima interacțiune.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-extrabold text-[#1d2353] mb-3">7. Drepturile dumneavoastră</h2>
            <p>Aveți dreptul să:</p>
            <ul className="list-disc pl-5 mt-3 space-y-1">
              <li>Accesați datele personale pe care le deținem despre dumneavoastră</li>
              <li>Rectificați datele inexacte</li>
              <li>Solicitați ștergerea datelor</li>
              <li>Vă retrageți consimțământul în orice moment</li>
              <li>Depuneți o plângere la autoritatea de supraveghere competentă</li>
            </ul>
            <p className="mt-3">
              Pentru exercitarea acestor drepturi, ne puteți contacta prin pagina{" "}
              <Link href="/contact" className="text-[#c7092b] hover:underline">Contact</Link>.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-extrabold text-[#1d2353] mb-3">8. Cookie-uri</h2>
            <p>
              Site-ul nostru poate utiliza cookie-uri tehnice esențiale pentru funcționare (sesiune, coș de cumpărături,
              preferințe). Nu utilizăm cookie-uri de tracking sau publicitate fără acordul dumneavoastră.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-extrabold text-[#1d2353] mb-3">9. Modificări ale politicii</h2>
            <p>
              Ne rezervăm dreptul de a actualiza această politică. Orice modificare semnificativă va fi comunicată
              prin site. Vă recomandăm să consultați periodic această pagină.
            </p>
          </section>

        </div>

        <div className="mt-12 border-t border-gray-100 pt-8 flex flex-col sm:flex-row gap-4">
          <Link href="/termeni" className="text-sm text-[#c7092b] hover:underline font-medium">
            Termeni și condiții →
          </Link>
          <Link href="/contact" className="text-sm text-[#c7092b] hover:underline font-medium">
            Contactează-ne →
          </Link>
        </div>
      </div>
    </main>
  );
}
