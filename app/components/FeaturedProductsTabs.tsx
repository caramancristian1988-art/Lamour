"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Sofa, Building2 } from "lucide-react";
import ProductCard from "./ProductCard";
import { localProductImages, localProductBadges, localProductNames } from "@/lib/productOverrides";
import { HeadingFlourish, MotifBackground } from "@/app/components/ui/motif";

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
  packageQuantity?: string | null;
  installmentsEnabled?: boolean;
}

const tabs = [
  { key: "noi", label: "Produse noi" },
  { key: "recomandate", label: "Produse recomandate" },
  { key: "uz-casnic", label: "Uz casnic" },
] as const;

type TabKey = (typeof tabs)[number]["key"];

export default function FeaturedProductsTabs({
  newProducts,
  recommendedProducts,
  householdProducts,
  ratesEnabled,
  installmentMonths,
}: {
  newProducts: Product[];
  recommendedProducts: Product[];
  householdProducts: Product[];
  ratesEnabled: boolean;
  installmentMonths: number;
}) {
  const [active, setActive] = useState<TabKey>("noi");
  const productsByTab: Record<TabKey, Product[]> = {
    noi: newProducts,
    recomandate: recommendedProducts,
    "uz-casnic": householdProducts,
  };
  const products = productsByTab[active];

  return (
    <section className="relative overflow-hidden py-16 sm:py-20 bg-background">
      <MotifBackground />
      <div className="relative max-w-7xl mx-auto px-4">
        <div className="flex items-center gap-2.5 mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-primary tracking-tight uppercase">Descoperă mai mult</h2>
          <HeadingFlourish />
        </div>

        <div className="flex items-center gap-2.5 flex-wrap mb-10">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActive(tab.key)}
              className={`px-5 py-2.5 rounded-full text-sm font-bold transition-colors ${
                active === tab.key
                  ? "bg-primary text-white"
                  : "bg-card border border-border text-foreground hover:border-accent hover:text-accent"
              }`}
            >
              {tab.label}
            </button>
          ))}
          <span className="w-px h-6 bg-border mx-1 hidden sm:block" aria-hidden />
          <Link
            href="/mobila"
            className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold bg-card border border-border text-foreground hover:border-accent hover:text-accent transition-colors"
          >
            <Sofa className="w-4 h-4" aria-hidden />
            Mobilă
            <ArrowRight className="w-3.5 h-3.5" aria-hidden />
          </Link>
          <Link
            href="/spatii-comerciale"
            className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold bg-card border border-border text-foreground hover:border-accent hover:text-accent transition-colors"
          >
            <Building2 className="w-4 h-4" aria-hidden />
            Chirie
            <ArrowRight className="w-3.5 h-3.5" aria-hidden />
          </Link>
        </div>

        {products.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-5">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                {...product}
                name={localProductNames[product.slug] ?? product.name}
                image={localProductImages[product.slug] ?? product.image}
                badge={localProductBadges[product.slug] ?? product.badge}
                installmentsEnabled={ratesEnabled && product.installmentsEnabled !== false}
                installmentMonths={installmentMonths}
              />
            ))}
          </div>
        ) : (
          <p className="text-center text-muted-foreground py-10">Momentan nu există produse în această categorie.</p>
        )}
      </div>
    </section>
  );
}
