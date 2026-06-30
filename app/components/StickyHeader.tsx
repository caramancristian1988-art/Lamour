import Link from "next/link";
import Image from "next/image";
import type { SectionFlags, HeaderCategory } from "@/lib/siteSettings";
import SearchBar from "./SearchBar";
import MobileMenuButton from "./MobileMenuButton";
import FavoritesBadge from "./FavoritesBadge";
import CartBadge from "./CartBadge";
import AllCategoriesMenu from "./AllCategoriesMenu";
import AccountMenuLink from "./AccountMenuLink";

const fallbackProductsDropdown = [
  { id: "conditioane-rezidentiale", slug: "conditioane-rezidentiale", name: "Condiționere rezidențiale", image: null },
  { id: "conditioane-comerciale", slug: "conditioane-comerciale", name: "Condiționere comerciale", image: null },
  { id: "sisteme-multisplit", slug: "sisteme-multisplit", name: "Sisteme multisplit", image: null },
  { id: "conditioane-portabile", slug: "conditioane-portabile", name: "Condiționere portabile", image: null },
  { id: "accesorii-consumabile", slug: "accesorii-consumabile", name: "Accesorii și consumabile", image: null },
];

const servicesDropdown = [
  { href: "/servicii/instalare", label: "Instalare" },
  { href: "/servicii/mentenanta", label: "Mentenanță" },
  { href: "/servicii/diagnosticare", label: "Diagnosticare & Reparații" },
  { href: "/servicii/consultanta", label: "Consultanță" },
  { href: "/servicii/multisplit", label: "Sisteme multisplit" },
  { href: "/servicii/comerciale", label: "Sisteme comerciale HVAC" },
];

