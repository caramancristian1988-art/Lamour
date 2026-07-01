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

const KNOWN_HREFS = [
  "/servicii/instalare",
  "/servicii/mentenanta",
  "/servicii/diagnosticare",
  "/servicii/consultanta",
  "/servicii/multisplit",
  "/servicii/comerciale",
];

const sectionLabels: Record<string, string> = {
  principale: "Principale",
  avansate: "Avansate",
  suplimentare: "Suplimentare",
};

export default async function AdminServiciiPage() {
  const services = await getServices();
  const connected = services.filter((s) => s.href && KNOWN_HREFS.includes(s.href));
  const orphan = services.filter((s) => !s.href || !KNOWN_HREFS.includes(s.href));

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

      {/* Connected services */}
      <div className="mb-3 flex items-center gap-2">
        <span className="inline-flex items-center gap-1.5 text-xs font-bold text-green-700 bg-green-50 border border-green-200 px-3 py-1.5 rounded-full">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
          </svg>
          Conectate la site ({connected.length})
        </span>
      </div>

      {connected.length === 0 ? (
        <div className="bg-white border border-gray-100 rounded-2xl p-6 text-center text-gray-500 mb-6">
          Niciun serviciu conectat la site încă.
        </div>
      ) : (
        <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden mb-6">
          <div className="divide-y divide-gray-100">
            {connected.map((s) => (
              <div key={s.id} className="flex items-start gap-3 p-4">
                <div className="relative w-12 h-12 rounded-xl bg-[#f6f8fb] overflow-hidden shrink-0 mt-0.5">
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
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-bold text-sm text-[#1d2353] leading-snug">{s.title}</p>
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded-full border border-green-200">
                      <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 8 8">
                        <circle cx="4" cy="4" r="3" />
                      </svg>
                      LIVE
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 line-clamp-1 mt-0.5">{s.description}</p>
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    <span className="text-[10px] font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full uppercase">
                      {sectionLabels[s.section] ?? s.section}
                    </span>
                    {s.href && (
                      <a
                        href={s.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[10px] font-semibold text-blue-500 hover:text-blue-700 hover:underline flex items-center gap-1"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                        {s.href}
                      </a>
                    )}
                    <div className="ml-auto flex items-center gap-0.5">
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
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Orphan services */}
      {orphan.length > 0 && (
        <>
          <div className="mb-3 flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-full">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              Fără pagină pe site ({orphan.length}) — setează href pentru a conecta
            </span>
          </div>
          <div className="bg-white border border-amber-100 rounded-2xl overflow-hidden">
            <div className="divide-y divide-gray-100">
              {orphan.map((s) => (
                <div key={s.id} className="flex items-start gap-3 p-4 opacity-80">
                  <div className="relative w-12 h-12 rounded-xl bg-[#f6f8fb] overflow-hidden shrink-0 mt-0.5">
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
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-sm text-[#1d2353] leading-snug">{s.title}</p>
                      <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                        FĂRĂ HREF
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 line-clamp-1 mt-0.5">{s.description}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-[10px] text-gray-400 italic">
                        Adaugă href în editare pentru a conecta la o pagină din site
                      </span>
                      <div className="ml-auto flex items-center gap-0.5">
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
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
