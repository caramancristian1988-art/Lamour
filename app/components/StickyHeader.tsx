import Link from "next/link";
import { User, ShoppingCart } from "lucide-react";
import type { SectionFlags, HeaderCategory } from "@/lib/siteSettings";
import { Logo } from "@/app/components/Logo";
import SearchBar from "./SearchBar";
import MobileMenuButton from "./MobileMenuButton";
import CartBadge from "./CartBadge";
import AllCategoriesMenu from "./AllCategoriesMenu";
import AccountMenuLink from "./AccountMenuLink";
import AccessibilityToggle from "./AccessibilityToggle";
import NavDropdown from "./NavDropdown";

const fallbackProductsDropdown = [
  { id: "categorie-1", slug: "categorie-1", name: "Categoria unu", image: null },
  { id: "categorie-2", slug: "categorie-2", name: "Categoria doi", image: null },
  { id: "categorie-3", slug: "categorie-3", name: "Categoria trei", image: null },
];

const despreDropdown = [
  { href: "/despre#istorie", label: "Istorie" },
  { href: "/despre#misiune", label: "Misiune" },
  { href: "/despre#misiune-sociala", label: "Misiune socială" },
  { href: "/productie", label: "Producție" },
];

const produseDropdown = [
  { href: "/produse", label: "Produse din hârtie" },
  { href: "/mobila", label: "Mobilă" },
  { href: "/productie-la-comanda", label: "Fabricație la comandă" },
  { href: "/spatii-comerciale", label: "Spații comerciale" },
  { href: "/productie", label: "Servicii de producție" },
  { href: "/produse?oferte=1", label: "Oferte speciale", divider: true, highlighted: true },
];

export default function StickyHeader({
  produseEnabled = true,
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
              <Logo size={56} />
              <span className="block leading-tight">
                <span className="block text-base font-serif italic font-bold text-primary tracking-tight">LuminaTehnica</span>
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
        <div className="hidden lg:grid grid-cols-[360px_1fr_420px] gap-x-6 max-w-[96rem] mx-auto px-6">
          <Link href="/" className="flex items-center gap-4 py-4 shrink-0 rounded-lg">
            <Logo size={132} />
            <span className="block leading-tight">
              <span className="block text-2xl font-serif italic font-bold text-primary tracking-tight whitespace-nowrap">LuminaTehnica</span>
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
      <div className="hidden lg:flex items-center justify-center gap-10 max-w-[96rem] mx-auto px-6 border-b border-border">
        {produseEnabled && (
          <AllCategoriesMenu categories={productsDropdown} buttonClassName="flex items-center gap-2 bg-accent hover:bg-brand-red-dark text-white text-sm font-bold px-5 h-10 rounded-xl transition-colors uppercase tracking-wide shrink-0" />
        )}

        {despreEnabled && <NavDropdown label="Despre noi" href="/despre" items={despreDropdown} />}

        {produseEnabled && <NavDropdown label="Produse" href="/produse" items={produseDropdown} />}

        {blogEnabled && (
          <Link href="/blog" className="py-4 text-sm font-bold text-primary hover:text-accent transition-colors uppercase tracking-wide rounded">
            Blog
          </Link>
        )}
        {contactEnabled && (
          <Link href="/contact" className="py-4 text-sm font-bold text-primary hover:text-accent transition-colors uppercase tracking-wide rounded">
            Contact
          </Link>
        )}
      </div>
    </div>
  );
}
