import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import AdminPageHeader from "../../../../components/AdminPageHeader";
import ServiceChecklistForm from "../../../ServiceChecklistForm";
import { createServiceChecklistItemAction } from "@/lib/adminServiceChecklistActions";

export default async function NewServiceChecklistItemPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const service = await prisma.service.findUnique({ where: { id } });
  if (!service) notFound();

  return (
    <div>
      <AdminPageHeader title={`Adaugă bifă — ${service.title}`} />
      <ServiceChecklistForm action={createServiceChecklistItemAction} serviceId={service.id} submitLabel="Adaugă bifă" />
    </div>
  );
}
