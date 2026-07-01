import Link from "next/link";
import Image from "next/image";
import SearchBar from "./SearchBar";
import CartBadge from "./CartBadge";

export default function Header() {
  return (
    <header className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-6 pr-10 py-4 grid grid-cols-[auto_1fr_auto] items-center gap-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 shrink-0">
          <div className="w-12 h-12 shrink-0">
            <Image
              src="/Untitled-2.png"
              alt="Climat Rapid logo"
              width={48}
              height={48}
              className="w-full h-full object-contain"
              priority
            />
          </div>
          <div className="leading-none">
            <span className="block text-[22px] font-extrabold text-[#1d2353] tracking-tight uppercase">
              Climat <span className="text-[#c7092b]">Rapid</span>
            </span>
          </div>
        </Link>

        {/* Search bar — centered */}
        <div className="flex justify-center px-4">
          <SearchBar />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-5 justify-end">
          <Link
            href="/cont"
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-[#1d2353] transition-colors"
            aria-label="Contul meu"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" />
            </svg>
            <span className="hidden sm:block font-medium">Contul meu</span>
          </Link>

          <Link
            href="/cos"
            className="flex items-center gap-2 text-gray-600 hover:text-[#1d2353] transition-colors relative"
            aria-label="Coș"
          >
            <div className="relative">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <CartBadge className="absolute -top-2 -right-2 w-5 h-5 bg-[#c7092b] rounded-full text-white text-[10px] font-bold flex items-center justify-center" />
            </div>
          </Link>
        </div>
      </div>
    </header>
  );
}
