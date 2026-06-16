import Image from "next/image";
import Link from "next/link";

const features = [
  {
    title: "Diagnosticare rapidă",
    desc: "Identificăm problema în cel mai scurt timp posibil.",
    icon: (
      <svg className="w-6 h-6 text-[#c7092b]" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <circle cx="11" cy="11" r="7"/><path d="M21 21l-4.35-4.35"/>
      </svg>
    ),
  },
  {
    title: "Piese originale",
    desc: "Folosim exclusiv componente originale sau certificate.",
    icon: (
      <svg className="w-6 h-6 text-[#c7092b]" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z"/>
      </svg>
    ),
  },
  {
    title: "Garanție reparație",
    desc: "Toate reparațiile sunt acoperite de garanție.",
    icon: (
      <svg className="w-6 h-6 text-[#c7092b]" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
        <path d="M9 12l2 2 4-4"/>
      </svg>
    ),
  },
  {
    title: "Suport tehnic",
    desc: "Suntem disponibili pentru orice întrebare după reparație.",
    icon: (
      <svg className="w-6 h-6 text-[#c7092b]" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <path d="M3 18v-6a9 9 0 0 1 18 0v6"/>
        <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3z"/>
        <path d="M3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"/>
      </svg>
    ),
  },
];

const inclus = [
  "Diagnosticare completă a sistemului",
  "Identificare și reparare scurgeri freon",
  "Înlocuire componente defecte",
  "Reparare plăci electronice",
  "Testare după reparație și garanție",
];

const pasi = [
  { nr: "01", title: "Apel & programare", desc: "Ne descrii problema și stabilim împreună o vizită de diagnosticare.", img: "/IMG_2838.PNG" },
  { nr: "02", title: "Diagnosticare", desc: "Tehnicianul identifică exact cauza defecțiunii și îți prezintă soluția.", img: "/IMG_2840.PNG" },
  { nr: "03", title: "Reparație", desc: "Reparăm aparatul și îl testăm complet înainte de plecare.", img: "/IMG_2848.PNG" },
];

const produse = [
  { brand: "GREE", model: "Pular 12.000 BTU", specs: "Inverter, Clasa A++", price: "8.499 MDL", oldPrice: "9.999 MDL", discount: "-15%", href: "/produse/gree-pular" },
  { brand: "MIDEA", model: "Mission 12.000 BTU", specs: "Inverter, Clasa A++", price: "7.899 MDL", oldPrice: "8.999 MDL", discount: "-12%", href: "/produse/midea-mission" },
  { brand: "AUX", model: "Freedom 12.000 BTU", specs: "Inverter, Clasa A++", price: "8.499 MDL", oldPrice: "9.499 MDL", discount: "-10%", href: "/produse/aux-freedom" },
  { brand: "TOSOT", model: "Seiya 12.000 BTU", specs: "Inverter, Clasa A++", price: "8.999 MDL", oldPrice: "10.499 MDL", discount: "-14%", href: "/produse/tosot-seiya" },
];

const testimoniale = [
  { text: "Au reparat aparatul în aceeași zi! Tehnicianul a fost foarte profesionist și a explicat tot ce a făcut.", name: "Radu M.", city: "Chișinău", initials: "RM" },
  { text: "Preț corect și transparență totală. Au prezentat oferta înainte de a începe și au respectat-o.", name: "Ioana S.", city: "Bălți", initials: "IS" },
  { text: "Am sunat dimineața și după-amiaza aparatul funcționa perfect. Recomand cu toată încrederea!", name: "Doru N.", city: "Chișinău", initials: "DN" },
];

