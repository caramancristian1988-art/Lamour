import { prisma } from "@/lib/prisma";
import AdminPageHeader from "../../components/AdminPageHeader";
import ProductForm from "../ProductForm";
import { createProductAction } from "@/lib/adminProductActions";

export default async function NewProductPage() {
  const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });

  return (
    <div>
      <AdminPageHeader title="Adaugă produs" />
      <ProductForm action={createProductAction} categories={categories} submitLabel="Adaugă produs" />
    </div>
  );
}
