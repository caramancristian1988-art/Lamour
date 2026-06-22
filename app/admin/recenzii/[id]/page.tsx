import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import AdminPageHeader from "../../components/AdminPageHeader";
import { AdminInput, AdminTextarea, AdminSelect } from "../../components/AdminField";
import ImageUploadField from "../../components/ImageUploadField";
import SaveButton from "../../components/SaveButton";
import { updateAdminReviewAction } from "@/lib/adminReviewActions";

async function getData(id: string) {
  const [review, categories, products] = await Promise.all([
    prisma.review.findUnique({ where: { id } }),
    prisma.category.findMany({ orderBy: { createdAt: "asc" } }),
    prisma.product.findMany({ orderBy: { name: "asc" } }),
  ]);
  return { review, categories, products };
}

export default async function EditReviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { review, categories, products } = await getData(id);
  if (!review) notFound();

  return (
    <div>
      <AdminPageHeader title="Editează recenzie" />

      <form action={updateAdminReviewAction} className="bg-white border border-gray-100 rounded-2xl p-6 flex flex-col gap-4 max-w-xl">
        <input type="hidden" name="id" value={review.id} />

        <AdminInput label="Nume client" name="name" required defaultValue={review.name} />
        <AdminInput label="Email (opțional)" name="email" type="email" defaultValue={review.email ?? ""} />

        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-bold text-gray-600">Rating <span className="text-[#c7092b]">*</span></span>
          <select
            name="rating"
            required
            defaultValue={String(review.rating)}
            className="border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#c7092b] bg-white"
          >
            <option value="5">5 stele</option>
            <option value="4">4 stele</option>
            <option value="3">3 stele</option>
            <option value="2">2 stele</option>
            <option value="1">1 stea</option>
          </select>
        </label>

        <AdminSelect label="Produs (opțional)" name="product" defaultValue={review.product ?? ""}>
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

        <AdminTextarea label="Text recenzie" name="text" required defaultValue={review.text} />
        <AdminInput label="Plusuri (opțional)" name="pros" defaultValue={review.pros ?? ""} />
        <AdminInput label="Minusuri (opțional)" name="cons" defaultValue={review.cons ?? ""} />
        <ImageUploadField name="image" label="Imagine client (opțional)" defaultValue={review.image} />

        <SaveButton label="Salvează modificările" />
      </form>
    </div>
  );
}
