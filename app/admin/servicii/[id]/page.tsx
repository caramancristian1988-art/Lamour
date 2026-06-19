import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import AdminPageHeader from "../../components/AdminPageHeader";
import DeleteButton from "../../components/DeleteButton";
import ServiceForm from "../ServiceForm";
import { updateServiceAction } from "@/lib/adminServiceActions";
import { deleteServiceStepAction } from "@/lib/adminServiceStepActions";

export default async function EditServicePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [service, steps] = await Promise.all([
    prisma.service.findUnique({ where: { id } }),
    prisma.serviceStep.findMany({ where: { serviceId: id }, orderBy: { order: "asc" } }),
  ]);
  if (!service) notFound();

  return (
    <div className="flex flex-col gap-8">
      <div>
        <AdminPageHeader title="Editează serviciu" />
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
              {steps.map((step, i) => (
                <div key={step.id} className="flex items-center gap-4 p-4">
                  <div className="relative w-14 h-14 rounded-xl bg-[#f6f8fb] overflow-hidden shrink-0">
                    {step.image ? (
                      <Image src={step.image} alt={step.title} fill className="object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300 font-bold">
                        {String(i + 1).padStart(2, "0")}
                      </div>
                    )}
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
    </div>
  );
}
