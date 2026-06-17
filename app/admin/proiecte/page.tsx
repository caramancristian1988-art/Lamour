import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import AdminPageHeader from "../components/AdminPageHeader";
import DeleteButton from "../components/DeleteButton";
import { deleteProjectAction } from "@/lib/adminProjectActions";

async function getProjects() {
  try {
    return await prisma.project.findMany({ orderBy: { createdAt: "desc" } });
  } catch {
    return [];
  }
}

export default async function AdminProiectePage() {
  const projects = await getProjects();

  return (
    <div>
      <AdminPageHeader
        title="Proiecte"
        description="Galeria de proiecte realizate, afișată vizitatorilor."
        action={
          <Link
            href="/admin/proiecte/nou"
            className="inline-flex items-center gap-2 bg-[#c7092b] hover:bg-[#a5071f] text-white font-bold px-5 py-2.5 rounded-xl transition-colors text-sm uppercase tracking-wide"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Adaugă proiect
          </Link>
        }
      />

      {projects.length === 0 ? (
        <div className="bg-white border border-gray-100 rounded-2xl p-10 text-center text-gray-500">
          Nu există proiecte adăugate încă.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((p) => (
            <div key={p.id} className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
              <div className="relative h-40 bg-[#f6f8fb]">
                {p.images[0] ? (
                  <Image src={p.images[0]} alt={p.title} fill className="object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-300">
                    <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20 8H4a2 2 0 00-2 2v8a2 2 0 002 2h16a2 2 0 002-2v-8a2 2 0 00-2-2zM4 6h16V4H4v2z" />
                    </svg>
                  </div>
                )}
                {p.images.length > 1 && (
                  <span className="absolute bottom-2 right-2 bg-black/60 text-white text-[10px] font-bold px-2 py-1 rounded-full">
                    +{p.images.length - 1} foto
                  </span>
                )}
              </div>
              <div className="p-4">
                <p className="font-bold text-sm text-[#1d2353] truncate">{p.title}</p>
                <p className="text-xs text-gray-500 line-clamp-2 mt-1">{p.description}</p>
                <div className="flex items-center justify-end gap-1 mt-3">
                  <Link
                    href={`/admin/proiecte/${p.id}`}
                    className="text-gray-400 hover:text-[#c7092b] transition-colors p-1.5 rounded-lg hover:bg-[#fdf2f3]"
                    aria-label="Editează"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.5-9.5a2.121 2.121 0 113 3L12 13l-4 1 1-4 8.5-8.5z" />
                    </svg>
                  </Link>
                  <DeleteButton action={deleteProjectAction} id={p.id} confirmText="Sigur vrei să ștergi acest proiect?" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
