import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import AdminPageHeader from "../../../../components/AdminPageHeader";
import ServiceFeatureForm from "../../../ServiceFeatureForm";
import { updateServiceFeatureAction } from "@/lib/adminServiceFeatureActions";

export default async function EditServiceFeaturePage({
  params,
}: {
  params: Promise<{ id: string; featureId: string }>;
}) {
  const { id, featureId } = await params;
  const [service, feature] = await Promise.all([
    prisma.service.findUnique({ where: { id } }),
    prisma.serviceFeature.findUnique({ where: { id: featureId } }),
  ]);
  if (!service || !feature) notFound();

  return (
    <div>
      <AdminPageHeader title={`Editează caracteristică — ${service.title}`} />
      <ServiceFeatureForm action={updateServiceFeatureAction} serviceId={service.id} defaults={feature} submitLabel="Salvează modificările" />
    </div>
  );
}
