import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import AdminPageHeader from "../../../../components/AdminPageHeader";
import ProductFaqForm from "../../../ProductFaqForm";
import { createProductFaqAction } from "@/lib/adminProductFaqActions";

export default async function NewProductFaqPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) notFound();

  return (
    <div>
      <AdminPageHeader title={`Adaugă întrebare — ${product.name}`} />
      <ProductFaqForm action={createProductFaqAction} productId={product.id} submitLabel="Adaugă întrebarea" />
    </div>
  );
}
