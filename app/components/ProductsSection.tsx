import Link from "next/link";
import ProductCard from "./ProductCard";
import ProductsCarousel from "./ProductsCarousel";
import { Button } from "@/app/components/ui/button";
import { localProductImages, localProductBadges, localProductNames } from "@/lib/productOverrides";
import { getSectionFlags } from "@/lib/siteSettings";
import type { PriceTier } from "@/lib/pricing";
import { MotifBackground, HeadingFlourish } from "@/app/components/ui/motif";
import { getCatalog } from "@/lib/catalog";
import { resolveHighlight, rootSlugById } from "@/lib/productHighlight";

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  oldPrice: number | null;
  image: string | null;
  rating: number;
  reviewCount: number;
  badge: string | null;
  installmentsEnabled?: boolean;
  images?: string[];
  packageQuantity?: string | null;
  priceTiers?: PriceTier[];
  bulkMinQty?: number | null;
  bulkPrice?: number | null;
  categoryId?: string;
  createdAt?: Date | string | number;
  highlight?: string | null;
  isNewProduct?: boolean | null;
  salesCount?: number | null;
}

interface VariantOption {
  slug: string;
  variantLabel: string | null;
  price: number;
  oldPrice: number | null;
}

interface Props {
  products: Product[];
  title?: string;
  highlighted?: string;
  viewAllHref?: string;
  viewAllLabel?: string;
  bg?: string;
  showDiscount?: boolean;
  variantOptionsMap?: Map<string, VariantOption[]>;
}

export default async function ProductsSection({ products, title = "Produse", highlighted = "recomandate", viewAllHref = "/produse", viewAllLabel = "Vezi toate produsele", bg = "bg-background", showDiscount = false, variantOptionsMap }: Props) {
  const { ratesEnabled, installmentMonths } = await getSectionFlags();
  // Categoria de la rădăcină (pentru eticheta „De sezon"): din catalogul din cache, deci fără interogări în plus.
  const rootSlugs = await getCatalog()
    .then(({ categories }) => rootSlugById(categories))
    .catch(() => new Map<string, string>());
  return (
    <section className={`relative overflow-hidden py-8 sm:py-10 ${bg}`}>
      <MotifBackground />
      <div className="relative max-w-7xl mx-auto px-4">
        <div className="flex items-center gap-4 mb-6 flex-wrap">
          <h2 className="text-2xl sm:text-3xl font-bold text-primary tracking-tight uppercase max-w-full text-balance">
            {title} <span className="text-accent">{highlighted}</span>
          </h2>
          <div className="flex items-center gap-3 flex-1 min-w-[60px]">
            <HeadingFlourish />
            <span className="h-px flex-1 bg-gradient-to-r from-brand-rose to-brand-rose/15" />
          </div>
          <Button asChild variant="accent" size="sm" className="shrink-0">
            <Link href={viewAllHref}>{viewAllLabel}</Link>
          </Button>
        </div>

        <ProductsCarousel viewAllHref={viewAllHref} viewAllLabel={viewAllLabel} ariaLabel={`${title} ${highlighted}`.trim()}>
          {products.map((product) => (
            <ProductCard
              key={product.id}
              // Doar câmpurile de care are nevoie cardul: un obiect Product întreg (descriere, specificații...) ar fi
              // serializat în HTML pentru fiecare card și ar umfla pagina de start.
              slug={product.slug}
              price={product.price}
              oldPrice={product.oldPrice}
              rating={product.rating}
              reviewCount={product.reviewCount}
              images={product.images?.slice(0, 1)}
              packageQuantity={product.packageQuantity}
              priceTiers={product.priceTiers}
              bulkMinQty={product.bulkMinQty}
              bulkPrice={product.bulkPrice}
              name={localProductNames[product.slug] ?? product.name}
              image={localProductImages[product.slug] ?? product.image}
              badge={localProductBadges[product.slug] ?? product.badge}
              showDiscount={showDiscount}
              installmentsEnabled={ratesEnabled && product.installmentsEnabled !== false}
              installmentMonths={installmentMonths}
              variantOptions={variantOptionsMap?.get(product.id)}
              highlight={resolveHighlight({
                highlight: product.highlight,
                isNewProduct: product.isNewProduct,
                salesCount: product.salesCount,
                createdAt: product.createdAt,
                rootCategorySlug: product.categoryId ? rootSlugs.get(product.categoryId) : null,
              })}
            />
          ))}
        </ProductsCarousel>
      </div>
    </section>
  );
}
