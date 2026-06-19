import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import AdminPageHeader from "../../../../components/AdminPageHeader";
import ServiceStepForm from "../../../ServiceStepForm";
import { updateServiceStepAction } from "@/lib/adminServiceStepActions";

export default async function EditServiceStepPage({
  params,
}: {
  params: Promise<{ id: string; stepId: string }>;
}) {
  const { id, stepId } = await params;
  const [service, step] = await Promise.all([
    prisma.service.findUnique({ where: { id } }),
    prisma.serviceStep.findUnique({ where: { id: stepId } }),
  ]);
  if (!service || !step) notFound();

  return (
    <div>
      <AdminPageHeader title={`Editează pas — ${service.title}`} />
      <ServiceStepForm action={updateServiceStepAction} serviceId={service.id} defaults={step} submitLabel="Salvează modificările" />
    </div>
  );
}
