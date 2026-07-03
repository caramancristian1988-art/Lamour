import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Pencil } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import AdminPageHeader from "../../components/AdminPageHeader";
import DeleteButton from "../../components/DeleteButton";
import CategoryForm from "./CategoryForm";
import { createCategoryAction, deleteCategoryAction } from "@/lib/adminCategoryActions";

async function getCategories() {
  try {
    return await prisma.category.findMany({ orderBy: { createdAt: "asc" }, include: { _count: { select: { products: true } } } });
  } catch {
    return [];
  }
}

export default async function AdminCategoriiPage() {
  const categories = await getCategories();

  return (
    <div>
      <AdminPageHeader
        title="Categorii (filtre)"
        description="Categoriile de produse, folosite și ca filtre pe pagina de produse."
        action={
          <Button variant="outline" asChild>
            <Link href="/admin/produse">Înapoi la produse</Link>
          </Button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6">
        <div className="flex flex-col gap-3 order-2 lg:order-1">
          {categories.length === 0 ? (
            <div className="bg-card border border-border rounded-2xl p-10 text-center text-muted-foreground">
              Nu există categorii adăugate încă.
            </div>
          ) : (
            categories.map((c) => (
              <div key={c.id} className="bg-card border border-border rounded-2xl p-4 flex items-center gap-4">
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm text-primary">{c.name}</p>
                  <p className="text-xs text-muted-foreground">/produse?cat={c.slug} · {c._count.products} produse</p>
                </div>
                <div className="flex items-center gap-0.5 shrink-0">
                  <Button variant="ghost" size="icon" asChild>
                    <Link href={`/admin/produse/categorii/${c.id}`} aria-label={`Editează categoria ${c.name}`}>
                      <Pencil className="w-4 h-4" aria-hidden />
                    </Link>
                  </Button>
                  {c._count.products === 0 && (
                    <DeleteButton
                      action={deleteCategoryAction}
                      id={c.id}
                      confirmText="Sigur vrei să ștergi această categorie?"
                      label={`Șterge categoria ${c.name}`}
                    />
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        <div className="order-1 lg:order-2">
          <p className="font-bold text-sm text-primary mb-3">Adaugă categorie</p>
          <CategoryForm action={createCategoryAction} submitLabel="Adaugă categorie" />
        </div>
      </div>
    </div>
  );
}
