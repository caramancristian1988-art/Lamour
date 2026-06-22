import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import AdminPageHeader from "../../../../components/AdminPageHeader";
import ProductFaqForm from "../../../ProductFaqForm";
import { updateProductFaqAction } from "@/lib/adminProductFaqActions";

export default async function EditProductFaqPage({
  params,
}: {
  params: Promise<{ id: string; faqId: string }>;
}) {
  const { id, faqId } = await params;
  const [product, faq] = await Promise.all([
    prisma.product.findUnique({ where: { id } }),
    prisma.productFaq.findUnique({ where: { id: faqId } }),
  ]);
  if (!product || !faq) notFound();

  return (
    <div>
      <AdminPageHeader title={`Editează întrebare — ${product.name}`} />
      <ProductFaqForm action={updateProductFaqAction} productId={product.id} defaults={faq} submitLabel="Salvează modificările" />
    </div>
  );
}
