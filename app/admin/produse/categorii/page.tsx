import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Pencil, CornerDownRight } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import AdminPageHeader from "../../components/AdminPageHeader";
import DeleteButton from "../../components/DeleteButton";
import CategoryForm from "./CategoryForm";
import { createCategoryAction, deleteCategoryAction } from "@/lib/adminCategoryActions";

async function getCategories() {
  try {
    return await prisma.category.findMany({
      orderBy: { createdAt: "asc" },
      include: { _count: { select: { products: true, children: true } } },
    });
  } catch {
    return [];
  }
}

type CategoryRow = Awaited<ReturnType<typeof getCategories>>[number];

function CategoryRow({ c, indented }: { c: CategoryRow; indented?: boolean }) {
  return (
    <div className={`bg-card border border-border rounded-2xl p-4 flex items-center gap-4 ${indented ? "ml-6 sm:ml-10" : ""}`}>
      {indented && <CornerDownRight className="w-4 h-4 text-muted-foreground shrink-0" aria-hidden />}
      <div className="flex-1 min-w-0">
        <p className="font-bold text-sm text-primary">{c.name}</p>
        <p className="text-xs text-muted-foreground">
          /produse?cat={c.slug} · {c._count.products} produse
          {c._count.children > 0 && ` · ${c._count.children} subcategorii`}
        </p>
      </div>
      <div className="flex items-center gap-0.5 shrink-0">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/admin/produse/categorii/${c.id}`} aria-label={`Editează categoria ${c.name}`}>
            <Pencil className="w-4 h-4" aria-hidden />
          </Link>
        </Button>
        {c._count.products === 0 && c._count.children === 0 && (
          <DeleteButton
            action={deleteCategoryAction}
            id={c.id}
            confirmText="Sigur vrei să ștergi această categorie?"
            label={`Șterge categoria ${c.name}`}
          />
        )}
      </div>
    </div>
  );
}

export default async function AdminCategoriiPage() {
  const categories = await getCategories();
  const topLevel = categories.filter((c) => !c.parentId);
  const childrenByParent = new Map<string, CategoryRow[]>();
  for (const c of categories) {
    if (!c.parentId) continue;
    const list = childrenByParent.get(c.parentId) ?? [];
    list.push(c);
    childrenByParent.set(c.parentId, list);
  }
  const parentOptions = topLevel.map((c) => ({ id: c.id, name: c.name }));

  return (
    <div>
      <AdminPageHeader
        title="Categorii (filtre)"
        description="Categoriile de produse, folosite și ca filtre pe pagina de produse. O categorie cu subcategorii afișează butoane de filtrare pe pagina ei (ex: Prosoape de bucătărie → în 2 straturi / în 3 straturi)."
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
            topLevel.map((c) => (
              <div key={c.id} className="flex flex-col gap-3">
                <CategoryRow c={c} />
                {(childrenByParent.get(c.id) ?? []).map((child) => (
                  <CategoryRow key={child.id} c={child} indented />
                ))}
              </div>
            ))
          )}
        </div>

        <div className="order-1 lg:order-2">
          <p className="font-bold text-sm text-primary mb-3">Adaugă categorie</p>
          <CategoryForm action={createCategoryAction} parentOptions={parentOptions} submitLabel="Adaugă categorie" />
        </div>
      </div>
    </div>
  );
}
