import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Pencil } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import AdminPageHeader from "../../components/AdminPageHeader";
import DeleteButton from "../../components/DeleteButton";
import TypeForm from "./TypeForm";
import { createSpaceTypeAction, deleteSpaceTypeAction } from "@/lib/adminSpaceTypeActions";

async function getTypes() {
  try {
    return await prisma.spaceType.findMany({ orderBy: { name: "asc" }, include: { _count: { select: { listings: true } } } });
  } catch {
    return [];
  }
}

export default async function AdminChirieCategoriiPage() {
  const types = await getTypes();

  return (
    <div>
      <AdminPageHeader
        title="Tipuri (filtre) — Chirie"
        description="Tipurile de spații de închiriat, folosite ca filtre pe pagina de produse."
        action={
          <Button variant="outline" asChild>
            <Link href="/admin/chirie">Înapoi la chirie</Link>
          </Button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6">
        <div className="flex flex-col gap-3 order-2 lg:order-1">
          {types.length === 0 ? (
            <div className="bg-card border border-border rounded-2xl p-10 text-center text-muted-foreground">
              Nu există tipuri adăugate încă.
            </div>
          ) : (
            types.map((t) => (
              <div key={t.id} className="bg-card border border-border rounded-2xl p-4 flex items-center gap-4">
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm text-primary">{t.name}</p>
                  <p className="text-xs text-muted-foreground">/produse?division=chirie&tip={t.slug} · {t._count.listings} anunțuri</p>
                </div>
                <div className="flex items-center gap-0.5 shrink-0">
                  <Button variant="ghost" size="icon" asChild>
                    <Link href={`/admin/chirie/categorii/${t.id}`} aria-label={`Editează tipul ${t.name}`}>
                      <Pencil className="w-4 h-4" aria-hidden />
                    </Link>
                  </Button>
                  {t._count.listings === 0 && (
                    <DeleteButton
                      action={deleteSpaceTypeAction}
                      id={t.id}
                      confirmText="Sigur vrei să ștergi acest tip?"
                      label={`Șterge tipul ${t.name}`}
                    />
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        <div className="order-1 lg:order-2">
          <p className="font-bold text-sm text-primary mb-3">Adaugă tip</p>
          <TypeForm action={createSpaceTypeAction} submitLabel="Adaugă tip" />
        </div>
      </div>
    </div>
  );
}
