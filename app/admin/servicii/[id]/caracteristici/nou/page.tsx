import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import AdminPageHeader from "../../../../components/AdminPageHeader";
import ServiceFeatureForm from "../../../ServiceFeatureForm";
import { createServiceFeatureAction } from "@/lib/adminServiceFeatureActions";

export default async function NewServiceFeaturePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const service = await prisma.service.findUnique({ where: { id } });
  if (!service) notFound();

  return (
    <div>
      <AdminPageHeader title={`Adaugă caracteristică — ${service.title}`} />
      <ServiceFeatureForm action={createServiceFeatureAction} serviceId={service.id} submitLabel="Adaugă caracteristică" />
    </div>
  );
}