export default function DiagnosticareReparatiiPage() {
  return (
    <div className="bg-white text-[#1d2353]">

      {/* ── HERO ── */}
      <section className="grid grid-cols-1 lg:grid-cols-2 min-h-[420px]">
        <div className="flex flex-col justify-center px-6 lg:px-12 py-12 bg-white">
          <nav className="flex items-center gap-1.5 text-xs text-gray-400 mb-5">
            <Link href="/" className="hover:text-[#c7092b] transition-colors">Acasă</Link>
            <span>›</span>
            <Link href="/servicii" className="hover:text-[#c7092b] transition-colors">Servicii</Link>
            <span>›</span>
            <span className="text-[#1d2353] font-medium">Diagnosticare & Reparații</span>
          </nav>
          <p className="text-[#c7092b] text-xs font-bold tracking-widest uppercase mb-3">SERVICIU</p>
          <h1 className="text-4xl lg:text-5xl font-extrabold leading-tight mb-4">
            Diagnosticare &<br />
            <span className="text-[#c7092b]">Reparații</span>
          </h1>
          <div className="w-10 h-[3px] bg-[#c7092b] mb-5" />
          <p className="text-sm text-gray-600 leading-relaxed max-w-xs mb-8">
            Diagnosticare rapidă și reparații profesionale pentru orice tip de defecțiune la aparatele de aer condiționat.
          </p>
          <div className="flex items-center gap-3 flex-wrap">
            <Link href="/contact" className="inline-flex items-center gap-2 bg-[#c7092b] hover:bg-[#a5071f] text-white font-bold px-6 py-3 rounded-xl text-sm uppercase tracking-wide transition-colors">
              Solicită ofertă
            </Link>
            <Link href="/servicii/diagnosticare#detalii" className="inline-flex items-center gap-2 border border-[#1d2353] text-[#1d2353] hover:bg-gray-50 font-bold px-6 py-3 rounded-xl text-sm uppercase tracking-wide transition-colors">
              Vezi detalii
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
              </svg>
            </Link>
          </div>
        </div>
        <div className="relative min-h-[280px] lg:min-h-0">
          <Image src="/IMG_2840.PNG" alt="Diagnosticare și reparații" fill className="object-cover object-center" priority />
        </div>
      </section>

      {/* ── FEATURES BAR ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-8">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 grid grid-cols-2 lg:grid-cols-4 divide-x divide-y lg:divide-y-0 divide-gray-100">
          {features.map((f) => (
            <div key={f.title} className="flex flex-col gap-2 p-6">
              {f.icon}
              <p className="font-bold text-sm text-[#1d2353] mt-1">{f.title}</p>
              <p className="text-xs text-gray-500 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── DESPRE SERVICIU ── */}
      <section id="detalii" className="max-w-7xl mx-auto px-4 sm:px-6 py-12 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div>
          <p className="text-[#c7092b] text-xs font-bold tracking-widest uppercase mb-3">DESPRE SERVICIU</p>
          <h2 className="text-2xl lg:text-3xl font-extrabold leading-snug mb-4">
            Reparăm orice<br />defecțiune rapid
          </h2>
          <div className="w-8 h-[3px] bg-[#c7092b] mb-5" />
          <p className="text-sm text-gray-500 leading-relaxed">
            Echipa noastră de tehnicieni specializați diagnostichează și repară orice tip de problemă, de la scurgeri de freon la plăci electronice defecte. Lucrăm transparent și oferim garanție pentru fiecare intervenție.
          </p>
        </div>
        <div className="flex items-stretch gap-0 rounded-2xl overflow-hidden shadow-md border border-gray-100">
          <div className="relative w-1/2 shrink-0">
            <Image src="/IMG_2848.PNG" alt="Reparații AC" fill className="object-cover object-center" />
          </div>
          <div className="flex flex-col justify-center gap-4 px-6 py-8 bg-white w-1/2">
            {inclus.map((item) => (
              <div key={item} className="flex items-start gap-3">
                <span className="text-[#c7092b] font-bold text-sm leading-none mt-0.5">✓</span>
                <span className="text-sm text-gray-700 leading-snug">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CUM LUCRĂM ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <p className="text-xs font-extrabold tracking-widest uppercase text-[#1d2353] mb-1">CUM LUCRĂM</p>
        <div className="w-8 h-[3px] bg-[#c7092b] mb-8" />
        <div className="flex flex-col sm:flex-row items-stretch gap-3">
          {pasi.map((pas, i) => (
            <div key={pas.nr} className="flex items-stretch gap-3 flex-1">
              <div className="flex items-center gap-0 rounded-xl overflow-hidden border border-gray-100 flex-1 bg-white">
                <div className="relative w-28 lg:w-36 shrink-0 self-stretch">
                  <Image src={pas.img} alt={pas.title} fill className="object-cover" />
                </div>
                <div className="px-4 py-4 flex flex-col gap-1">
                  <span className="text-2xl font-extrabold text-[#c7092b] leading-none">{pas.nr}</span>
                  <p className="font-bold text-sm mt-1">{pas.title}</p>
                  <p className="text-xs text-gray-500 leading-relaxed">{pas.desc}</p>
                </div>
              </div>
              {i < pasi.length - 1 && (
                <div className="hidden sm:flex items-center shrink-0">
                  <svg className="w-5 h-5 text-[#c7092b]" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/>
                  </svg>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ── REDUCERI LA PRODUSE ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <p className="text-xs font-extrabold tracking-widest uppercase text-[#1d2353] mb-1">REDUCERI LA PRODUSE</p>
        <div className="w-8 h-[3px] bg-[#c7092b] mb-8" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
          {produse.map((p) => (
            <div key={p.brand + p.model} className="rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow bg-white flex flex-col">
              <div className="relative h-44 bg-gray-50">
                <Image src="/IMG_2848.PNG" alt={p.brand} fill className="object-contain p-4" />
                <span className="absolute top-3 left-3 bg-[#c7092b] text-white text-[11px] font-bold px-2.5 py-1 rounded-md">{p.discount}</span>
              </div>
              <div className="p-4 flex flex-col gap-1 flex-1">
                <p className="text-sm font-extrabold text-[#1d2353] uppercase">{p.brand}</p>
                <p className="text-xs text-gray-600">{p.model}</p>
                <p className="text-[11px] text-gray-400">{p.specs}</p>
                <p className="text-xs text-gray-400 line-through mt-3">{p.oldPrice}</p>
                <p className="text-xl font-extrabold text-[#c7092b]">{p.price}</p>
                <div className="flex items-center gap-2 mt-4">
                  <Link href={p.href} className="flex-1 flex items-center justify-center gap-2 bg-[#c7092b] hover:bg-[#a5071f] text-white text-xs font-bold py-2.5 px-3 rounded-xl transition-colors">
                    <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/>
                    </svg>
                    Adaugă în coș
                  </Link>
                  <Link href={p.href} className="w-10 h-10 flex items-center justify-center border border-gray-200 rounded-xl hover:border-[#c7092b] hover:text-[#c7092b] text-gray-400 transition-colors shrink-0">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                    </svg>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── TESTIMONIALE ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <p className="text-xs font-extrabold tracking-widest uppercase text-[#1d2353] mb-1">CE SPUN CLIENȚII NOȘTRI</p>
        <div className="w-8 h-[3px] bg-[#c7092b] mb-8" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {testimoniale.map((t) => (
            <div key={t.name} className="bg-[#1d2353] rounded-2xl p-6 flex flex-col gap-4 relative">
              <div className="flex items-center gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                  </svg>
                ))}
              </div>
              <svg className="absolute top-5 right-5 w-8 h-8 text-white/10" fill="currentColor" viewBox="0 0 24 24">
                <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z"/>
              </svg>
              <p className="text-white/80 text-sm leading-relaxed">{t.text}</p>
              <div className="flex items-center gap-3 mt-auto pt-3 border-t border-white/10">
                <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#c7092b] to-[#8b0618] flex items-center justify-center text-white text-sm font-extrabold shrink-0 ring-2 ring-white/20">
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
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-16">
        <div className="bg-[#1d2353] rounded-2xl px-8 py-10 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <p className="text-white font-extrabold text-xl lg:text-2xl leading-snug max-w-xs">
              Aparatul tău are o problemă?
            </p>
            <p className="text-white/60 text-sm mt-2">Contactează-ne acum și îl reparăm rapid și profesional.</p>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-4 shrink-0">
            <Link href="/contact" className="bg-[#c7092b] hover:bg-[#a5071f] text-white font-bold px-8 py-3 rounded-xl text-sm uppercase tracking-wide transition-colors whitespace-nowrap">
              CONTACTEAZĂ-NE
            </Link>
            <a href="tel:0745123456" className="flex items-center gap-3 text-white hover:text-white/80 transition-colors">
              <div className="w-10 h-10 rounded-full border border-white/30 flex items-center justify-center shrink-0">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
                </svg>
              </div>
              <span className="font-bold text-lg tracking-wide">0745 123 456</span>
            </a>
          </div>
        </div>
      </section>

    </div>
  );
}
