import Link from "next/link";
import { NavChips } from "./ProductsNav";

export type Division = "uz-casnic" | "mobila" | "chirie";

// Secțiunile Catalogului — fiecare duce la pagina ei (înainte erau într-un meniu derulant din navbar).
const CATALOG_SECTIONS: { key: string; label: string; href: string; divisions?: Division[] }[] = [
  { key: "hartie", label: "Produse din hârtie", href: "/produse", divisions: ["uz-casnic"] },
  { key: "mobila", label: "Mobilă", href: "/mobila", divisions: ["mobila"] },
  { key: "spatii", label: "Spații comerciale", href: "/spatii-comerciale", divisions: ["chirie"] },
];

export function DivisionTabs({ active }: { active: Division }) {
  return (
    <NavChips
      size="lg"
      ariaLabel="Secțiunile catalogului"
      className="flex items-center gap-2 sm:gap-3 flex-wrap mb-6"
      items={CATALOG_SECTIONS.map((s) => ({
        key: s.key,
        href: s.href,
        label: s.label,
        active: Boolean(s.divisions?.includes(active)),
      }))}
    />
  );
}

export function Breadcrumb() {
  return (
    <section>
      <div className="max-w-[110rem] mx-auto px-4 sm:px-6 pt-4 pb-1">
        <nav className="flex items-center gap-1.5 text-xs text-muted-foreground" aria-label="Fir de ariadnă">
          <Link href="/" className="hover:text-accent transition-colors">Acasă</Link>
          <span aria-hidden>›</span>
          <span className="text-foreground">Catalog</span>
        </nav>
      </div>
    </section>
  );
}

