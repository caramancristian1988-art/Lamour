import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getSectionFlags } from "@/lib/siteSettings";
import { getPromoProducts } from "@/lib/promoProducts";
import { getServiceDetail } from "@/lib/serviceDetail";
import ProductsSection from "@/app/components/ProductsSection";

const features = [
  {
    title: "O unitate, mai multe camere",
    desc: "Climatizezi întreaga locuință cu o singură unitate exterioară.",
    icon: (
      <svg className="w-6 h-6 text-[#c7092b]" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <rect x="3" y="3" width="7" height="7" rx="1"/>
        <rect x="14" y="3" width="7" height="7" rx="1"/>
        <rect x="3" y="14" width="7" height="7" rx="1"/>
        <rect x="14" y="14" width="7" height="7" rx="1"/>
      </svg>
    ),
  },
  {
    title: "Control independent",
    desc: "Fiecare cameră are propriul termostat și setări individuale.",
    icon: (
      <svg className="w-6 h-6 text-[#c7092b]" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="9"/>
        <path d="M12 8v4l3 2"/>
      </svg>
    ),
  },
  {
    title: "Eficiență energetică",
    desc: "Consum redus comparativ cu mai multe unități independente.",
    icon: (
      <svg className="w-6 h-6 text-[#c7092b]" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <path d="M13 2L4 14h6l-1 8 9-12h-6l1-8z"/>
      </svg>
    ),
  },
  {
    title: "Montaj estetic",
    desc: "O singură unitate exterioară, fără a încărca fațada clădirii.",
    icon: (
      <svg className="w-6 h-6 text-[#c7092b]" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1h-5v-7H9v7H4a1 1 0 01-1-1V9.5z"/>
      </svg>
    ),
  },
];

const inclus = [
  "Consultanță pentru numărul de camere",
  "Montaj unitate exterioară și interioare",
  "Configurare control individual pe cameră",
  "Testare completă a sistemului",
  "Garanție pentru manoperă și echipamente",
];

const defaultPasi = [
  { nr: "01", title: "Evaluare", desc: "Stabilim numărul de camere și capacitatea necesară pentru sistem.", img: "/IMG_2843.PNG" },
  { nr: "02", title: "Montaj", desc: "Instalăm unitatea exterioară și unitățile interioare în fiecare cameră.", img: "/IMG_2839.PNG" },
  { nr: "03", title: "Configurare", desc: "Setăm controlul individual și testăm funcționarea fiecărei zone.", img: "/IMG_2840.PNG" },
];

const testimoniale = [
  { text: "Soluția multisplit a fost perfecta pentru apartamentul nostru. Doar o unitate exterioară și toate camerele climatizate!", name: "Tatiana B.", city: "Chișinău", initials: "TB" },
  { text: "Montaj rapid, fără bătăi de cap. Fiecare cameră are temperatura ei, exact cum voiam.", name: "Igor C.", city: "Bălți", initials: "IC" },
  { text: "Recomand cu încredere sistemele multisplit, mai ales pentru case cu mai multe camere.", name: "Natalia S.", city: "Chișinău", initials: "NS" },
];

export default async function MultisplitPage() {
  const { serviciiEnabled } = await getSectionFlags();
  if (!serviciiEnabled) notFound();
  const produse = await getPromoProducts("sisteme-multisplit");
  const { detailImage, steps: pasi } = await getServiceDetail("/servicii/multisplit", {
    detailImage: "/IMG_2966.PNG",
    steps: defaultPasi,
  });

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
            <span className="text-[#1d2353] font-medium">Sisteme multisplit</span>
          </nav>
          <p className="text-[#c7092b] text-xs font-bold tracking-widest uppercase mb-3">SERVICIU</p>
          <h1 className="text-4xl lg:text-5xl font-extrabold leading-tight mb-4">
            Sisteme<br />
            <span className="text-[#c7092b]">multisplit</span>
          </h1>
          <div className="w-10 h-[3px] bg-[#c7092b] mb-5" />
          <p className="text-sm text-gray-600 leading-relaxed max-w-xs mb-8">
            Climatizare pentru mai multe camere cu o singură unitate exterioară, eficientă și discretă.
          </p>
          <div className="flex items-center gap-3 flex-wrap">
            <Link href="/contact" className="inline-flex items-center gap-2 bg-[#c7092b] hover:bg-[#a5071f] text-white font-bold px-6 py-3 rounded-xl text-sm uppercase tracking-wide transition-colors">
              Solicită ofertă
            </Link>
            <Link href="/servicii/multisplit#detalii" className="inline-flex items-center gap-2 border border-[#1d2353] text-[#1d2353] hover:bg-gray-50 font-bold px-6 py-3 rounded-xl text-sm uppercase tracking-wide transition-colors">
              Vezi detalii
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
              </svg>
            </Link>
          </div>
        </div>
        <div className="relative min-h-[280px] lg:min-h-0">
          <Image src="/IMG_2848.PNG" alt="Sisteme multisplit" fill className="object-cover object-center" priority />
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
            Confort în toată casa,<br />o singură unitate
          </h2>
          <div className="w-8 h-[3px] bg-[#c7092b] mb-5" />
          <p className="text-sm text-gray-500 leading-relaxed">
            Sistemele multisplit permit conectarea mai multor unități interioare la o singură unitate exterioară, oferind climatizare eficientă pentru mai multe camere fără a încărca fațada clădirii.
          </p>
        </div>
        <div className="flex items-stretch gap-0 rounded-2xl overflow-hidden shadow-md border border-gray-100">
          <div className="relative w-2/5 shrink-0" style={{ aspectRatio: "2/3" }}>
            <Image src={detailImage} alt="Sisteme multisplit" fill className="object-cover object-center" />
          </div>
          <div className="flex flex-col justify-center gap-4 px-6 py-8 bg-white w-3/5">
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
      <ProductsSection
        products={produse}
        title="Reduceri"
        highlighted="la produse"
        viewAllHref="/produse?reducere=true"
        showDiscount
      />

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
              Vrei climatizare în toată casa?
            </p>
            <p className="text-white/60 text-sm mt-2">Solicită o ofertă pentru un sistem multisplit personalizat.</p>
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
