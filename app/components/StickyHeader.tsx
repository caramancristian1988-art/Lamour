import Link from "next/link";
import { User, ShoppingCart, ChevronDown } from "lucide-react";
import type { SectionFlags, HeaderCategory } from "@/lib/siteSettings";
import { Logo } from "@/app/components/Logo";
import SearchBar from "./SearchBar";
import MobileMenuButton from "./MobileMenuButton";
import CartBadge from "./CartBadge";
import AllCategoriesMenu from "./AllCategoriesMenu";
import AccountMenuLink from "./AccountMenuLink";
import AccessibilityToggle from "./AccessibilityToggle";
import OrnamentalBorder from "./OrnamentalBorder";

const fallbackProductsDropdown = [
  { id: "categorie-1", slug: "categorie-1", name: "Categoria unu", image: null },
  { id: "categorie-2", slug: "categorie-2", name: "Categoria doi", image: null },
  { id: "categorie-3", slug: "categorie-3", name: "Categoria trei", image: null },
];

export default function StickyHeader({
  produseEnabled = true,
  proiecteEnabled = true,
  despreEnabled = true,
  blogEnabled = true,
  contactEnabled = true,
  categories,
}: Partial<SectionFlags> & { categories?: HeaderCategory[] }) {
  const productsDropdown = categories && categories.length > 0 ? categories : fallbackProductsDropdown;
  return (
    <div id="site-header" className="bg-card relative z-40">
      {/* ══ ROW 1: Header ══ */}
      <div className="border-b border-border">
        {/* MOBILE layout */}
        <div className="lg:hidden">
          <div className="flex items-center justify-between px-4 py-3">
            <Link href="/" className="flex items-center gap-2.5 shrink-0 rounded-lg">
              <Logo size={44} />
              <span className="block leading-tight">
                <span className="block text-base font-serif font-bold text-primary tracking-tight">Hârtie Igienică</span>
                <span className="block text-[9px] font-bold text-accent tracking-widest uppercase">Cu Dragoste</span>
              </span>
            </Link>
            <div className="flex items-center gap-1">
              <AccountMenuLink className="flex items-center justify-center w-11 h-11 rounded-xl text-foreground hover:bg-muted hover:text-primary transition-colors">
                <User className="w-6 h-6 shrink-0" aria-hidden />
              </AccountMenuLink>
              <Link
                href="/cos"
                className="flex items-center justify-center w-11 h-11 rounded-xl text-foreground hover:bg-muted hover:text-accent transition-colors relative"
                aria-label="Coș"
              >
                <ShoppingCart className="w-6 h-6" aria-hidden />
                <CartBadge className="absolute top-1 right-1 min-w-[18px] h-[18px] px-1 bg-accent rounded-full text-white text-[10px] font-bold flex items-center justify-center" />
              </Link>
              <MobileMenuButton
                produseEnabled={produseEnabled}
                proiecteEnabled={proiecteEnabled}
                despreEnabled={despreEnabled}
                blogEnabled={blogEnabled}
                contactEnabled={contactEnabled}
              />
            </div>
          </div>
          <div className="px-4 pb-3 flex items-center gap-2">
            {produseEnabled && (
              <AllCategoriesMenu label="Categorii" className="shrink-0" categories={productsDropdown} />
            )}
            <div className="flex-1 min-w-0">
              <SearchBar />
            </div>
          </div>
        </div>

        {/* DESKTOP layout */}
        <div className="hidden lg:grid grid-cols-[360px_1fr_420px] gap-x-6 max-w-7xl mx-auto px-6">
          <Link href="/" className="flex items-center gap-4 py-5 shrink-0 rounded-lg">
            <Logo size={88} />
            <span className="block leading-tight">
              <span className="block text-3xl font-serif font-bold text-primary tracking-tight">Hârtie Igienică</span>
              <span className="block text-xs font-bold text-accent tracking-[0.25em] uppercase mt-1">Cu Dragoste</span>
            </span>
          </Link>

          <div className="flex items-center py-7">
            <SearchBar />
          </div>

          <div className="flex items-center gap-1 justify-end py-7">
            <AccessibilityToggle className="px-2" />
            <AccountMenuLink className="flex items-center gap-1.5 px-2 h-11 rounded-xl text-sm text-foreground hover:bg-muted hover:text-primary transition-colors whitespace-nowrap">
              <User className="w-5 h-5 shrink-0" aria-hidden />
              <span className="font-semibold">Contul meu</span>
            </AccountMenuLink>
            <Link
              href="/cos"
              className="flex items-center gap-1.5 px-2 h-11 rounded-xl text-sm text-foreground hover:bg-muted hover:text-accent transition-colors relative whitespace-nowrap"
            >
              <ShoppingCart className="w-5 h-5 shrink-0" aria-hidden />
              <span className="font-semibold">Coșul meu</span>
              <CartBadge className="absolute -top-1 left-5 min-w-[18px] h-[18px] px-1 bg-accent rounded-full text-white text-[10px] font-bold flex items-center justify-center" />
            </Link>
          </div>
        </div>
      </div>

      {/* ══ ROW 2: Navbar — desktop only ══ */}
      <div className="hidden lg:flex items-center justify-center gap-10 max-w-7xl mx-auto px-6 border-b border-border">
        <Link href="/" className="py-4 text-sm font-bold text-primary hover:text-accent transition-colors uppercase tracking-wide rounded">
          Acasă
        </Link>

        {produseEnabled && (
          <div className="relative group">
            <Link
              href="/produse"
              className="flex items-center gap-1 py-4 text-sm font-bold text-primary hover:text-accent transition-colors uppercase tracking-wide rounded"
            >
              Produse
              <ChevronDown className="w-3.5 h-3.5" aria-hidden />
            </Link>
            <div className="absolute top-full left-0 bg-popover rounded-xl shadow-xl border border-border py-2 min-w-[240px] opacity-0 invisible group-hover:opacity-100 group-hover:visible group-focus-within:opacity-100 group-focus-within:visible transition-all duration-150 translate-y-1 group-hover:translate-y-0 z-50">
              {productsDropdown.map((item) => (
                <Link
                  key={item.id}
                  href={`/produse?cat=${item.slug}`}
                  className="block px-4 py-2.5 text-sm text-foreground hover:text-accent hover:bg-muted transition-colors"
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
        )}

        {produseEnabled && (
          <Link href="/produse?oferte=1" className="py-4 text-sm font-bold text-primary hover:text-accent transition-colors uppercase tracking-wide rounded">
            Oferte
          </Link>
        )}
        {proiecteEnabled && (
          <Link href="/proiecte" className="py-4 text-sm font-bold text-primary hover:text-accent transition-colors uppercase tracking-wide rounded">
            Proiecte
          </Link>
        )}
        {despreEnabled && (
          <Link href="/despre" className="py-4 text-sm font-bold text-primary hover:text-accent transition-colors uppercase tracking-wide rounded">
            Despre noi
          </Link>
        )}
        {blogEnabled && (
          <Link href="/blog" className="py-4 text-sm font-bold text-primary hover:text-accent transition-colors uppercase tracking-wide rounded">
            Noutăți
          </Link>
        )}
        {contactEnabled && (
          <Link href="/contact" className="py-4 text-sm font-bold text-primary hover:text-accent transition-colors uppercase tracking-wide rounded">
            Contact
          </Link>
        )}
      </div>

      <OrnamentalBorder />
    </div>
  );
}