export default function StickyHeader({
  produseEnabled = true,
  serviciiEnabled = true,
  proiecteEnabled = true,
  despreEnabled = true,
  blogEnabled = true,
  contactEnabled = true,
  categories,
}: Partial<SectionFlags> & { categories?: HeaderCategory[] }) {
  const productsDropdown = categories && categories.length > 0 ? categories : fallbackProductsDropdown;
  return (
    <div id="site-header" className="bg-white relative z-40">

      {/* ══ ROW 1: Header ══ */}
      <div className="border-b border-gray-200">

        {/* MOBILE layout */}
        <div className="lg:hidden">
          <div className="flex items-center justify-between px-4 py-3">
            <Link href="/" className="flex items-center gap-2 shrink-0">
              <div className="w-9 h-9 shrink-0">
                <Image src="/Untitled-2.png" alt="Climat Rapid logo" width={36} height={36} className="w-full h-full object-contain" priority />
              </div>
              <span className="text-lg font-extrabold text-[#1d2353] tracking-tight uppercase leading-none">
                Climat <span className="text-[#c7092b]">Rapid</span>
              </span>
            </Link>
            <div className="flex items-center gap-2.5">
              <AccountMenuLink className="text-gray-600 hover:text-[#1d2353] transition-colors">
                <svg className="w-6 h-6 shrink-0" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" />
                </svg>
              </AccountMenuLink>
              <Link href="/favorite" className="text-gray-600 hover:text-[#c7092b] transition-colors relative" aria-label="Favorite">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                <FavoritesBadge className="absolute -top-2 -right-2 w-4 h-4 bg-[#c7092b] rounded-full text-white text-[9px] font-bold flex items-center justify-center" />
              </Link>
              <Link href="/cos" className="text-gray-600 relative" aria-label="Coș">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <CartBadge className="absolute -top-2 -right-2 w-4 h-4 bg-[#c7092b] rounded-full text-white text-[9px] font-bold flex items-center justify-center" />
              </Link>
              <MobileMenuButton
                produseEnabled={produseEnabled}
                serviciiEnabled={serviciiEnabled}
                proiecteEnabled={proiecteEnabled}
                despreEnabled={despreEnabled}
                blogEnabled={blogEnabled}
                contactEnabled={contactEnabled}
              />
            </div>
          </div>
          <div className="px-4 pb-3 flex items-center gap-2">
            {produseEnabled && (
              <AllCategoriesMenu
                label="Categorii"
                className="shrink-0"
                buttonClassName="flex items-center justify-center gap-1.5 bg-[#c7092b] hover:bg-[#a5071f] text-white text-xs font-bold px-3 h-11 rounded-xl transition-colors uppercase tracking-wide whitespace-nowrap"
                categories={productsDropdown}
              />
            )}
            <div className="flex-1 min-w-0">
              <SearchBar />
            </div>
          </div>
        </div>

        {/* DESKTOP layout */}
        <div className="hidden lg:grid grid-cols-[320px_1fr_160px] gap-x-8 max-w-7xl mx-auto px-6 pr-3">
          <Link href="/" className="flex items-center gap-3 py-8 shrink-0">
            <div className="w-12 h-12 shrink-0">
              <Image src="/Untitled-2.png" alt="Climat Rapid logo" width={48} height={48} className="w-full h-full object-contain" priority />
            </div>
            <span className="text-[22px] font-extrabold text-[#1d2353] tracking-tight uppercase leading-none">
              Climat <span className="text-[#c7092b]">Rapid</span>
            </span>
          </Link>

          <div className="flex items-center py-8">
            <SearchBar />
          </div>

          <div className="flex items-center gap-4 justify-end py-8">
            <AccountMenuLink className="flex items-center gap-2 text-sm text-gray-600 hover:text-[#1d2353] transition-colors whitespace-nowrap">
              <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" />
              </svg>
              <span className="hidden lg:block font-medium">Contul meu</span>
            </AccountMenuLink>
            <Link href="/favorite" className="text-gray-600 hover:text-[#c7092b] transition-colors relative" aria-label="Favorite">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              <FavoritesBadge className="absolute -top-2 -right-2 w-5 h-5 bg-[#c7092b] rounded-full text-white text-[10px] font-bold flex items-center justify-center" />
            </Link>
            <Link href="/cos" className="text-gray-600 hover:text-[#1d2353] transition-colors" aria-label="Coș">
              <div className="relative">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <CartBadge className="absolute -top-2 -right-2 w-5 h-5 bg-[#c7092b] rounded-full text-white text-[10px] font-bold flex items-center justify-center" />
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* ══ ROW 2: Navbar — desktop only ══ */}
      <div className="hidden lg:grid grid-cols-[320px_1fr_160px] gap-x-8 max-w-7xl mx-auto px-6 pr-4 border-b border-gray-200">

        <div className="flex items-center gap-10">
          {produseEnabled && <AllCategoriesMenu categories={productsDropdown} />}
        </div>

        <div className="flex items-center gap-6">
          {produseEnabled && (
            <div className="relative group">
              <Link href="/produse" className="flex items-center gap-1 py-4 text-sm font-bold text-[#1d2353] hover:text-[#c7092b] transition-colors uppercase tracking-wide">
                Produse
                <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </Link>
              <div className="absolute top-full left-0 bg-white rounded-xl shadow-xl border border-gray-100 py-2 min-w-[240px] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 translate-y-1 group-hover:translate-y-0 z-50">
                {productsDropdown.map((item) => (
                  <Link key={item.id} href={`/produse?cat=${item.slug}`} className="block px-4 py-2.5 text-sm text-gray-700 hover:text-[#c7092b] hover:bg-gray-50 transition-colors">
                    {item.name}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {serviciiEnabled && (
            <div className="relative group">
              <Link href="/servicii" className="flex items-center gap-1 py-4 text-sm font-bold text-[#1d2353] hover:text-[#c7092b] transition-colors uppercase tracking-wide">
                Servicii
                <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </Link>
              <div className="absolute top-full left-0 bg-white rounded-xl shadow-xl border border-gray-100 py-2 min-w-[200px] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 translate-y-1 group-hover:translate-y-0 z-50">
                {servicesDropdown.map((item) => (
                  <Link key={item.href} href={item.href} className="block px-4 py-2.5 text-sm text-gray-700 hover:text-[#c7092b] hover:bg-gray-50 transition-colors">
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {proiecteEnabled && (
            <Link href="/proiecte" className="py-4 text-sm font-bold text-[#1d2353] hover:text-[#c7092b] transition-colors uppercase tracking-wide">Proiecte</Link>
          )}
          {despreEnabled && (
            <Link href="/despre" className="py-4 text-sm font-bold text-[#1d2353] hover:text-[#c7092b] transition-colors uppercase tracking-wide">Despre noi</Link>
          )}
          {blogEnabled && (
            <Link href="/blog" className="py-4 text-sm font-bold text-[#1d2353] hover:text-[#c7092b] transition-colors uppercase tracking-wide">Blog</Link>
          )}
          {contactEnabled && (
            <Link href="/contact" className="py-4 text-sm font-bold text-[#1d2353] hover:text-[#c7092b] transition-colors uppercase tracking-wide">Contact</Link>
          )}
        </div>

        <div />
      </div>

    </div>
  );
}
