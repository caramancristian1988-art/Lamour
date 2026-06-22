import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import AdminPageHeader from "../components/AdminPageHeader";
import DeleteButton from "../components/DeleteButton";
import { AdminInput, AdminTextarea, AdminSelect } from "../components/AdminField";
import ImageUploadField from "../components/ImageUploadField";
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

function EditLink({ id }: { id: string }) {
  return (
    <Link
      href={`/admin/recenzii/${id}`}
      className="text-xs font-bold text-gray-400 hover:text-[#c7092b] transition-colors shrink-0"
    >
      Editează
    </Link>
  );
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg key={star} className={`w-4 h-4 ${star <= Math.round(rating) ? "text-amber-400" : "text-gray-200"}`} fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

function ReviewAvatar({ name, image }: { name: string; image: string | null }) {
  return (
    <div className="relative w-10 h-10 rounded-full bg-[#1d2353] text-white flex items-center justify-center text-xs font-bold shrink-0 overflow-hidden">
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
              <p className="text-xs font-extrabold uppercase tracking-wide text-[#c7092b] mb-3">
                În așteptare ({pending.length})
              </p>
              <div className="flex flex-col gap-3">
                {pending.map((r) => (
                  <div key={r.id} className="bg-white border border-[#c7092b]/30 rounded-2xl p-4 flex items-start gap-3">
                    <ReviewAvatar name={r.name} image={r.image} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-bold text-sm text-[#1d2353]">{r.name}</p>
                        <EditLink id={r.id} />
                      </div>
                      <StarRating rating={r.rating} />
                      <p className="text-sm text-gray-600 mt-1.5 leading-relaxed">{r.text}</p>
                      {(r.pros || r.cons) && (
                        <div className="mt-2 flex flex-col gap-1">
                          {r.pros && (
                            <p className="text-xs text-emerald-700 bg-emerald-50 rounded-lg px-2.5 py-1.5">
                              <span className="font-bold">+ Plusuri:</span> {r.pros}
                            </p>
                          )}
                          {r.cons && (
                            <p className="text-xs text-[#c7092b] bg-red-50 rounded-lg px-2.5 py-1.5">
                              <span className="font-bold">− Minusuri:</span> {r.cons}
                            </p>
                          )}
                        </div>
                      )}
                      {r.product && <p className="text-xs text-gray-400 mt-1">Produs: {r.product}</p>}
                      <div className="flex items-center gap-2 mt-3">
                        <form action={approveReviewAction}>
                          <input type="hidden" name="id" value={r.id} />
                          <button
                            type="submit"
                            className="text-xs font-bold text-white bg-[#1d2353] hover:bg-[#2a3470] px-3 py-1.5 rounded-lg transition-colors"
                          >
                            Acceptă
                          </button>
                        </form>
                        <form action={rejectReviewAction}>
                          <input type="hidden" name="id" value={r.id} />
                          <button
                            type="submit"
                            className="text-xs font-bold text-gray-500 border border-gray-200 hover:bg-gray-50 px-3 py-1.5 rounded-lg transition-colors"
                          >
                            Respinge
                          </button>
                        </form>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <p className="text-xs font-extrabold uppercase tracking-wide text-[#1d2353] mb-3">
              Publicate ({approved.length})
            </p>
            {approved.length === 0 ? (
              <div className="bg-white border border-gray-100 rounded-2xl p-10 text-center text-gray-500">
                Nu există recenzii publicate încă.
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {approved.map((r) => (
                  <div key={r.id} className="bg-white border border-gray-100 rounded-2xl p-4 flex items-start gap-3">
                    <ReviewAvatar name={r.name} image={r.image} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-bold text-sm text-[#1d2353]">{r.name}</p>
                        <div className="flex items-center gap-3 shrink-0">
                          <EditLink id={r.id} />
                          <DeleteButton action={deleteAdminReviewAction} id={r.id} confirmText="Sigur vrei să ștergi această recenzie?" />
                        </div>
                      </div>
                      <StarRating rating={r.rating} />
                      <p className="text-sm text-gray-600 mt-1.5 leading-relaxed">{r.text}</p>
                      {(r.pros || r.cons) && (
                        <div className="mt-2 flex flex-col gap-1">
                          {r.pros && (
                            <p className="text-xs text-emerald-700 bg-emerald-50 rounded-lg px-2.5 py-1.5">
                              <span className="font-bold">+ Plusuri:</span> {r.pros}
                            </p>
                          )}
                          {r.cons && (
                            <p className="text-xs text-[#c7092b] bg-red-50 rounded-lg px-2.5 py-1.5">
                              <span className="font-bold">− Minusuri:</span> {r.cons}
                            </p>
                          )}
                        </div>
                      )}
                      {r.product && <p className="text-xs text-gray-400 mt-1">Produs: {r.product}</p>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <form action={createAdminReviewAction} className="bg-white border border-gray-100 rounded-2xl p-6 flex flex-col gap-4 h-fit order-1 lg:order-2">
          <p className="font-bold text-sm text-[#1d2353]">Adaugă recenzie</p>
          <p className="text-xs text-gray-400 -mt-2">Recenziile adăugate aici sunt publicate direct.</p>
          <AdminInput label="Nume client" name="name" required placeholder="Ana Popescu" />
          <AdminTextarea label="Text recenzie" name="text" required placeholder="Servicii excelente, recomand cu încredere!" />
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-bold text-gray-600">Rating <span className="text-[#c7092b]">*</span></span>
            <select name="rating" required defaultValue="5" className="border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#c7092b] bg-white">
              <option value="5">5 stele</option>
              <option value="4">4 stele</option>
              <option value="3">3 stele</option>
              <option value="2">2 stele</option>
              <option value="1">1 stea</option>
            </select>
          </label>
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
          <button type="submit" className="self-start bg-[#c7092b] hover:bg-[#a5071f] text-white font-bold px-6 py-2.5 rounded-xl transition-colors text-sm uppercase tracking-wide mt-2">
            Adaugă recenzie
          </button>
        </form>
      </div>
    </div>
  );
}
