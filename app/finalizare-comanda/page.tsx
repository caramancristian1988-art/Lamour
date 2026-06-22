import Link from "next/link";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { fallbackPopularProducts } from "@/lib/fallbackData";
import CheckoutPanel from "@/app/components/CheckoutPanel";
import ProductsSection from "@/app/components/ProductsSection";
import TrustBar from "@/app/components/TrustBar";

export const metadata: Metadata = {
  title: "Finalizare comandă | Climat Rapid",
};

async function getPopularProducts() {
  try {
    const products = await prisma.product.findMany({ take: 4, orderBy: { reviewCount: "desc" } });
    if (products.length === 0) throw new Error("empty");
    return products;
  } catch {
    return fallbackPopularProducts;
  }
}

export default async function FinalizareComandaPage() {
  const popularProducts = await getPopularProducts();

  return (
    <main className="bg-white min-h-[60vh]">
      <section className="border-b border-gray-100 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-8">
          <nav className="flex items-center gap-1.5 text-xs text-gray-400 mb-4">
            <Link href="/" className="hover:text-[#c7092b] transition-colors">Acasă</Link>
            <span>›</span>
            <Link href="/cos" className="hover:text-[#c7092b] transition-colors">Coș</Link>
            <span>›</span>
            <span className="text-gray-600">Finalizare comandă</span>
          </nav>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#1d2353]">
            Finalizează <span className="text-[#c7092b]">comanda</span>
          </h1>
          <p className="text-gray-500 text-sm mt-2">
            Completează datele tale, te contactăm pentru confirmare și livrare.
          </p>
        </div>
      </section>

      <section className="py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
          <CheckoutPanel />
        </div>
      </section>

      <TrustBar />

      <ProductsSection
        products={popularProducts}
        title="Produse"
        highlighted="cele mai vândute"
        viewAllHref="/produse?sort=rating"
      />
    </main>
  );
}
