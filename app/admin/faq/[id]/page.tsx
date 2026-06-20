import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import AdminPageHeader from "../../components/AdminPageHeader";
import FaqForm from "../FaqForm";
import { updateFaqAction } from "@/lib/adminFaqActions";

export default async function EditFaqPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const faq = await prisma.faq.findUnique({ where: { id } });
  if (!faq) notFound();

  return (
    <div>
      <AdminPageHeader title="Editează întrebarea" />
      <FaqForm action={updateFaqAction} defaults={faq} submitLabel="Salvează modificările" />
    </div>
  );
}
