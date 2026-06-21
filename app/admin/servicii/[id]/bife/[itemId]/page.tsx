import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import AdminPageHeader from "../../../../components/AdminPageHeader";
import ServiceChecklistForm from "../../../ServiceChecklistForm";
import { updateServiceChecklistItemAction } from "@/lib/adminServiceChecklistActions";

export default async function EditServiceChecklistItemPage({
  params,
}: {
  params: Promise<{ id: string; itemId: string }>;
}) {
  const { id, itemId } = await params;
  const [service, item] = await Promise.all([
    prisma.service.findUnique({ where: { id } }),
    prisma.serviceChecklistItem.findUnique({ where: { id: itemId } }),
  ]);
  if (!service || !item) notFound();

  return (
    <div>
      <AdminPageHeader title={`Editează bifă — ${service.title}`} />
      <ServiceChecklistForm action={updateServiceChecklistItemAction} serviceId={service.id} defaults={item} submitLabel="Salvează modificările" />
    </div>
  );
}
