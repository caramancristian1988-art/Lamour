import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import AdminPageHeader from "../components/AdminPageHeader";
import DeleteButton from "../components/DeleteButton";
import { deleteServiceAction } from "@/lib/adminServiceActions";

async function getServices() {
  try {
    return await prisma.service.findMany({ orderBy: [{ section: "asc" }, { order: "asc" }] });
  } catch {
    return [];
  }
}

const sectionLabels: Record<string, string> = {
  principale: "Principale",
  avansate: "Avansate",
  suplimentare: "Suplimentare",
};

export default async function AdminServiciiPage() {
  const services = await getServices();

  return (
    <div>
      <AdminPageHeader
        title="Servicii"
        description="Gestionează serviciile afișate pe site."
        action={
          <Link
            href="/admin/servicii/nou"
            className="inline-flex items-center gap-2 bg-[#c7092b] hover:bg-[#a5071f] text-white font-bold px-5 py-2.5 rounded-xl transition-colors text-sm uppercase tracking-wide"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Adaugă serviciu
          </Link>
        }
      />

      {services.length === 0 ? (
        <div className="bg-white border border-gray-100 rounded-2xl p-10 text-center text-gray-500">
          Nu există servicii adăugate încă.
        </div>
      ) : (
        <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
          <div className="divide-y divide-gray-100">
            {services.map((s) => (
              <div key={s.id} className="flex items-center gap-4 p-4">
                <div className="relative w-14 h-14 rounded-xl bg-[#f6f8fb] overflow-hidden shrink-0">
                  {s.image ? (
                    <Image src={s.image} alt={s.title} fill className="object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M20 8H4a2 2 0 00-2 2v8a2 2 0 002 2h16a2 2 0 002-2v-8a2 2 0 00-2-2zM4 6h16V4H4v2z" />
                      </svg>
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm text-[#1d2353] truncate">{s.title}</p>
                  <p className="text-xs text-gray-500 truncate">{s.description}</p>
                </div>
                <span className="text-[10px] font-bold text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full uppercase shrink-0">
                  {sectionLabels[s.section] ?? s.section}
                </span>
                <div className="flex items-center gap-1 shrink-0">
                  <Link
                    href={`/admin/servicii/${s.id}`}
                    className="text-gray-400 hover:text-[#c7092b] transition-colors p-1.5 rounded-lg hover:bg-[#fdf2f3]"
                    aria-label="Editează"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.5-9.5a2.121 2.121 0 113 3L12 13l-4 1 1-4 8.5-8.5z" />
                    </svg>
                  </Link>
                  <DeleteButton action={deleteServiceAction} id={s.id} confirmText="Sigur vrei să ștergi acest serviciu?" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
