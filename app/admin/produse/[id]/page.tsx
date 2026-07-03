import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ExternalLink, Pencil, Plus } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Badge } from "@/app/components/ui/badge";
import { StarRating } from "@/app/components/ui/star-rating";
import { AdminInput, AdminTextarea, AdminSelect } from "../../components/AdminField";
import AdminPageHeader from "../../components/AdminPageHeader";
import DeleteButton from "../../components/DeleteButton";
import CopyableId from "../../components/CopyableId";
import ProductForm from "../ProductForm";
import { updateProductAction } from "@/lib/adminProductActions";
import { deleteProductFaqAction } from "@/lib/adminProductFaqActions";
import { createAdminReviewAction, deleteAdminReviewAction } from "@/lib/adminReviewActions";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [product, categories, brandRows] = await Promise.all([
    prisma.product.findUnique({ where: { id } }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
    prisma.product.findMany({ where: { brand: { not: null } }, distinct: ["brand"], select: { brand: true }, orderBy: { brand: "asc" } }),
  ]);
  if (!product) notFound();
  const brands = brandRows.map((b) => b.brand!).filter(Boolean);

  let faqs: Awaited<ReturnType<typeof prisma.productFaq.findMany>> = [];
  let productReviews: Awaited<ReturnType<typeof prisma.review.findMany>> = [];
  try {
    [faqs, productReviews] = await Promise.all([
      prisma.productFaq.findMany({ where: { productId: id }, orderBy: { order: "asc" } }),
      prisma.review.findMany({ where: { product: product.name }, orderBy: { createdAt: "desc" } }),
    ]);
  } catch {
    faqs = [];
    productReviews = [];
  }

  return (
    <div>
      <AdminPageHeader
        title="Editează produs"
        action={
          <div className="flex items-center gap-4">
            <CopyableId id={product.id} />
            <Button variant="ghost" size="sm" asChild>
              <Link href={`/produse/${product.slug}`} target="_blank" rel="noopener noreferrer">
                Vezi pe site
                <ExternalLink className="w-3.5 h-3.5" aria-hidden />
              </Link>
            </Button>
          </div>
        }
      />
      <ProductForm action={updateProductAction} defaults={product} categories={categories} brands={brands} submitLabel="Salvează modificările" />

      <div className="mt-8">
        <AdminPageHeader
          title="Întrebări frecvente despre acest produs"
          description="Apar pe pagina produsului, sub recenzii. Opțional — dacă nu adaugi nimic, secțiunea nu apare deloc."
          action={
            <Button variant="accent" asChild>
              <Link href={`/admin/produse/${product.id}/faq/nou`}>
                <Plus className="w-4 h-4" aria-hidden />
                Adaugă întrebare
              </Link>
            </Button>
          }
        />

        {faqs.length === 0 ? (
          <div className="bg-card border border-border rounded-2xl p-10 text-center text-muted-foreground max-w-xl">
            Nu există întrebări adăugate pentru acest produs.
          </div>
        ) : (
          <div className="bg-card border border-border rounded-2xl overflow-hidden max-w-xl">
            <div className="divide-y divide-border">
              {faqs.map((faq) => (
                <div key={faq.id} className="flex items-center gap-4 p-4">
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm text-primary truncate">{faq.question}</p>
                    <p className="text-xs text-muted-foreground truncate">{faq.answer}</p>
                  </div>
                  <div className="flex items-center gap-0.5 shrink-0">
                    <Button variant="ghost" size="icon" asChild>
                      <Link href={`/admin/produse/${product.id}/faq/${faq.id}`} aria-label={`Editează întrebarea "${faq.question}"`}>
                        <Pencil className="w-4 h-4" aria-hidden />
                      </Link>
                    </Button>
                    <DeleteButton
                      action={deleteProductFaqAction}
                      id={faq.id}
                      confirmText="Sigur vrei să ștergi această întrebare?"
                      label={`Șterge întrebarea "${faq.question}"`}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Product reviews */}
      <div className="mt-8">
        <AdminPageHeader
          title="Recenzii produs"
          description="Recenziile clienților pentru acest produs. Cele adăugate manual sunt publicate direct."
        />

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6">
          {/* Review list */}
          <div>
            {productReviews.length === 0 ? (
              <div className="bg-card border border-border rounded-2xl p-10 text-center text-muted-foreground">
                Nu există recenzii pentru acest produs încă.
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {productReviews.map((r) => (
                  <div
                    key={r.id}
                    className={`bg-card border rounded-2xl p-4 flex items-start gap-3 ${r.approved ? "border-border" : "border-accent/30"}`}
                  >
                    <div className="w-9 h-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold shrink-0">
                      {r.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-bold text-sm text-primary">{r.name}</p>
                          {!r.approved && <Badge variant="accent">În așteptare</Badge>}
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <Link
                            href={`/admin/recenzii/${r.id}`}
                            className="text-xs font-bold text-muted-foreground hover:text-accent transition-colors"
                          >
                            Editează recenzia lui {r.name}
                          </Link>
                          <DeleteButton
                            action={deleteAdminReviewAction}
                            id={r.id}
                            confirmText="Sigur vrei să ștergi această recenzie?"
                            label={`Șterge recenzia lui ${r.name}`}
                          />
                        </div>
                      </div>
                      <StarRating rating={r.rating} className="mt-0.5" />
                      <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed line-clamp-3">{r.text}</p>
                      {(r.pros || r.cons) && (
                        <div className="mt-2 flex flex-col gap-1">
                          {r.pros && (
                            <p className="text-xs text-emerald-700 bg-emerald-50 rounded-lg px-2.5 py-1.5">
                              <span className="font-bold">+ Plusuri:</span> {r.pros}
                            </p>
                          )}
                          {r.cons && (
                            <p className="text-xs text-accent bg-accent/10 rounded-lg px-2.5 py-1.5">
                              <span className="font-bold">− Minusuri:</span> {r.cons}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick-add form */}
          <form action={createAdminReviewAction} className="bg-card border border-border rounded-2xl p-6 flex flex-col gap-4 h-fit">
            <p className="font-bold text-sm text-primary">Adaugă recenzie</p>
            <input type="hidden" name="product" value={product.name} />
            <AdminInput label="Nume client" name="name" required placeholder="Ion Popescu" />
            <AdminTextarea label="Text recenzie" name="text" required placeholder="Produs excelent, recomand!" rows={3} />
            <AdminSelect label="Rating" name="rating" required defaultValue="5">
              <option value="5">5 stele</option>
              <option value="4">4 stele</option>
              <option value="3">3 stele</option>
              <option value="2">2 stele</option>
              <option value="1">1 stea</option>
            </AdminSelect>
            <Button type="submit" variant="accent" className="self-start mt-2">
              Adaugă recenzie
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
