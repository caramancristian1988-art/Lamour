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
      <AdminPageHeader title="Editează produs" />
      <ProductForm action={updateProductAction} defaults={product} categories={categories} brands={brands} submitLabel="Salvează modificările" />
    </div>
  );
}
