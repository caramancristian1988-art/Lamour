import Link from "next/link";
import { prisma } from "@/lib/prisma";
import AdminPageHeader from "../components/AdminPageHeader";
import DeleteButton from "../components/DeleteButton";
import FaqForm from "./FaqForm";
import { createFaqAction, deleteFaqAction } from "@/lib/adminFaqActions";

async function getFaqs() {
  try {
    return await prisma.faq.findMany({ orderBy: { order: "asc" } });
  } catch {
    return [];
  }
}

export default async function AdminFaqPage() {
  const faqs = await getFaqs();

  return (
    <div>
      <AdminPageHeader
        title="Întrebări frecvente"
        description="Întrebările și răspunsurile afișate pe pagina de Contact."
      />

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6">
        <div className="flex flex-col gap-3 order-2 lg:order-1">
          {faqs.length === 0 ? (
            <div className="bg-white border border-gray-100 rounded-2xl p-10 text-center text-gray-500">
              Nu există întrebări adăugate încă.
            </div>
          ) : (
            faqs.map((f) => (
              <div key={f.id} className="bg-white border border-gray-100 rounded-2xl p-4 flex items-center gap-4">
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm text-[#1d2353]">{f.question}</p>
                  <p className="text-xs text-gray-400 mt-1 line-clamp-2">{f.answer}</p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Link
                    href={`/admin/faq/${f.id}`}
                    className="text-gray-400 hover:text-[#c7092b] transition-colors p-1.5 rounded-lg hover:bg-[#fdf2f3]"
                    aria-label="Editează"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.5-9.5a2.121 2.121 0 113 3L12 13l-4 1 1-4 8.5-8.5z" />
                    </svg>
                  </Link>
                  <DeleteButton action={deleteFaqAction} id={f.id} confirmText="Sigur vrei să ștergi această întrebare?" />
                </div>
              </div>
            ))
          )}
        </div>

        <div className="order-1 lg:order-2">
          <p className="font-bold text-sm text-[#1d2353] mb-3">Adaugă întrebare</p>
          <FaqForm action={createFaqAction} submitLabel="Adaugă întrebare" />
        </div>
      </div>
    </div>
  );
}
