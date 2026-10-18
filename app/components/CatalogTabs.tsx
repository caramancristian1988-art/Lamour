import Link from "next/link";

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
