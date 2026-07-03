import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ExternalLink, Pencil, Plus } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Badge } from "@/app/components/ui/badge";
import AdminPageHeader from "../../components/AdminPageHeader";
import DeleteButton from "../../components/DeleteButton";
import ServiceForm from "../ServiceForm";
import ServiceFeatureIcon from "@/app/components/ServiceFeatureIcon";
import ServiceStepIcon from "@/app/components/ServiceStepIcon";
import { updateServiceAction } from "@/lib/adminServiceActions";
import { deleteServiceStepAction } from "@/lib/adminServiceStepActions";
import { deleteServiceFeatureAction } from "@/lib/adminServiceFeatureActions";
import { deleteServiceChecklistItemAction } from "@/lib/adminServiceChecklistActions";
import { deleteServiceTestimonialAction } from "@/lib/adminServiceTestimonialActions";

export default async function EditServicePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [service, steps, features, checklist, testimonials] = await Promise.all([
    prisma.service.findUnique({ where: { id } }),
    prisma.serviceStep.findMany({ where: { serviceId: id }, orderBy: { order: "asc" } }),
    prisma.serviceFeature.findMany({ where: { serviceId: id }, orderBy: { order: "asc" } }),
    prisma.serviceChecklistItem.findMany({ where: { serviceId: id }, orderBy: { order: "asc" } }),
    prisma.serviceTestimonial.findMany({ where: { serviceId: id }, orderBy: { order: "asc" } }),
  ]);
  if (!service) notFound();

  return (
    <div className="flex flex-col gap-8">
      <div>
        <div className="flex items-center justify-between mb-2">
          <AdminPageHeader title="Editează serviciu" />
          {service.href && (
            <Button variant="outline" size="sm" asChild>
              <a href={service.href} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="w-3.5 h-3.5" aria-hidden />
                Vezi pe site
              </a>
            </Button>
          )}
        </div>
        <ServiceForm action={updateServiceAction} defaults={service} submitLabel="Salvează modificările" />
      </div>

      <div>
        <AdminPageHeader
          title='Pași "Cum lucrăm"'
          description="Pașii afișați pe pagina proprie a acestui serviciu."
          action={
            <Button variant="accent" asChild>
              <Link href={`/admin/servicii/${service.id}/pasi/nou`}>
                <Plus className="w-4 h-4" aria-hidden />
                Adaugă pas
              </Link>
            </Button>
          }
        />

        {steps.length === 0 ? (
          <div className="bg-card border border-border rounded-2xl p-10 text-center text-muted-foreground max-w-xl">
            Nu există pași adăugați încă — pagina serviciului va folosi pașii implicit din cod.
          </div>
        ) : (
          <div className="bg-card border border-border rounded-2xl overflow-hidden max-w-xl">
            <div className="divide-y divide-border">
              {steps.map((step) => (
                <div key={step.id} className="flex items-center gap-4 p-4">
                  <div className="relative w-14 h-14 rounded-xl bg-muted overflow-hidden shrink-0 flex items-center justify-center [&>div>svg]:w-8 [&>div>svg]:h-8">
                    <ServiceStepIcon title={step.title} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm text-primary truncate">{step.title}</p>
                    <p className="text-xs text-muted-foreground truncate">{step.description}</p>
                  </div>
                  <div className="flex items-center gap-0.5 shrink-0">
                    <Button variant="ghost" size="icon" asChild>
                      <Link href={`/admin/servicii/${service.id}/pasi/${step.id}`} aria-label={`Editează pasul ${step.title}`}>
                        <Pencil className="w-4 h-4" aria-hidden />
                      </Link>
                    </Button>
                    <DeleteButton
                      action={deleteServiceStepAction}
                      id={step.id}
                      confirmText="Sigur vrei să ștergi acest pas?"
                      label={`Șterge pasul ${step.title}`}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div>
        <AdminPageHeader
          title="Caracteristici (carduri cu beneficii)"
          description="Cele 4 carduri afișate sub hero, pe pagina proprie a acestui serviciu."
          action={
            <Button variant="accent" asChild>
              <Link href={`/admin/servicii/${service.id}/caracteristici/nou`}>
                <Plus className="w-4 h-4" aria-hidden />
                Adaugă caracteristică
              </Link>
            </Button>
          }
        />

        {features.length === 0 ? (
          <div className="bg-card border border-border rounded-2xl p-10 text-center text-muted-foreground max-w-xl">
            Nu există caracteristici adăugate încă — pagina serviciului va folosi cele implicite din cod.
          </div>
        ) : (
          <div className="bg-card border border-border rounded-2xl overflow-hidden max-w-xl">
            <div className="divide-y divide-border">
              {features.map((feature) => (
                <div key={feature.id} className="flex items-center gap-4 p-4">
                  <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center shrink-0">
                    <ServiceFeatureIcon icon={feature.icon} className="w-6 h-6 text-accent" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm text-primary truncate">{feature.title}</p>
                    <p className="text-xs text-muted-foreground truncate">{feature.description}</p>
                  </div>
                  <div className="flex items-center gap-0.5 shrink-0">
                    <Button variant="ghost" size="icon" asChild>
                      <Link href={`/admin/servicii/${service.id}/caracteristici/${feature.id}`} aria-label={`Editează caracteristica ${feature.title}`}>
                        <Pencil className="w-4 h-4" aria-hidden />
                      </Link>
                    </Button>
                    <DeleteButton
                      action={deleteServiceFeatureAction}
                      id={feature.id}
                      confirmText="Sigur vrei să ștergi această caracteristică?"
                      label={`Șterge caracteristica ${feature.title}`}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div>
        <AdminPageHeader
          title='Bife ("Ce include")'
          description="Lista de bife afișată în secțiunea Despre serviciu."
          action={
            <Button variant="accent" asChild>
              <Link href={`/admin/servicii/${service.id}/bife/nou`}>
                <Plus className="w-4 h-4" aria-hidden />
                Adaugă bifă
              </Link>
            </Button>
          }
        />

        {checklist.length === 0 ? (
          <div className="bg-card border border-border rounded-2xl p-10 text-center text-muted-foreground max-w-xl">
            Nu există bife adăugate încă — pagina serviciului va folosi lista implicită din cod.
          </div>
        ) : (
          <div className="bg-card border border-border rounded-2xl overflow-hidden max-w-xl">
            <div className="divide-y divide-border">
              {checklist.map((item) => (
                <div key={item.id} className="flex items-center gap-4 p-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-primary truncate">{item.text}</p>
                  </div>
                  <div className="flex items-center gap-0.5 shrink-0">
                    <Button variant="ghost" size="icon" asChild>
                      <Link href={`/admin/servicii/${service.id}/bife/${item.id}`} aria-label={`Editează bifa "${item.text}"`}>
                        <Pencil className="w-4 h-4" aria-hidden />
                      </Link>
                    </Button>
                    <DeleteButton
                      action={deleteServiceChecklistItemAction}
                      id={item.id}
                      confirmText="Sigur vrei să ștergi această bifă?"
                      label={`Șterge bifa "${item.text}"`}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div>
        <AdminPageHeader
          title="Testimoniale"
          description="Recenziile afișate la secțiunea Ce spun clienții noștri."
          action={
            <Button variant="accent" asChild>
              <Link href={`/admin/servicii/${service.id}/testimoniale/nou`}>
                <Plus className="w-4 h-4" aria-hidden />
                Adaugă testimonial
              </Link>
            </Button>
          }
        />

        {testimonials.length === 0 ? (
          <div className="bg-card border border-border rounded-2xl p-10 text-center text-muted-foreground max-w-xl">
            Nu există testimoniale adăugate încă — pagina serviciului va folosi cele implicite din cod.
          </div>
        ) : (
          <div className="bg-card border border-border rounded-2xl overflow-hidden max-w-xl">
            <div className="divide-y divide-border">
              {testimonials.map((testimonial) => (
                <div key={testimonial.id} className="flex items-center gap-4 p-4">
                  <div className="w-11 h-11 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-sm font-extrabold shrink-0">
                    {testimonial.initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm text-primary truncate">{testimonial.name} · {testimonial.city}</p>
                    <p className="text-xs text-muted-foreground truncate">{testimonial.text}</p>
                  </div>
                  <div className="flex items-center gap-0.5 shrink-0">
                    <Button variant="ghost" size="icon" asChild>
                      <Link href={`/admin/servicii/${service.id}/testimoniale/${testimonial.id}`} aria-label={`Editează testimonialul lui ${testimonial.name}`}>
                        <Pencil className="w-4 h-4" aria-hidden />
                      </Link>
                    </Button>
                    <DeleteButton
                      action={deleteServiceTestimonialAction}
                      id={testimonial.id}
                      confirmText="Sigur vrei să ștergi acest testimonial?"
                      label={`Șterge testimonialul lui ${testimonial.name}`}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
