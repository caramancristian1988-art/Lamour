import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Pencil } from "lucide-react";
import { Button } from "@/app/components/ui/button";
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
            <div className="bg-card border border-border rounded-2xl p-10 text-center text-muted-foreground">
              Nu există întrebări adăugate încă.
            </div>
          ) : (
            faqs.map((f) => (
              <div key={f.id} className="bg-card border border-border rounded-2xl p-4 flex items-center gap-4">
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm text-primary">{f.question}</p>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{f.answer}</p>
                </div>
                <div className="flex items-center gap-0.5 shrink-0">
                  <Button variant="ghost" size="icon" asChild>
                    <Link href={`/admin/faq/${f.id}`} aria-label={`Editează întrebarea "${f.question}"`}>
                      <Pencil className="w-4 h-4" aria-hidden />
                    </Link>
                  </Button>
                  <DeleteButton
                    action={deleteFaqAction}
                    id={f.id}
                    confirmText="Sigur vrei să ștergi această întrebare?"
                    label={`Șterge întrebarea "${f.question}"`}
                  />
                </div>
              </div>
            ))
          )}
        </div>

        <div className="order-1 lg:order-2">
          <p className="font-bold text-sm text-primary mb-3">Adaugă întrebare</p>
          <FaqForm action={createFaqAction} submitLabel="Adaugă întrebare" />
        </div>
      </div>
    </div>
  );
}
