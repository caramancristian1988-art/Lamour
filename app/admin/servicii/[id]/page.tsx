import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
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
            <a
              href={service.href}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-green-700 bg-green-50 border border-green-200 px-3 py-1.5 rounded-full hover:bg-green-100 transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              Vezi pe site
            </a>
          )}
        </div>
        <ServiceForm action={updateServiceAction} defaults={service} submitLabel="Salvează modificările" />
      </div>

      <div>
        <AdminPageHeader
          title='Pași "Cum lucrăm"'
          description="Pașii afișați pe pagina proprie a acestui serviciu."
          action={
            <Link
              href={`/admin/servicii/${service.id}/pasi/nou`}
              className="inline-flex items-center gap-2 bg-[#c7092b] hover:bg-[#a5071f] text-white font-bold px-5 py-2.5 rounded-xl transition-colors text-sm uppercase tracking-wide"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              Adaugă pas
            </Link>
          }
        />

        {steps.length === 0 ? (
          <div className="bg-white border border-gray-100 rounded-2xl p-10 text-center text-gray-500 max-w-xl">
            Nu există pași adăugați încă — pagina serviciului va folosi pașii implicit din cod.
          </div>
        ) : (
          <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden max-w-xl">
            <div className="divide-y divide-gray-100">
              {steps.map((step) => (
                <div key={step.id} className="flex items-center gap-4 p-4">
                  <div className="relative w-14 h-14 rounded-xl bg-[#f6f8fb] overflow-hidden shrink-0 flex items-center justify-center [&>div>svg]:w-8 [&>div>svg]:h-8">
                    <ServiceStepIcon title={step.title} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm text-[#1d2353] truncate">{step.title}</p>
                    <p className="text-xs text-gray-500 truncate">{step.description}</p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Link
                      href={`/admin/servicii/${service.id}/pasi/${step.id}`}
                      className="text-gray-400 hover:text-[#c7092b] transition-colors p-1.5 rounded-lg hover:bg-[#fdf2f3]"
                      aria-label="Editează"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.5-9.5a2.121 2.121 0 113 3L12 13l-4 1 1-4 8.5-8.5z" />
                      </svg>
                    </Link>
                    <DeleteButton action={deleteServiceStepAction} id={step.id} confirmText="Sigur vrei să ștergi acest pas?" />
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
            <Link
              href={`/admin/servicii/${service.id}/caracteristici/nou`}
              className="inline-flex items-center gap-2 bg-[#c7092b] hover:bg-[#a5071f] text-white font-bold px-5 py-2.5 rounded-xl transition-colors text-sm uppercase tracking-wide"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              Adaugă caracteristică
            </Link>
          }
        />

        {features.length === 0 ? (
          <div className="bg-white border border-gray-100 rounded-2xl p-10 text-center text-gray-500 max-w-xl">
            Nu există caracteristici adăugate încă — pagina serviciului va folosi cele implicite din cod.
          </div>
        ) : (
          <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden max-w-xl">
            <div className="divide-y divide-gray-100">
              {features.map((feature) => (
                <div key={feature.id} className="flex items-center gap-4 p-4">
                  <div className="w-12 h-12 rounded-xl bg-[#fdf2f3] flex items-center justify-center shrink-0">
                    <ServiceFeatureIcon icon={feature.icon} className="w-6 h-6 text-[#c7092b]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm text-[#1d2353] truncate">{feature.title}</p>
                    <p className="text-xs text-gray-500 truncate">{feature.description}</p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Link
                      href={`/admin/servicii/${service.id}/caracteristici/${feature.id}`}
                      className="text-gray-400 hover:text-[#c7092b] transition-colors p-1.5 rounded-lg hover:bg-[#fdf2f3]"
                      aria-label="Editează"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.5-9.5a2.121 2.121 0 113 3L12 13l-4 1 1-4 8.5-8.5z" />
                      </svg>
                    </Link>
                    <DeleteButton action={deleteServiceFeatureAction} id={feature.id} confirmText="Sigur vrei să ștergi această caracteristică?" />
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
            <Link
              href={`/admin/servicii/${service.id}/bife/nou`}
              className="inline-flex items-center gap-2 bg-[#c7092b] hover:bg-[#a5071f] text-white font-bold px-5 py-2.5 rounded-xl transition-colors text-sm uppercase tracking-wide"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              Adaugă bifă
            </Link>
          }
        />

        {checklist.length === 0 ? (
          <div className="bg-white border border-gray-100 rounded-2xl p-10 text-center text-gray-500 max-w-xl">
            Nu există bife adăugate încă — pagina serviciului va folosi lista implicită din cod.
          </div>
        ) : (
          <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden max-w-xl">
            <div className="divide-y divide-gray-100">
              {checklist.map((item) => (
                <div key={item.id} className="flex items-center gap-4 p-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-[#1d2353] truncate">{item.text}</p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Link
                      href={`/admin/servicii/${service.id}/bife/${item.id}`}
                      className="text-gray-400 hover:text-[#c7092b] transition-colors p-1.5 rounded-lg hover:bg-[#fdf2f3]"
                      aria-label="Editează"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.5-9.5a2.121 2.121 0 113 3L12 13l-4 1 1-4 8.5-8.5z" />
                      </svg>
                    </Link>
                    <DeleteButton action={deleteServiceChecklistItemAction} id={item.id} confirmText="Sigur vrei să ștergi această bifă?" />
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
            <Link
              href={`/admin/servicii/${service.id}/testimoniale/nou`}
              className="inline-flex items-center gap-2 bg-[#c7092b] hover:bg-[#a5071f] text-white font-bold px-5 py-2.5 rounded-xl transition-colors text-sm uppercase tracking-wide"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              Adaugă testimonial
            </Link>
          }
        />

        {testimonials.length === 0 ? (
          <div className="bg-white border border-gray-100 rounded-2xl p-10 text-center text-gray-500 max-w-xl">
            Nu există testimoniale adăugate încă — pagina serviciului va folosi cele implicite din cod.
          </div>
        ) : (
          <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden max-w-xl">
            <div className="divide-y divide-gray-100">
              {testimonials.map((testimonial) => (
                <div key={testimonial.id} className="flex items-center gap-4 p-4">
                  <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#c7092b] to-[#8b0618] flex items-center justify-center text-white text-sm font-extrabold shrink-0">
                    {testimonial.initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm text-[#1d2353] truncate">{testimonial.name} · {testimonial.city}</p>
                    <p className="text-xs text-gray-500 truncate">{testimonial.text}</p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Link
                      href={`/admin/servicii/${service.id}/testimoniale/${testimonial.id}`}
                      className="text-gray-400 hover:text-[#c7092b] transition-colors p-1.5 rounded-lg hover:bg-[#fdf2f3]"
                      aria-label="Editează"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.5-9.5a2.121 2.121 0 113 3L12 13l-4 1 1-4 8.5-8.5z" />
                      </svg>
                    </Link>
                    <DeleteButton action={deleteServiceTestimonialAction} id={testimonial.id} confirmText="Sigur vrei să ștergi acest testimonial?" />
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
