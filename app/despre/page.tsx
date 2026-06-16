import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Despre Noi | Climat Rapid",
  description:
    "Află povestea Climat Rapid, companie specializată în soluții de climatizare, instalare și mentenanță în Moldova.",
};

const stats = [
  { value: "10+", label: "Ani de experiență" },
  { value: "2500+", label: "Clienți mulțumiți" },
  { value: "3000+", label: "Produse vândute" },
  { value: "1500+", label: "Instalări realizate" },
];

const team = [
  { name: "Alexandru Popescu", role: "Director General", initials: "AP", color: "from-[#1d2353] to-[#2a3470]" },
  { name: "Mihai Rotaru", role: "Responsabil Tehnic", initials: "MR", color: "from-[#1d2353] to-[#2a3470]" },
  { name: "Ion Cebotari", role: "Tehnician Șef", initials: "IC", color: "from-[#1d2353] to-[#2a3470]" },
  { name: "Vladimir Turcanu", role: "Consultant Vânzări", initials: "VT", color: "from-[#1d2353] to-[#2a3470]" },
];

export default function DesprePage() {
  return (
    <main className="bg-white">

        {/* ── HERO SECTION ── */}
        <section className="relative bg-white overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[340px] lg:min-h-[380px] items-center gap-0 lg:gap-8 py-8 lg:py-0">

              {/* LEFT */}
              <div className="relative z-10 pt-2 pb-6 lg:py-10">
                <nav className="flex items-center gap-1.5 text-xs text-gray-400 mb-5">
                  <Link href="/" className="hover:text-[#c7092b] transition-colors">Acasă</Link>
                  <span>›</span>
                  <span className="text-gray-600">Despre noi</span>
                </nav>

                <p className="text-[#c7092b] text-[11px] font-extrabold tracking-widest uppercase mb-4">
                  Despre Climat Rapid
                </p>

                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#1d2353] leading-tight mb-4">
                  Confortul tău este{" "}
                  <span className="text-[#c7092b]">misiunea</span>{" "}
                  noastră.
                </h1>

                <div className="w-10 h-1 bg-[#c7092b] rounded-full mb-6" />

                <p className="text-gray-600 text-[15px] leading-relaxed mb-8 max-w-md">
                  Suntem o companie din Moldova specializată în soluții complete de
                  climatizare pentru locuințe și afaceri. De la consultanță și vânzare
                  până la instalare și mentenanță, ne asigurăm că ai parte de confort
                  în fiecare sezon.
                </p>

                <div className="flex flex-wrap gap-3">
                  <Link
                    href="/produse"
                    className="inline-flex items-center bg-[#c7092b] hover:bg-[#a5071f] text-white font-bold px-6 py-3 rounded-lg transition-colors text-sm uppercase tracking-wide"
                  >
                    Vezi produsele
                  </Link>
                  <Link
                    href="/contact"
                    className="inline-flex items-center border-2 border-[#1d2353] text-[#1d2353] hover:bg-[#1d2353] hover:text-white font-bold px-6 py-3 rounded-lg transition-all text-sm uppercase tracking-wide"
                  >
                    Contactează-ne
                  </Link>
                </div>
              </div>

              {/* RIGHT: Image */}
              <div className="relative w-full -mt-6 lg:mt-0 rounded-t-3xl lg:rounded-none overflow-hidden lg:h-full lg:absolute lg:right-0 lg:top-0 lg:bottom-0 lg:w-[52%]" style={{ aspectRatio: "1719/915" }}>
                <Image
                  src="/30634e25-d3ae-42fc-b1cd-cb9ab4ce60da.png"
                  alt="Sediul Climat Rapid"
                  fill
                  className="object-cover object-center lg:object-[center_40%]"
                  priority
                  sizes="(max-width: 1024px) 100vw, 52vw"
                />
                {/* Top fade — soft white-to-photo gradient under the overlapping text */}
                <div
                  className="absolute inset-x-0 top-0 h-16 lg:hidden pointer-events-none"
                  style={{ background: "linear-gradient(to bottom, white 0%, rgba(255,255,255,0.85) 30%, rgba(255,255,255,0.45) 60%, transparent 100%)" }}
                />
                {/* Gradient overlay SVG */}
                <div className="absolute inset-0 hidden lg:block pointer-events-none">
                  <svg width="520" height="520" viewBox="0 0 520 520" fill="none" xmlns="http://www.w3.org/2000/svg" className="absolute top-1/2 -translate-y-1/2 h-full w-auto" style={{left: "-180px"}}>
                    <circle cx="80" cy="260" r="360" fill="url(#grad)" />
                    <defs>
                      <linearGradient id="grad" x1="0" y1="0" x2="520" y2="520">
                        <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
                        <stop offset="55%" stopColor="#f4f7fb" stopOpacity="0.92" />
                        <stop offset="100%" stopColor="#e8eef6" stopOpacity="0.85" />
                      </linearGradient>
                    </defs>
                  </svg>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* ── POVESTEA NOASTRĂ ── */}
        <section className="py-10 lg:py-14 bg-white border-t border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-14 items-center">

              {/* LEFT: Image */}
              <div className="relative">
                <div className="relative h-[220px] sm:h-[300px] lg:h-[360px] rounded-2xl overflow-hidden shadow-xl">
                  <Image
                    src="/30634e25-d3ae-42fc-b1cd-cb9ab4ce60da.png"
                    alt="Aparat de aer condiționat în living elegant"
                    fill
                    className="object-cover object-center"
                    sizes="(max-width: 1024px) 100vw, 50vw"
                  />
                </div>
              </div>

              {/* RIGHT: Text */}
              <div>
                <p className="text-[#c7092b] text-[11px] font-extrabold tracking-widest uppercase mb-3">
                  Povestea noastră
                </p>
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#1d2353] leading-tight mb-6">
                  Experiență, încredere și dedicare{" "}
                  <span className="text-[#c7092b]">din 2014</span>
                </h2>
                <div className="space-y-4 text-gray-600 text-[15px] leading-relaxed">
                  <p>
                    Climat Rapid a apărut din dorința de a oferi clienților soluții de
                    climatizare eficiente, fiabile și accesibile.
                  </p>
                  <p>
                    De peste 10 ani, am crescut alături de clienții noștri și am
                    dezvoltat parteneriate solide cu branduri internaționale de top.
                  </p>
                  <p>
                    Fiecare proiect este tratat cu responsabilitate, iar fiecare client
                    este un partener pe termen lung.
                  </p>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* ── STATISTICI ── */}
        <section className="bg-[#f8fafc] py-8 border-y border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {stats.map((stat) => (
                <div
                  key={stat.value}
                  className="bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 px-6 py-8 text-center"
                >
                  <div className="text-3xl sm:text-4xl font-extrabold text-[#c7092b] mb-2">{stat.value}</div>
                  <div className="text-sm text-gray-500 font-medium leading-snug">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── ECHIPA NOASTRĂ ── */}
        <section className="py-10 lg:py-14 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
            <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-10 lg:gap-16 items-start">

              {/* LEFT: Title */}
              <div className="lg:pt-4">
                <p className="text-[#c7092b] text-[11px] font-extrabold tracking-widest uppercase mb-3">
                  Echipa noastră
                </p>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1d2353] leading-tight">
                  Profesioniști de încredere, la dispoziția ta
                </h2>
              </div>

              {/* RIGHT: Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                {team.map((member) => (
                  <div
                    key={member.name}
                    className="group bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden"
                  >
                    <div className={`h-44 bg-gradient-to-br ${member.color} flex items-center justify-center relative overflow-hidden`}>
                      <div className="w-20 h-20 rounded-2xl bg-white/15 border-2 border-white/25 flex items-center justify-center">
                        <span className="text-2xl font-extrabold text-white">{member.initials}</span>
                      </div>
                      <div className="absolute -bottom-5 -right-5 w-20 h-20 rounded-full bg-[#c7092b]/20" />
                    </div>
                    <div className="px-4 py-4 text-center">
                      <h3 className="font-extrabold text-[#1d2353] text-sm mb-1">{member.name}</h3>
                      <p className="text-[#c7092b] text-[11px] font-semibold">{member.role}</p>
                    </div>
                  </div>
                ))}
              </div>

            </div>
          </div>
        </section>

        {/* ── CTA SECTION ── */}
        <section className="bg-white px-4 sm:px-6 lg:px-12 pb-10">
          <div className="max-w-7xl mx-auto bg-[#1d2353] rounded-2xl py-10 lg:py-12 px-8 lg:px-12">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
              <div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight mb-2">
                  Ai întrebări?{" "}
                  <br className="hidden sm:block" />
                  Suntem aici pentru tine!
                </h2>
                <p className="text-white/60 text-sm max-w-md">
                  Echipa noastră îți stă la dispoziție pentru orice informații sau recomandări personalizate.
                </p>
              </div>
              <div className="shrink-0">
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 bg-[#c7092b] hover:bg-[#a5071f] text-white font-extrabold text-sm px-8 py-4 rounded-xl transition-all duration-300 uppercase tracking-wide shadow-lg hover:-translate-y-0.5"
                >
                  Contactează-ne
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        </section>

    </main>
  );
}
