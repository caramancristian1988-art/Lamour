import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import AdminPageHeader from "../../../../components/AdminPageHeader";
import ServiceTestimonialForm from "../../../ServiceTestimonialForm";
import { createServiceTestimonialAction } from "@/lib/adminServiceTestimonialActions";

export default async function NewServiceTestimonialPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const service = await prisma.service.findUnique({ where: { id } });
  if (!service) notFound();

  return (
    <div>
      <AdminPageHeader title={`Adaugă testimonial — ${service.title}`} />
      <ServiceTestimonialForm action={createServiceTestimonialAction} serviceId={service.id} submitLabel="Adaugă testimonial" />
    </div>
  );
}
