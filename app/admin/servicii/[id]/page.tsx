import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import AdminPageHeader from "../../components/AdminPageHeader";
import ServiceForm from "../ServiceForm";
import { updateServiceAction } from "@/lib/adminServiceActions";

export default async function EditServicePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const service = await prisma.service.findUnique({ where: { id } });
  if (!service) notFound();

  return (
    <div>
      <AdminPageHeader title="Editează serviciu" />
      <ServiceForm action={updateServiceAction} defaults={service} submitLabel="Salvează modificările" />
    </div>
  );
}
