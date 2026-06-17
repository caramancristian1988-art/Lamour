import Link from "next/link";
import MobileMenuButton from "./MobileMenuButton";

const productsDropdown = [
  { href: "/produse/conditioane-rezidentiale", label: "Condiționere rezidențiale" },
  { href: "/produse/conditioane-comerciale", label: "Condiționere comerciale" },
  { href: "/produse/sisteme-multisplit", label: "Sisteme multisplit" },
  { href: "/produse/conditioane-portabile", label: "Condiționere portabile" },
  { href: "/produse/accesorii-consumabile", label: "Accesorii și consumabile" },
];

const servicesDropdown = [
  { href: "/servicii/instalare", label: "Instalare" },
  { href: "/servicii/mentenanta", label: "Mentenanță" },
  { href: "/servicii/diagnosticare", label: "Diagnosticare & Reparații" },
  { href: "/servicii/consultanta", label: "Consultanță" },
  { href: "/servicii/multisplit", label: "Sisteme multisplit" },
  { href: "/servicii/comerciale", label: "Sisteme comerciale HVAC" },
];

export default function Navbar() {
  return (
    <nav className="bg-white border-b border-gray-200 relative z-40">
      <div className="max-w-7xl mx-auto px-6 flex items-center">
        {/* All categories button */}
        <button className="flex items-center gap-2 bg-[#c7092b] hover:bg-[#a5071f] text-white text-sm font-bold px-5 py-3 rounded-xl transition-colors shrink-0 uppercase tracking-wide">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
          <span className="hidden sm:block">Toate categoriile</span>
          <svg className="w-3 h-3 hidden sm:block" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {/* Desktop nav links */}
        <div className="hidden lg:flex items-center flex-1 justify-center">
          <Link href="/" className="px-5 py-4 text-sm font-bold text-[#1d2353] hover:text-[#c7092b] transition-colors uppercase tracking-wide">
            Acasă
          </Link>

          <div className="relative group">
            <Link href="/produse" className="flex items-center gap-1 px-5 py-4 text-sm font-bold text-[#1d2353] hover:text-[#c7092b] transition-colors uppercase tracking-wide">
              Produse
              <svg className="w-3 h-3 transition-transform duration-200 group-hover:rotate-180" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </Link>
            <div className="absolute top-full left-0 bg-white rounded-xl shadow-xl border border-gray-100 py-2 min-w-[240px] origin-top opacity-0 invisible scale-95 group-hover:opacity-100 group-hover:visible group-hover:scale-100 transition-all duration-200 ease-out translate-y-1 group-hover:translate-y-0 z-50">
              {productsDropdown.map((item) => (
                <Link key={item.href} href={item.href} className="block px-4 py-2.5 text-sm text-gray-700 hover:text-[#c7092b] hover:bg-gray-50 transition-colors">
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="relative group">
            <Link href="/servicii" className="flex items-center gap-1 px-5 py-4 text-sm font-bold text-[#1d2353] hover:text-[#c7092b] transition-colors uppercase tracking-wide">
              Servicii
              <svg className="w-3 h-3 transition-transform duration-200 group-hover:rotate-180" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </Link>
            <div className="absolute top-full left-0 bg-white rounded-xl shadow-xl border border-gray-100 py-2 min-w-[200px] origin-top opacity-0 invisible scale-95 group-hover:opacity-100 group-hover:visible group-hover:scale-100 transition-all duration-200 ease-out translate-y-1 group-hover:translate-y-0 z-50">
              {servicesDropdown.map((item) => (
                <Link key={item.href} href={item.href} className="block px-4 py-2.5 text-sm text-gray-700 hover:text-[#c7092b] hover:bg-gray-50 transition-colors">
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          <Link href="/despre" className="px-5 py-4 text-sm font-bold text-[#1d2353] hover:text-[#c7092b] transition-colors uppercase tracking-wide">
            Despre noi
          </Link>
          <Link href="/blog" className="px-5 py-4 text-sm font-bold text-[#1d2353] hover:text-[#c7092b] transition-colors uppercase tracking-wide">
            Blog
          </Link>
          <Link href="/contact" className="px-5 py-4 text-sm font-bold text-[#1d2353] hover:text-[#c7092b] transition-colors uppercase tracking-wide">
            Contact
          </Link>
        </div>

        {/* Mobile menu */}
        <div className="lg:hidden ml-auto py-3">
          <MobileMenuButton />
        </div>
      </div>
    </nav>
  );
}
