import { prisma } from "@/lib/prisma";
import AdminPageHeader from "../../components/AdminPageHeader";
import ProductForm from "../ProductForm";
import { createProductAction } from "@/lib/adminProductActions";

export default async function NewProductPage({
  searchParams,
}: {
  searchParams: Promise<{ variantGroupId?: string }>;
}) {
  const { variantGroupId } = await searchParams;
  const [categories, brandRows, variantOptions, variantLabelRows] = await Promise.all([
    prisma.category.findMany({ orderBy: { name: "asc" } }),
    prisma.product.findMany({ where: { brand: { not: null } }, distinct: ["brand"], select: { brand: true }, orderBy: { brand: "asc" } }),
    prisma.product.findMany({ where: { variantGroupId: null }, select: { id: true, name: true }, orderBy: { name: "asc" } }),
    prisma.product.findMany({ where: { variantLabel: { not: null } }, distinct: ["variantLabel"], select: { variantLabel: true }, orderBy: { variantLabel: "asc" } }),
  ]);
  const brands = brandRows.map((b) => b.brand!).filter(Boolean);
  const variantLabels = variantLabelRows.map((v) => v.variantLabel!).filter(Boolean);

  return (
    <div>
      <AdminPageHeader title="Adaugă produs" />
      <ProductForm
        action={createProductAction}
        defaults={variantGroupId ? { variantGroupId } : undefined}
        categories={categories}
        brands={brands}
        variantOptions={variantOptions}
        variantLabels={variantLabels}
        submitLabel="Adaugă produs"
      />
    </div>
  );
}
