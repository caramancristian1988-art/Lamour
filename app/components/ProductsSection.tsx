import Link from "next/link";
import ProductCard from "./ProductCard";
import { Button } from "@/app/components/ui/button";
import { localProductImages, localProductBadges, localProductNames } from "@/lib/productOverrides";
import { getSectionFlags } from "@/lib/siteSettings";
import { MotifBackground, HeadingFlourish } from "@/app/components/ui/motif";

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
}

interface Props {
  products: Product[];
  title?: string;
  highlighted?: string;
  viewAllHref?: string;
  viewAllLabel?: string;
  bg?: string;
  showDiscount?: boolean;
}

export default async function ProductsSection({ products, title = "Produse", highlighted = "recomandate", viewAllHref = "/produse", viewAllLabel = "Vezi toate produsele", bg = "bg-background", showDiscount = false }: Props) {
  const { ratesEnabled, installmentMonths } = await getSectionFlags();
  return (
    <section className={`relative overflow-hidden py-16 sm:py-20 ${bg}`}>
      <MotifBackground />
      <div className="relative max-w-7xl mx-auto px-4">
        <div className="flex items-center gap-4 mb-10 flex-wrap">
          <h2 className="text-2xl sm:text-3xl font-bold text-primary tracking-tight uppercase shrink-0">
            {title} <span className="text-accent">{highlighted}</span>
          </h2>
          <div className="flex items-center gap-3 flex-1 min-w-[60px]">
            <HeadingFlourish />
            <span className="h-px flex-1 bg-gradient-to-r from-brand-rose to-transparent" />
          </div>
          <Button asChild variant="accent" size="sm" className="shrink-0">
            <Link href={viewAllHref}>{viewAllLabel}</Link>
          </Button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-5">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              {...product}
              name={localProductNames[product.slug] ?? product.name}
              image={localProductImages[product.slug] ?? product.image}
              badge={localProductBadges[product.slug] ?? product.badge}
              showDiscount={showDiscount}
              installmentsEnabled={ratesEnabled && product.installmentsEnabled !== false}
              installmentMonths={installmentMonths}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
