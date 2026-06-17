import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import AdminPageHeader from "../components/AdminPageHeader";
import DeleteButton from "../components/DeleteButton";
import AdminProductFilters from "./AdminProductFilters";
import { deleteProductAction } from "@/lib/adminProductActions";

async function getData() {
  try {
    const [products, categories] = await Promise.all([
      prisma.product.findMany({ orderBy: { createdAt: "desc" }, include: { category: true } }),
      prisma.category.findMany({ orderBy: { name: "asc" } }),
    ]);
    return { products, categories };
  } catch {
    return { products: [], categories: [] };
  }
}

function ProductRow({ product, deleteAction }: { product: Awaited<ReturnType<typeof getData>>["products"][number]; deleteAction: typeof deleteProductAction }) {
  return (
    <div className="flex items-center gap-4 p-4">
      <div className="relative w-14 h-14 rounded-xl bg-[#f6f8fb] overflow-hidden shrink-0">
        {product.image ? (
          <Image src={product.image} alt={product.name} fill className="object-contain" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20 8H4a2 2 0 00-2 2v8a2 2 0 002 2h16a2 2 0 002-2v-8a2 2 0 00-2-2zM4 6h16V4H4v2z" />
            </svg>
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-bold text-sm text-[#1d2353] truncate">{product.name}</p>
        <p className="text-xs text-gray-500 truncate">{product.category?.name ?? "Fără categorie"}</p>
      </div>
      <p className="text-sm font-bold text-[#1d2353] shrink-0">{product.price.toLocaleString("ro-MD")} MDL</p>
      <span
        className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase shrink-0 ${
          product.inStock ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
        }`}
      >
        {product.inStock ? "În stoc" : "Stoc epuizat"}
      </span>
      <div className="flex items-center gap-1 shrink-0">
        <Link
          href={`/admin/produse/${product.id}`}
          className="text-gray-400 hover:text-[#c7092b] transition-colors p-1.5 rounded-lg hover:bg-[#fdf2f3]"
          aria-label="Editează"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.5-9.5a2.121 2.121 0 113 3L12 13l-4 1 1-4 8.5-8.5z" />
          </svg>
        </Link>
        <DeleteButton action={deleteAction} id={product.id} confirmText="Sigur vrei să ștergi acest produs?" />
      </div>
    </div>
  );
}

export default async function AdminProdusePage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const query = await searchParams;
  const { products: allProducts, categories } = await getData();

  const catFilter = typeof query.cat === "string" ? query.cat : "";
  const sort = typeof query.sort === "string" ? query.sort : "newest";

  let products = catFilter ? allProducts.filter((p) => p.categoryId === catFilter) : allProducts;

  products = [...products].sort((a, b) => {
    if (sort === "name-asc") return a.name.localeCompare(b.name);
    if (sort === "price-asc") return a.price - b.price;
    if (sort === "price-desc") return b.price - a.price;
    return +new Date(b.createdAt) - +new Date(a.createdAt);
  });

  return (
    <div>
      <AdminPageHeader
        title="Produse"
        description="Catalogul de produse afișat pe site."
        action={
          <div className="flex items-center gap-2">
            <Link
              href="/admin/produse/categorii"
              className="inline-flex items-center gap-2 border border-gray-200 hover:bg-gray-50 text-[#1d2353] font-bold px-5 py-2.5 rounded-xl transition-colors text-sm uppercase tracking-wide"
            >
              Categorii (filtre)
            </Link>
            <Link
              href="/admin/produse/nou"
              className="inline-flex items-center gap-2 bg-[#c7092b] hover:bg-[#a5071f] text-white font-bold px-5 py-2.5 rounded-xl transition-colors text-sm uppercase tracking-wide"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              Adaugă produs
            </Link>
          </div>
        }
      />

      <AdminProductFilters categories={categories} />
      <p className="text-xs text-gray-400 mb-4">{products.length} produse găsite</p>

      {products.length === 0 ? (
        <div className="bg-white border border-gray-100 rounded-2xl p-10 text-center text-gray-500">
          Nu există produse pentru acest filtru.
        </div>
      ) : catFilter ? (
        <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
          <div className="divide-y divide-gray-100">
            {products.map((p) => (
              <ProductRow key={p.id} product={p} deleteAction={deleteProductAction} />
            ))}
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {categories.map((cat) => {
            const inCategory = products.filter((p) => p.categoryId === cat.id);
            if (inCategory.length === 0) return null;
            return (
              <div key={cat.id}>
                <p className="text-xs font-extrabold uppercase tracking-wide text-[#1d2353] mb-2">
                  {cat.name} <span className="text-gray-400">({inCategory.length})</span>
                </p>
                <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
                  <div className="divide-y divide-gray-100">
                    {inCategory.map((p) => (
                      <ProductRow key={p.id} product={p} deleteAction={deleteProductAction} />
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
