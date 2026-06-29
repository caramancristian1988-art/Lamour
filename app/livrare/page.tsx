import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Livrare și plată | Climat Rapid",
  description: "Informații despre livrarea produselor Climat Rapid, modalitățile de plată și costurile de transport în Republica Moldova.",
};

function InfoCard({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div className="bg-[#f8fafc] border border-gray-100 rounded-2xl p-5">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-xl bg-[#fdf2f3] flex items-center justify-center text-[#c7092b] shrink-0">
          {icon}
        </div>
        <h3 className="font-extrabold text-[#1d2353] text-sm">{title}</h3>
      </div>
      <div className="text-sm text-gray-600 leading-relaxed space-y-1">{children}</div>
    </div>
  );
}

export default function LivrarePage() {
  return (
    <main className="bg-white min-h-screen">
      <div className="max-w-3xl mx-auto px-4 py-10 sm:py-14">
        <nav className="flex items-center gap-1.5 text-xs text-gray-400 mb-6">
          <Link href="/" className="hover:text-[#c7092b] transition-colors">Acasă</Link>
          <span>›</span>
          <span className="text-gray-600">Livrare și plată</span>
        </nav>

        <p className="text-[#c7092b] text-[11px] font-extrabold tracking-widest uppercase mb-3">Informații comandă</p>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#1d2353] leading-tight mb-3">
          Livrare și plată
        </h1>
        <p className="text-gray-500 text-[15px] leading-relaxed mb-10">
          Livrăm produse în toată Republica Moldova. Mai jos găsești toate detaliile despre livrare, plată și instalare.
        </p>

        {/* Cards grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
          <InfoCard
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            }
            title="Zone de livrare"
          >
            <p>Livrăm în <strong>Chișinău</strong> și în toate localitățile din <strong>Republica Moldova</strong>.</p>
          </InfoCard>

          <InfoCard
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
            title="Termen de livrare"
          >
            <p><strong>Chișinău:</strong> 1–2 zile lucrătoare</p>
            <p><strong>Alte localități:</strong> 2–5 zile lucrătoare</p>
          </InfoCard>

          <InfoCard
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
            }
            title="Modalități de plată"
          >
            <p>• Numerar la livrare</p>
            <p>• Card bancar</p>
            <p>• Transfer bancar</p>
            <p>• Rate prin parteneri bancari</p>
          </InfoCard>

          <InfoCard
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
              </svg>
            }
            title="Cost livrare"
          >
            <p><strong>Chișinău:</strong> gratuită pentru comenzi peste 1 500 MDL</p>
            <p><strong>Alte localități:</strong> conform tarifelor curierului</p>
            <p className="text-xs text-gray-400 mt-1">Detalii la confirmarea comenzii</p>
          </InfoCard>
        </div>

        {/* Delivery process */}
        <h2 className="text-xl font-extrabold text-[#1d2353] mb-5">Cum funcționează livrarea</h2>
        <ol className="space-y-4 mb-10">
          {[
            { nr: "01", title: "Plasezi comanda", desc: "Online prin site sau telefonic la +373 69 000 000." },
            { nr: "02", title: "Confirmare telefonică", desc: "Un consultant te contactează pentru a confirma comanda și detaliile de livrare." },
            { nr: "03", title: "Pregătire și expediere", desc: "Comanda este pregătită și expediată în termenul comunicat." },
            { nr: "04", title: "Livrare și opțional instalare", desc: "Produsul ajunge la tine. Poți solicita și serviciul de instalare profesională." },
          ].map((step) => (
            <li key={step.nr} className="flex items-start gap-4">
              <span className="w-9 h-9 rounded-full bg-[#c7092b] text-white text-xs font-extrabold flex items-center justify-center shrink-0">{step.nr}</span>
              <div>
                <p className="font-bold text-[#1d2353] text-sm">{step.title}</p>
                <p className="text-sm text-gray-500 mt-0.5">{step.desc}</p>
              </div>
            </li>
          ))}
        </ol>

        {/* Installation note */}
        <div className="bg-[#1d2353] rounded-2xl p-6 text-white mb-10">
          <h3 className="font-extrabold text-base mb-2">Serviciu de instalare</h3>
          <p className="text-white/70 text-sm leading-relaxed">
            Oferim instalare profesională realizată de tehnicieni autorizați. Prețul instalării se stabilește
            în funcție de tipul aparatului și condițiile tehnice ale locației. Contactează-ne pentru o ofertă personalizată.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center mt-4 bg-[#c7092b] hover:bg-[#a5071f] text-white font-bold px-5 py-2.5 rounded-xl transition-colors text-sm uppercase tracking-wide"
          >
            Cere ofertă instalare
          </Link>
        </div>

        <div className="border-t border-gray-100 pt-8 flex flex-col sm:flex-row gap-4">
          <Link href="/retur" className="text-sm text-[#c7092b] hover:underline font-medium">
            Politica de retur →
          </Link>
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
