import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import AdminPageHeader from "../../../components/AdminPageHeader";
import CategoryForm from "../CategoryForm";
import { updateCategoryAction } from "@/lib/adminCategoryActions";

export default async function EditCategoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const category = await prisma.category.findUnique({ where: { id } });
  if (!category) notFound();

  return (
    <div>
      <AdminPageHeader title="Editează categorie" />
      <CategoryForm action={updateCategoryAction} defaults={category} submitLabel="Salvează modificările" />
    </div>
  );
}
