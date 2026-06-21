import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import AdminPageHeader from "../../../../components/AdminPageHeader";
import ServiceTestimonialForm from "../../../ServiceTestimonialForm";
import { updateServiceTestimonialAction } from "@/lib/adminServiceTestimonialActions";

export default async function EditServiceTestimonialPage({
  params,
}: {
  params: Promise<{ id: string; testimonialId: string }>;
}) {
  const { id, testimonialId } = await params;
  const [service, testimonial] = await Promise.all([
    prisma.service.findUnique({ where: { id } }),
    prisma.serviceTestimonial.findUnique({ where: { id: testimonialId } }),
  ]);
  if (!service || !testimonial) notFound();

  return (
    <div>
      <AdminPageHeader title={`Editează testimonial — ${service.title}`} />
      <ServiceTestimonialForm action={updateServiceTestimonialAction} serviceId={service.id} defaults={testimonial} submitLabel="Salvează modificările" />
    </div>
  );
}
