import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import AdminPageHeader from "../../../../components/AdminPageHeader";
import ServiceStepForm from "../../../ServiceStepForm";
import { createServiceStepAction } from "@/lib/adminServiceStepActions";

export default async function NewServiceStepPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const service = await prisma.service.findUnique({ where: { id } });
  if (!service) notFound();

  return (
    <div>
      <AdminPageHeader title={`Adaugă pas — ${service.title}`} />
      <ServiceStepForm action={createServiceStepAction} serviceId={service.id} submitLabel="Adaugă pas" />
    </div>
  );
}
