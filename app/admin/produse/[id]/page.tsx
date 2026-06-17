import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import AdminPageHeader from "../../components/AdminPageHeader";
import ProductForm from "../ProductForm";
import { updateProductAction } from "@/lib/adminProductActions";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [product, categories] = await Promise.all([
    prisma.product.findUnique({ where: { id } }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
  ]);
  if (!product) notFound();

  return (
    <div>
      <AdminPageHeader title="Editează produs" />
      <ProductForm action={updateProductAction} defaults={product} categories={categories} submitLabel="Salvează modificările" />
    </div>
  );
}
