import Link from "next/link";
import { User, ShoppingCart, Heart } from "lucide-react";
import type { SectionFlags, HeaderCategory } from "@/lib/siteSettings";
import { Logo } from "@/app/components/Logo";
import { SITE_SHORT_NAME } from "@/lib/constants";
import SearchBar from "./SearchBar";
import MobileMenuButton from "./MobileMenuButton";
import CartBadge from "./CartBadge";
import FavoritesBadge from "./FavoritesBadge";
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
];

export default function StickyHeader({
  produseEnabled = true,
  despreEnabled = true,
  blogEnabled = true,
  contactEnabled = true,
  categories,
  phone,
  phoneTel,
}: Partial<SectionFlags> & { categories?: HeaderCategory[]; phone?: string; phoneTel?: string }) {
  const productsDropdown = categories && categories.length > 0 ? categories : fallbackProductsDropdown;
  return (
    <div id="site-header" className="bg-card relative z-40">
      {/* ══ ROW 1: Header ══ */}
      <div className="border-b border-border">
        {/* MOBILE layout */}
        <div className="lg:hidden">
          <div className="flex items-center justify-between px-4 py-3">
            <Link href="/" className="flex items-center gap-2 min-w-0 rounded-lg">
              <Logo size={56} className="border-2 border-logo-silver shadow-sm" />
              <span className="block leading-tight">
                <span className="block pr-1 text-base min-[430px]:text-xl font-serif italic font-bold tracking-tight bg-gradient-to-r from-brand-maroon to-brand-red bg-clip-text text-transparent [-webkit-text-stroke:0.3px_var(--brand-maroon)]">
                  {SITE_SHORT_NAME}
                </span>
                <span className="block pr-1 text-sm min-[430px]:text-base font-serif italic font-bold tracking-tight bg-gradient-to-r from-brand-maroon to-brand-red bg-clip-text text-transparent [-webkit-text-stroke:0.3px_var(--brand-maroon)] -mt-0.5">
                  Lamour
                </span>
              </span>
            </Link>
            <div className="flex items-center shrink-0 gap-0.5 min-[430px]:gap-1">
              <AccountMenuLink className="flex items-center justify-center w-10 h-10 min-[430px]:w-11 min-[430px]:h-11 rounded-xl text-foreground hover:bg-muted hover:text-primary transition-colors">
                <User className="w-6 h-6 shrink-0" aria-hidden />
              </AccountMenuLink>
              <Link
                href="/favorite"
                className="flex items-center justify-center w-10 h-10 min-[430px]:w-11 min-[430px]:h-11 rounded-xl text-foreground hover:bg-muted hover:text-accent transition-colors relative"
                aria-label="Produsele mele favorite"
              >
                <Heart className="w-6 h-6" aria-hidden />
                <FavoritesBadge className="absolute top-1 right-1 min-w-[18px] h-[18px] px-1 bg-accent rounded-full text-white text-[10px] font-bold flex items-center justify-center" />
              </Link>
              <Link
                href="/cos"
                className="flex items-center justify-center w-10 h-10 min-[430px]:w-11 min-[430px]:h-11 rounded-xl text-foreground hover:bg-muted hover:text-accent transition-colors relative"
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
                phone={phone}
                phoneTel={phoneTel}
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
        <div className="hidden lg:grid grid-cols-[auto_1fr_auto] gap-x-6 max-w-[110rem] mx-auto px-6">
          <Link href="/" className="flex items-center gap-4 py-4 shrink-0 rounded-lg">
            <Logo size={152} className="border-2 border-logo-silver shadow-sm" />
            <span className="block leading-tight">
              <span className="block pr-2 text-4xl font-serif italic font-bold tracking-tight whitespace-nowrap bg-gradient-to-r from-brand-maroon to-brand-red bg-clip-text text-transparent [-webkit-text-stroke:0.4px_var(--brand-maroon)]">
                {SITE_SHORT_NAME}
              </span>
              <span className="block pr-2 text-2xl font-serif italic font-bold tracking-tight bg-gradient-to-r from-brand-maroon to-brand-red bg-clip-text text-transparent [-webkit-text-stroke:0.4px_var(--brand-maroon)] -mt-1">
                Lamour
              </span>
            </span>
          </Link>

          <div className="flex items-center py-7">
            <SearchBar />
          </div>

          <div className="flex items-center gap-1 justify-end py-7">
            <AccessibilityToggle className="px-2" />
            <AccountMenuLink className="flex items-center justify-center w-11 h-11 rounded-xl text-foreground hover:bg-muted hover:text-primary transition-colors">
              <User className="w-5 h-5 shrink-0" aria-hidden />
            </AccountMenuLink>
            <Link
              href="/favorite"
              aria-label="Produsele mele favorite"
              className="flex items-center justify-center w-11 h-11 rounded-xl text-foreground hover:bg-muted hover:text-accent transition-colors relative"
            >
              <Heart className="w-5 h-5 shrink-0" aria-hidden />
              <FavoritesBadge className="absolute top-1 right-1 min-w-[18px] h-[18px] px-1 bg-accent rounded-full text-white text-[10px] font-bold flex items-center justify-center" />
            </Link>
            <Link
              href="/cos"
              aria-label="Coș"
              className="flex items-center justify-center w-11 h-11 rounded-xl text-foreground hover:bg-muted hover:text-accent transition-colors relative"
            >
              <ShoppingCart className="w-5 h-5 shrink-0" aria-hidden />
              <CartBadge className="absolute top-1 right-1 min-w-[18px] h-[18px] px-1 bg-accent rounded-full text-white text-[10px] font-bold flex items-center justify-center" />
            </Link>
          </div>
        </div>
      </div>

      {/* ══ ROW 2: Navbar — desktop only ══ */}
      <div className="hidden lg:flex items-center justify-between gap-10 max-w-[110rem] mx-auto px-6 py-2 border-b border-border">
        {/* Stânga: „Toate categoriile” (aliniat cu sigla de mai sus) */}
        <div className="flex items-center">
          {produseEnabled && (
            <AllCategoriesMenu categories={productsDropdown} buttonClassName="flex items-center gap-3 bg-accent hover:bg-brand-red-dark text-white text-base font-bold pl-6 pr-5 h-14 rounded-2xl shadow-md hover:shadow-lg transition-all uppercase tracking-wide shrink-0 [&>svg:first-child]:w-6 [&>svg:first-child]:h-6 [&>svg:last-child]:w-5 [&>svg:last-child]:h-5" />
          )}
        </div>

        {/* Dreapta: celelalte linkuri (aliniate cu pictogramele de cont/favorite/coș de mai sus) */}
        <nav aria-label="Meniu principal" className="flex items-center gap-10">
          {despreEnabled && <NavDropdown label="Despre noi" href="/despre" items={despreDropdown} />}

          {/* „Catalog” = link simplu; paginile Mobilă / Spații comerciale se aleg din pagina Catalog (secțiunile de sus). */}
          {produseEnabled && (
            <Link href="/produse" className="py-4 text-[15px] font-bold text-primary hover:text-accent transition-colors uppercase tracking-wide rounded">
              Catalog
            </Link>
          )}

          {blogEnabled && (
            <Link href="/blog" className="py-4 text-[15px] font-bold text-primary hover:text-accent transition-colors uppercase tracking-wide rounded">
              Blog
            </Link>
          )}
          {contactEnabled && (
            <Link href="/contact" className="py-4 text-[15px] font-bold text-primary hover:text-accent transition-colors uppercase tracking-wide rounded">
              Contact
            </Link>
          )}
        </nav>
      </div>
    </div>
  );
}
