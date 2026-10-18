import Link from "next/link";
import { getCatalog } from "@/lib/catalog";
import { getSectionFlags } from "@/lib/siteSettings";
import { toCatalogProduct, variantOptionsRecord } from "@/lib/clientCatalog";
import { rootSlugById } from "@/lib/productHighlight";
import FavoritesView from "./FavoritesView";

// Pagină statică (fără apel la server per vizitator): catalogul compact vine odată cu pagina, iar lista de favorite
// (din browserul vizitatorului) se potrivește cu el în FavoritesView.
export const revalidate = 86400;

export default async function FavoritePage() {
  let products: ReturnType<typeof toCatalogProduct>[] = [];
  let variantOptions: ReturnType<typeof variantOptionsRecord> = {};
  try {
    const { categories, products: all } = await getCatalog();
    const rootSlugs = rootSlugById(categories);
    products = all.map((p) => toCatalogProduct(p, rootSlugs.get(p.categoryId)));
    variantOptions = variantOptionsRecord(all);
  } catch {
    // fără catalog: lista rămâne goală (nu afișăm carduri cu date posibil greșite)
  }
  const { ratesEnabled, installmentMonths } = await getSectionFlags();

  return (
    <main className="page-motif min-h-[60vh]">
      <section className="border-b border-border bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-8">
          <nav className="flex items-center gap-1.5 text-xs text-muted-foreground mb-4" aria-label="Fir de ariadnă">
            <Link href="/" className="hover:text-accent transition-colors">Acasă</Link>
            <span aria-hidden>›</span>
            <span className="text-foreground">Favorite</span>
          </nav>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-primary">
            Produsele mele <span className="text-accent">favorite</span>
          </h1>
        </div>
      </section>

      <section className="pb-10 pt-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
          <FavoritesView
            products={products}
            variantOptions={variantOptions}
            ratesEnabled={ratesEnabled}
            installmentMonths={installmentMonths}
          />
        </div>
      </section>
    </main>
  );
}
