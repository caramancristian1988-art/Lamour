import Image from "next/image";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import AdminPageHeader from "../components/AdminPageHeader";
import SaveButton from "../components/SaveButton";
import AdminProductFilters from "../produse/AdminProductFilters";
import AdminPagination from "../components/AdminPagination";
import {
  getPopupEnabledProductIds,
  updatePopupProductsAction,
  getPopupCountdownMinutes,
  updatePopupTimerAction,
} from "@/lib/popupProduct";

const PER_PAGE = 9;

async function getData(catFilter: string, sort: string, page: number) {
  const where: Prisma.ProductWhereInput = catFilter ? { categoryId: catFilter } : {};

  const orderBy: Prisma.ProductOrderByWithRelationInput =
    sort === "name-asc"
      ? { name: "asc" }
      : sort === "price-asc"
      ? { price: "asc" }
      : sort === "price-desc"
      ? { price: "desc" }
      : { createdAt: "desc" };

  try {
    const [products, total, categories, enabledIds] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy,
        skip: (page - 1) * PER_PAGE,
        take: PER_PAGE,
        include: { category: true },
      }),
      prisma.product.count({ where }),
      prisma.category.findMany({ orderBy: { name: "asc" } }),
      getPopupEnabledProductIds(),
    ]);
    return { products, total, categories, enabledIds };
  } catch {
    return { products: [], total: 0, categories: [], enabledIds: new Set<string>() };
  }
}

export default async function AdminPopupPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const query = await searchParams;

  const catFilter = typeof query.cat === "string" ? query.cat : "";
  const sort = typeof query.sort === "string" ? query.sort : "newest";
  const page = Math.max(1, Number(query.page) || 1);

  const [{ products, total, categories, enabledIds }, countdownMinutes] = await Promise.all([
    getData(catFilter, sort, page),
    getPopupCountdownMinutes(),
  ]);
  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE));

  return (
    <div>
      <AdminPageHeader
        title="Pop-up ofertă"
        description="Alege ce produse pot apărea în pop-up-ul cu reducere de pe site. La fiecare vizită se arată unul ales aleatoriu din lista bifată. Dacă nu bifezi niciun produs, se arată automat unul cu reducere."
      />

      <form
        action={updatePopupTimerAction}
        className="bg-white border border-gray-100 rounded-2xl p-6 mb-6 flex flex-wrap items-end gap-4"
      >
        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-bold text-gray-600">Durată numărătoare inversă (minute)</span>
          <input
            type="number"
            name="countdownMinutes"
            min={1}
            max={180}
            defaultValue={countdownMinutes}
            className="border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#c7092b] w-40"
          />
        </label>
        <SaveButton label="Salvează durata" />
      </form>

      <AdminProductFilters categories={categories} />
      <p className="text-xs text-gray-400 mb-4">{total} produse găsite</p>

      <form action={updatePopupProductsAction} className="bg-white border border-gray-100 rounded-2xl p-6">
        <input type="hidden" name="allIds" value={products.map((p) => p.id).join(",")} />

        {products.length === 0 ? (
          <p className="text-sm text-gray-500">Nu există produse pentru acest filtru.</p>
        ) : (
          <div className="flex flex-col gap-2 mb-6">
            {products.map((product) => (
              <ProductRow key={product.id} product={product} checked={enabledIds.has(product.id)} />
            ))}
          </div>
        )}

        <SaveButton label="Salvează selecția" />
      </form>

      <AdminPagination page={page} totalPages={totalPages} />
    </div>
  );
}

function ProductRow({
  product,
  checked,
}: {
  product: {
    id: string;
    name: string;
    image: string | null;
    price: number;
    oldPrice: number | null;
    category: { name: string } | null;
  };
  checked: boolean;
}) {
  return (
    <label className="flex items-center gap-4 border border-gray-100 rounded-xl px-4 py-3 cursor-pointer hover:border-gray-200 transition-colors">
      <input
        type="checkbox"
        name="productIds"
        value={product.id}
        defaultChecked={checked}
        className="w-5 h-5 rounded border-gray-300 text-[#c7092b] focus:ring-[#c7092b] accent-[#c7092b] shrink-0"
      />
      <div className="relative w-12 h-12 rounded-lg bg-[#f6f8fb] overflow-hidden shrink-0">
        {product.image && <Image src={product.image} alt={product.name} fill className="object-contain p-1" />}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-bold text-[#1d2353] truncate">{product.name}</p>
        <div className="flex items-center gap-2">
          <p className="text-xs text-gray-400 truncate">{product.category?.name ?? "Fără categorie"}</p>
          <p className="text-xs text-gray-500">{product.price.toLocaleString("ro-MD")} MDL</p>
          {product.oldPrice && (
            <p className="text-xs text-gray-400 line-through">{product.oldPrice.toLocaleString("ro-MD")} MDL</p>
          )}
        </div>
      </div>
    </label>
  );
}
