import { Mail } from "lucide-react";
import { prisma } from "@/lib/prisma";
import AdminPageHeader from "../components/AdminPageHeader";
import DeleteButton from "../components/DeleteButton";
import NewsletterComposeForm from "./NewsletterComposeForm";
import { deleteSubscriberAction } from "@/lib/newsletterActions";

async function getSubscribers() {
  try {
    return await prisma.newsletterSubscriber.findMany({ orderBy: { createdAt: "desc" } });
  } catch {
    return [];
  }
}

export default async function AdminNewsletterPage() {
  const subscribers = await getSubscribers();

  return (
    <div>
      <AdminPageHeader
        title="Newsletter"
        description="Abonații la newsletter din formularul de pe site și trimiterea de oferte prin email."
      />

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6">
        <div className="flex flex-col gap-3 order-2 lg:order-1">
          {subscribers.length === 0 ? (
            <div className="bg-card border border-border rounded-2xl p-10 text-center text-muted-foreground flex flex-col items-center gap-2">
              <Mail className="w-8 h-8 text-muted-foreground/60" aria-hidden />
              Niciun abonat încă.
            </div>
          ) : (
            subscribers.map((s) => (
              <div key={s.id} className="bg-card border border-border rounded-2xl p-4 flex items-center gap-4">
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm text-primary truncate">{s.email}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Abonat pe {s.createdAt.toLocaleDateString("ro-MD", { day: "numeric", month: "long", year: "numeric" })}
                  </p>
                </div>
                <DeleteButton
                  action={deleteSubscriberAction}
                  id={s.id}
                  confirmText={`Sigur vrei să elimini "${s.email}" din lista de abonați?`}
                  label={`Elimină abonatul ${s.email}`}
                />
              </div>
            ))
          )}
        </div>

        <div className="order-1 lg:order-2">
          <p className="font-bold text-sm text-primary mb-3">Trimite o ofertă</p>
          <NewsletterComposeForm subscriberCount={subscribers.length} />
        </div>
      </div>
    </div>
  );
}
