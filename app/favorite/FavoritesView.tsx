"use client";

import Link from "next/link";
import { Heart } from "lucide-react";
import { useFavorites } from "../components/FavoritesProvider";
import ProductCard from "../components/ProductCard";
import { Button } from "@/app/components/ui/button";
import type { CatalogProduct } from "@/lib/clientCatalog";
import type { VariantOption } from "@/lib/productListing";

// Favoritele din browser păstrează doar slug-ul + o copie veche a cardului (fără „rate dezactivate", oferta la cantitate, eticheta etc.).
// Cardul se desenează din datele ACTUALE ale catalogului (trimise o singură dată de pagina statică), ca să arate exact ca în Catalog:
// aceleași prețuri, aceeași ofertă la bucată, rate doar unde sunt permise. Produsele șterse între timp nu se mai afișează.
export default function FavoritesView({
  products,
  variantOptions,
  ratesEnabled,
  installmentMonths,
}: {
  products: CatalogProduct[];
  variantOptions: Record<string, VariantOption[]>;
  ratesEnabled: boolean;
  installmentMonths: number;
}) {
  const { favorites } = useFavorites();
  const bySlug = new Map(products.map((p) => [p.slug, p]));
  const items = favorites.map((f) => bySlug.get(f.slug)).filter((p): p is CatalogProduct => Boolean(p));

  return (
    <>
      <p className="text-muted-foreground text-sm">
        {items.length > 0
          ? `${items.length} produs${items.length === 1 ? "" : "e"} salvat${items.length === 1 ? "" : "e"}`
          : "Nu ai salvat încă niciun produs favorit."}
      </p>

      <div className="mt-6">
        {items.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-5">
            {items.map((product) => (
              <ProductCard
                key={product.id}
                name={product.name}
                slug={product.slug}
                price={product.price}
                oldPrice={product.oldPrice}
                image={product.image}
                packageQuantity={product.packageQuantity}
                rating={product.rating}
                reviewCount={product.reviewCount}
                badge={product.badge}
                priceTiers={product.priceTiers}
                bulkMinQty={product.bulkMinQty}
                bulkPrice={product.bulkPrice}
                installmentsEnabled={ratesEnabled && product.installmentsEnabled}
                installmentMonths={installmentMonths}
                variantOptions={variantOptions[product.id]}
                highlight={product.highlight}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <Heart className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" strokeWidth={1.5} aria-hidden />
            <p className="text-muted-foreground mb-6">Apasă pe inimioara unui produs pentru a-l salva aici.</p>
            <Button asChild variant="primary">
              <Link href="/produse">Vezi produsele</Link>
            </Button>
          </div>
        )}
      </div>
    </>
  );
}
