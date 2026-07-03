import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import AdminPageHeader from "../components/AdminPageHeader";
import DeleteButton from "../components/DeleteButton";
import { AdminInput, AdminTextarea, AdminSelect } from "../components/AdminField";
import ImageUploadField from "../components/ImageUploadField";
import { StarRating } from "@/app/components/ui/star-rating";
import { Button } from "@/app/components/ui/button";
import {
  createAdminReviewAction,
  deleteAdminReviewAction,
  approveReviewAction,
  rejectReviewAction,
} from "@/lib/adminReviewActions";

async function getReviews() {
  try {
    const [reviews, categories, products] = await Promise.all([
      prisma.review.findMany({ orderBy: { createdAt: "desc" } }),
      prisma.category.findMany({ orderBy: { createdAt: "asc" } }),
      prisma.product.findMany({ orderBy: { name: "asc" } }),
    ]);
    return {
      pending: reviews.filter((r) => !r.approved),
      approved: reviews.filter((r) => r.approved),
      categories,
      products,
    };
  } catch {
    return { pending: [], approved: [], categories: [], products: [] };
  }
}

function EditLink({ id, name }: { id: string; name: string }) {
  return (
    <Link
      href={`/admin/recenzii/${id}`}
      className="text-xs font-bold text-muted-foreground hover:text-accent transition-colors shrink-0"
    >
      Editează recenzia lui {name}
    </Link>
  );
}

function ReviewAvatar({ name, image }: { name: string; image: string | null }) {
  return (
    <div className="relative w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold shrink-0 overflow-hidden">
      {image ? (
        <Image src={image} alt={name} fill className="object-cover" />
      ) : (
        name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
      )}
    </div>
  );
}

export default async function AdminRecenziiPage() {
  const { pending, approved, categories, products } = await getReviews();

  return (
    <div>
      <AdminPageHeader title="Recenzii" description="Recenzii și testimoniale ale clienților." />

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6">
        <div className="flex flex-col gap-6 order-2 lg:order-1">
          {pending.length > 0 && (
            <div>
              <p className="text-xs font-extrabold uppercase tracking-wide text-accent mb-3">
                În așteptare ({pending.length})
              </p>
              <div className="flex flex-col gap-3">
                {pending.map((r) => (
                  <div key={r.id} className="bg-card border border-accent/30 rounded-2xl p-4 flex items-start gap-3">
                    <ReviewAvatar name={r.name} image={r.image} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-bold text-sm text-primary">{r.name}</p>
                        <EditLink id={r.id} name={r.name} />
                      </div>
                      <StarRating rating={r.rating} />
                      <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">{r.text}</p>
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
                      {r.product && <p className="text-xs text-muted-foreground mt-1">Produs: {r.product}</p>}
                      <div className="flex items-center gap-2 mt-3">
                        <form action={approveReviewAction}>
                          <input type="hidden" name="id" value={r.id} />
                          <Button type="submit" variant="accent" size="sm">
                            Acceptă
                          </Button>
                        </form>
                        <form action={rejectReviewAction}>
                          <input type="hidden" name="id" value={r.id} />
                          <Button type="submit" variant="outline" size="sm">
                            Respinge
                          </Button>
                        </form>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <p className="text-xs font-extrabold uppercase tracking-wide text-primary mb-3">
              Publicate ({approved.length})
            </p>
            {approved.length === 0 ? (
              <div className="bg-card border border-border rounded-2xl p-10 text-center text-muted-foreground">
                Nu există recenzii publicate încă.
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {approved.map((r) => (
                  <div key={r.id} className="bg-card border border-border rounded-2xl p-4 flex items-start gap-3">
                    <ReviewAvatar name={r.name} image={r.image} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-bold text-sm text-primary">{r.name}</p>
                        <div className="flex items-center gap-3 shrink-0">
                          <EditLink id={r.id} name={r.name} />
                          <DeleteButton
                            action={deleteAdminReviewAction}
                            id={r.id}
                            confirmText="Sigur vrei să ștergi această recenzie?"
                            label={`Șterge recenzia lui ${r.name}`}
                          />
                        </div>
                      </div>
                      <StarRating rating={r.rating} />
                      <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">{r.text}</p>
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
                      {r.product && <p className="text-xs text-muted-foreground mt-1">Produs: {r.product}</p>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <form action={createAdminReviewAction} className="bg-card border border-border rounded-2xl p-6 flex flex-col gap-4 h-fit order-1 lg:order-2">
          <p className="font-bold text-sm text-primary">Adaugă recenzie</p>
          <p className="text-xs text-muted-foreground -mt-2">Recenziile adăugate aici sunt publicate direct.</p>
          <AdminInput label="Nume client" name="name" required placeholder="Ana Popescu" />
          <AdminTextarea label="Text recenzie" name="text" required placeholder="Servicii excelente, recomand cu încredere!" />
          <AdminSelect label="Rating" name="rating" required defaultValue="5">
            <option value="5">5 stele</option>
            <option value="4">4 stele</option>
            <option value="3">3 stele</option>
            <option value="2">2 stele</option>
            <option value="1">1 stea</option>
          </AdminSelect>
          <AdminSelect label="Produs (opțional)" name="product" defaultValue="">
            <option value="">— Fără produs —</option>
            {categories.map((category) => {
              const categoryProducts = products.filter((p) => p.categoryId === category.id);
              if (categoryProducts.length === 0) return null;
              return (
                <optgroup key={category.id} label={category.name}>
                  {categoryProducts.map((p) => (
                    <option key={p.id} value={p.name}>{p.name}</option>
                  ))}
                </optgroup>
              );
            })}
          </AdminSelect>
          <ImageUploadField name="image" label="Imagine client (opțional)" />
          <Button type="submit" variant="accent" className="self-start mt-2">
            Adaugă recenzie
          </Button>
        </form>
      </div>
    </div>
  );
}
