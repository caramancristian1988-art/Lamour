import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Retur produse | Climat Rapid",
  description: "Politica de retur a produselor Climat Rapid. Află condițiile și procedura de returnare a produselor.",
};

export default function ReturPage() {
  return (
    <main className="bg-white min-h-screen">
      <div className="max-w-3xl mx-auto px-4 py-10 sm:py-14">
        <nav className="flex items-center gap-1.5 text-xs text-gray-400 mb-6">
          <Link href="/" className="hover:text-[#c7092b] transition-colors">Acasă</Link>
          <span>›</span>
          <Link href="/livrare" className="hover:text-[#c7092b] transition-colors">Livrare și plată</Link>
          <span>›</span>
          <span className="text-gray-600">Retur produse</span>
        </nav>

        <p className="text-[#c7092b] text-[11px] font-extrabold tracking-widest uppercase mb-3">Informații comandă</p>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#1d2353] leading-tight mb-3">
          Retur produse
        </h1>
        <p className="text-gray-500 text-[15px] leading-relaxed mb-10">
          Satisfacția ta este prioritatea noastră. Dacă din orice motiv nu ești mulțumit de produsul achiziționat,
          îți explicăm mai jos procedura de retur.
        </p>

        <div className="space-y-8 text-gray-600 text-sm leading-relaxed">

          <section className="bg-green-50 border border-green-100 rounded-2xl p-5">
            <div className="flex items-center gap-3 mb-2">
              <svg className="w-5 h-5 text-green-600 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h2 className="font-extrabold text-[#1d2353] text-base">Dreptul de retur — 14 zile</h2>
            </div>
            <p>
              Conform legislației Republicii Moldova, ai dreptul să returnezi un produs în termen de <strong>14 zile
              calendaristice</strong> de la data recepționării, fără a fi necesară o justificare.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-extrabold text-[#1d2353] mb-3">Condiții de retur</h2>
            <ul className="space-y-2">
              {[
                "Produsul nu a fost utilizat și nu prezintă urme de folosire",
                "Produsul se află în ambalajul original, complet, cu toate accesoriile și documentele",
                "Nu a trecut mai mult de 14 zile de la data primirii produsului",
                "Produsul nu a fost instalat (instalarea anulează dreptul de retur pentru motive de preferință)",
              ].map((cond, i) => (
                <li key={i} className="flex items-start gap-2.5">
                  <svg className="w-4 h-4 text-[#c7092b] mt-0.5 shrink-0" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>{cond}</span>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-extrabold text-[#1d2353] mb-3">Produse care nu pot fi returnate</h2>
            <ul className="space-y-2">
              {[
                "Produse care au fost instalate sau utilizate",
                "Produse deteriorate din vina clientului",
                "Produse cu ambalajul deteriorat sau lipsă",
                "Produse personalizate sau comandate special",
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-2.5">
                  <svg className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-extrabold text-[#1d2353] mb-4">Procedura de retur</h2>
            <ol className="space-y-4">
              {[
                { nr: "01", title: "Contactează-ne", desc: "Trimite-ne un mesaj prin pagina de contact sau sună-ne, indicând numărul comenzii și motivul returului." },
                { nr: "02", title: "Confirmare", desc: "Un reprezentant Climat Rapid te va contacta în maxim 24 de ore pentru a confirma returnarea." },
                { nr: "03", title: "Returnarea produsului", desc: "Produsul se poate returna la sediul nostru sau prin curier (costul transportului de retur este suportat de client)." },
                { nr: "04", title: "Rambursarea sumei", desc: "Suma achitată va fi rambursată în termen de 14 zile de la primirea și verificarea produsului returnat." },
              ].map((step) => (
                <li key={step.nr} className="flex items-start gap-4">
                  <span className="w-9 h-9 rounded-full bg-[#1d2353] text-white text-xs font-extrabold flex items-center justify-center shrink-0">{step.nr}</span>
                  <div>
                    <p className="font-bold text-[#1d2353] text-sm">{step.title}</p>
                    <p className="text-gray-500 mt-0.5">{step.desc}</p>
                  </div>
                </li>
              ))}
            </ol>
          </section>

          <section>
            <h2 className="text-lg font-extrabold text-[#1d2353] mb-3">Produse defecte / în garanție</h2>
            <p>
              Dacă produsul prezintă defecțiuni de fabricație, este acoperit de garanție conform termenelor
              producătorului. În cazul unui produs defect, contactează-ne și un tehnician va evalua situația.
              Reparația sau înlocuirea se efectuează gratuit în perioada de garanție.
            </p>
          </section>

        </div>

        <div className="mt-10 bg-[#f8fafc] rounded-2xl p-6 border border-gray-100">
          <p className="font-bold text-[#1d2353] mb-1 text-sm">Ai nevoie de ajutor cu returul?</p>
          <p className="text-sm text-gray-500 mb-4">Echipa noastră îți răspunde rapid.</p>
          <Link
            href="/contact"
            className="inline-flex items-center bg-[#c7092b] hover:bg-[#a5071f] text-white font-bold px-6 py-3 rounded-xl transition-colors text-sm uppercase tracking-wide"
          >
            Contactează-ne
          </Link>
        </div>

        <div className="mt-8 border-t border-gray-100 pt-8 flex flex-col sm:flex-row gap-4">
          <Link href="/livrare" className="text-sm text-[#c7092b] hover:underline font-medium">
            ← Livrare și plată
          </Link>
          <Link href="/termeni" className="text-sm text-[#c7092b] hover:underline font-medium">
            Termeni și condiții →
          </Link>
        </div>
      </div>
    </main>
  );
}
