import { prisma } from "@/lib/prisma";
import AdminPageHeader from "../../components/AdminPageHeader";
import ProductForm from "../ProductForm";
import { createProductAction } from "@/lib/adminProductActions";

export default async function NewProductPage() {
  const [categories, brandRows] = await Promise.all([
    prisma.category.findMany({ orderBy: { name: "asc" } }),
    prisma.product.findMany({ where: { brand: { not: null } }, distinct: ["brand"], select: { brand: true }, orderBy: { brand: "asc" } }),
  ]);
  const brands = brandRows.map((b) => b.brand!).filter(Boolean);

  return (
    <div>
      <AdminPageHeader title="Adaugă produs" />
      <ProductForm action={createProductAction} categories={categories} brands={brands} submitLabel="Adaugă produs" />
    </div>
  );
}
