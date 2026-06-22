import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import AdminPageHeader from "../../components/AdminPageHeader";
import ProductForm from "../ProductForm";
import { updateProductAction } from "@/lib/adminProductActions";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [product, categories, brandRows] = await Promise.all([
    prisma.product.findUnique({ where: { id } }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
    prisma.product.findMany({ where: { brand: { not: null } }, distinct: ["brand"], select: { brand: true }, orderBy: { brand: "asc" } }),
  ]);
  if (!product) notFound();
  const brands = brandRows.map((b) => b.brand!).filter(Boolean);

  return (
    <div>
      <AdminPageHeader
        title="Editează produs"
        action={
          <Link
            href={`/produse/${product.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-400 hover:text-[#c7092b] transition-colors"
          >
            Vezi pe site
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </Link>
        }
      />
      <ProductForm action={updateProductAction} defaults={product} categories={categories} brands={brands} submitLabel="Salvează modificările" />
    </div>
  );
}
