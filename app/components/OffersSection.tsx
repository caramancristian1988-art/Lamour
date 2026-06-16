import Link from "next/link";

const offers = [
  {
    badge: "Ofertă sezon",
    title: "Reduceri de sezon până la -20%",
    description:
      "Profită de reducerile noastre de vară pentru cele mai populare modele de condiționere.",
    cta: "Descoperă ofertele",
    href: "/produse?reducere=true",
    bgClass: "bg-gradient-to-br from-[#c7092b] to-[#8b0520]",
    textAccent: "text-white/80",
    icon: (
      <svg className="w-12 h-12 text-white/20" fill="currentColor" viewBox="0 0 24 24">
        <path d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 12V7a4 4 0 014-4z" />
      </svg>
    ),
  },
  {
    badge: "Pachet complet",
    title: "Condiționer + instalare inclusă",
    description:
      "Cumperi conditionerul și instalarea e inclusă gratuit. Fără costuri ascunse, fără surprize.",
    cta: "Vezi pachetele",
    href: "/pachete",
    bgClass: "bg-gradient-to-br from-[#1d2353] to-[#0e1628]",
    textAccent: "text-white/70",
    icon: (
      <svg className="w-12 h-12 text-white/20" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </svg>
    ),
  },
  {
    badge: "Gratuit",
    title: "Consultanță gratuită",
    description:
      "Specialiștii noștri te ajută să alegi condiționerul potrivit pentru spațiul tău, fără costuri.",
    cta: "Solicită consultanță",
    href: "/contact",
    bgClass: "bg-gradient-to-br from-[#0f766e] to-[#065f55]",
    textAccent: "text-white/70",
    icon: (
      <svg className="w-12 h-12 text-white/20" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
    ),
  },
];

export default function OffersSection() {
  return (
    <section className="py-16 bg-[#f6f8fb]">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-extrabold text-[#111827]">Oferte speciale</h2>
          <p className="text-[#6b7280] mt-2">Nu rata cele mai bune oferte ale lunii</p>
        </div>

        <div className="grid md:grid-cols-3 gap-5">
          {offers.map((offer) => (
            <div
              key={offer.title}
              className={`${offer.bgClass} rounded-2xl p-7 relative overflow-hidden flex flex-col`}
            >
              {/* Background icon */}
              <div className="absolute top-4 right-4">{offer.icon}</div>

              <span className="inline-flex self-start bg-white/20 text-white text-xs font-bold px-3 py-1 rounded-full mb-4">
                {offer.badge}
              </span>

              <h3 className="text-xl font-extrabold text-white mb-2 leading-snug">
                {offer.title}
              </h3>
              <p className={`${offer.textAccent} text-sm mb-6 leading-relaxed flex-1`}>
                {offer.description}
              </p>

              <Link
                href={offer.href}
                className="self-start inline-flex items-center gap-2 bg-white text-[#111827] hover:bg-gray-100 text-sm font-bold px-5 py-2.5 rounded-xl transition-colors"
              >
                {offer.cta}
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
