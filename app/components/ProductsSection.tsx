import Link from "next/link";
import { ArrowRight } from "lucide-react";
import ProductCard from "./ProductCard";
import { localProductImages, localProductBadges, localProductNames } from "@/lib/productOverrides";
import { getSectionFlags } from "@/lib/siteSettings";

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  oldPrice: number | null;
  image: string | null;
  btu: number | null;
  technology: string;
  energyClass: string | null;
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
  bg?: string;
  showDiscount?: boolean;
}

export default async function ProductsSection({ products, title = "Produse", highlighted = "recomandate", viewAllHref = "/produse", bg = "bg-background", showDiscount = false }: Props) {
  const { ratesEnabled, installmentMonths } = await getSectionFlags();
  return (
    <section className={`py-16 sm:py-20 ${bg}`}>
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-end justify-between mb-10 gap-4">
          <h2 className="text-2xl sm:text-3xl font-bold text-primary tracking-tight">
            {title} <span className="text-accent">{highlighted}</span>
          </h2>
          <Link href={viewAllHref} className="text-sm text-accent hover:underline font-semibold flex items-center gap-1 shrink-0 rounded">
            Vezi toate produsele
            <ArrowRight className="w-4 h-4" aria-hidden />
          </Link>
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
