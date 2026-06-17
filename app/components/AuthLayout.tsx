import Image from "next/image";
import Link from "next/link";

const benefits = [
  "Urmărești toate comenzile tale",
  "Produsele favorite salvate, oriunde te conectezi",
  "Date precompletate pentru un checkout mai rapid",
];

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-[calc(100vh-180px)] flex">
      {/* Brand panel — desktop only */}
      <div className="hidden lg:flex lg:w-[45%] relative bg-[#1d2353] overflow-hidden">
        <Image
          src="/tehnician.png"
          alt=""
          fill
          sizes="45vw"
          className="object-cover object-center opacity-15"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-[#1d2353] via-[#1d2353]/97 to-[#1d2353]/90" />
        <div className="relative z-10 flex flex-col justify-center px-12 py-16">
          <Link href="/" className="flex items-center gap-2.5 mb-14">
            <div className="w-10 h-10 shrink-0">
              <Image src="/Untitled-2.png" alt="Climat Rapid" width={40} height={40} className="w-full h-full object-contain" />
            </div>
            <span className="text-xl font-extrabold text-white tracking-tight uppercase leading-none">
              Climat <span className="text-[#c7092b]">Rapid</span>
            </span>
          </Link>

          <h2 className="text-3xl font-extrabold text-white leading-tight mb-4 max-w-sm">
            Confort și control, <span className="text-[#c7092b]">oriunde te-ai afla.</span>
          </h2>
          <p className="text-white/60 text-sm leading-relaxed max-w-sm mb-10">
            Contul tău Climat Rapid îți ține totul la îndemână.
          </p>

          <ul className="flex flex-col gap-4">
            {benefits.map((b) => (
              <li key={b} className="flex items-start gap-3 text-sm text-white/80">
                <span className="w-5 h-5 rounded-full bg-[#c7092b]/20 flex items-center justify-center shrink-0 mt-0.5">
                  <svg className="w-3 h-3 text-[#c7092b]" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </span>
                {b}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Form panel */}
      <div className="flex-1 flex items-center justify-center bg-[#f6f8fb] px-4 py-12 sm:py-16">
        {children}
      </div>
    </main>
  );
}
