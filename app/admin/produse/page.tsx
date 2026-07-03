import Link from "next/link";
import Image from "next/image";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { Image as ImageIcon, ExternalLink, Pencil, Plus } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Badge } from "@/app/components/ui/badge";
import AdminPageHeader from "../components/AdminPageHeader";
import DeleteButton from "../components/DeleteButton";
import AdminProductFilters from "./AdminProductFilters";
import AdminPagination from "../components/AdminPagination";
import CopyableId from "../components/CopyableId";
import { deleteProductAction } from "@/lib/adminProductActions";

const PER_PAGE = 10;

const OBJECT_ID_RE = /^[0-9a-fA-F]{24}$/;

async function getData(catFilter: string, sort: string, page: number, search: string) {
  const where: Prisma.ProductWhereInput = {
    ...(catFilter ? { categoryId: catFilter } : {}),
    ...(search
      ? {
          OR: [
            { name: { contains: search, mode: "insensitive" } },
            { slug: { contains: search, mode: "insensitive" } },
            { brand: { contains: search, mode: "insensitive" } },
            ...(OBJECT_ID_RE.test(search) ? [{ id: search }] : []),
          ],
        }
      : {}),
  };

  const orderBy: Prisma.ProductOrderByWithRelationInput =
    sort === "name-asc"
      ? { name: "asc" }
      : sort === "price-asc"
      ? { price: "asc" }
      : sort === "price-desc"
      ? { price: "desc" }
      : { createdAt: "desc" };

  try {
    const [products, total, categories] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy,
        skip: (page - 1) * PER_PAGE,
        take: PER_PAGE,
        include: { category: true },
      }),
      prisma.product.count({ where }),
      prisma.category.findMany({ orderBy: { name: "asc" } }),
    ]);
    return { products, total, categories };
  } catch {
    return { products: [], total: 0, categories: [] };
  }
}

function ProductRow({ product, deleteAction }: { product: Awaited<ReturnType<typeof getData>>["products"][number]; deleteAction: typeof deleteProductAction }) {
  return (
    <div className="flex items-start gap-3 p-4">
      <div className="relative w-12 h-12 rounded-xl bg-muted overflow-hidden shrink-0 mt-0.5">
        {product.image ? (
          <Image src={product.image} alt={product.name} fill className="object-contain" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
            <ImageIcon className="w-6 h-6" aria-hidden />
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-bold text-sm text-primary line-clamp-2 leading-snug">{product.name}</p>
        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
          <p className="text-sm text-muted-foreground">{product.category?.name ?? "Fără categorie"}</p>
          <CopyableId id={product.id} />
        </div>
        <div className="flex items-center gap-2 mt-2 flex-wrap">
          <span className="text-sm font-bold text-primary">{product.price.toLocaleString("ro-MD")} MDL</span>
          <Badge variant={product.availability === "Stoc epuizat" ? "muted" : "success"}>
            {product.availability}
          </Badge>
          <div className="ml-auto flex items-center gap-0.5">
            <Button variant="ghost" size="icon" asChild>
              <Link
                href={`/produse/${product.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Vezi produsul ${product.name} pe site`}
              >
                <ExternalLink className="w-4 h-4" aria-hidden />
              </Link>
            </Button>
            <Button variant="ghost" size="icon" asChild>
              <Link href={`/admin/produse/${product.id}`} aria-label={`Editează produsul ${product.name}`}>
                <Pencil className="w-4 h-4" aria-hidden />
              </Link>
            </Button>
            <DeleteButton action={deleteAction} id={product.id} confirmText="Sigur vrei să ștergi acest produs?" label={`Șterge produsul ${product.name}`} />
          </div>
        </div>
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

  const catFilter = typeof query.cat === "string" ? query.cat : "";
  const sort = typeof query.sort === "string" ? query.sort : "newest";
  const search = typeof query.q === "string" ? query.q.trim() : "";
  const page = Math.max(1, Number(query.page) || 1);

  const { products, total, categories } = await getData(catFilter, sort, page, search);
  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE));

  return (
    <div>
      <AdminPageHeader
        title="Produse"
        description="Catalogul de produse afișat pe site."
        action={
          <div className="flex items-center gap-2">
            <Button variant="outline" asChild>
              <Link href="/admin/produse/categorii">Categorii (filtre)</Link>
            </Button>
            <Button variant="accent" asChild>
              <Link href="/admin/produse/nou">
                <Plus className="w-4 h-4" aria-hidden />
                Adaugă produs
              </Link>
            </Button>
          </div>
        }
      />

      <AdminProductFilters categories={categories} />
      <p className="text-sm text-muted-foreground mb-4">{total} produse găsite</p>

      {products.length === 0 ? (
        <div className="bg-card border border-border rounded-2xl p-10 text-center text-muted-foreground">
          Nu există produse pentru acest filtru.
        </div>
      ) : (
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <div className="divide-y divide-border">
            {products.map((p) => (
              <ProductRow key={p.id} product={p} deleteAction={deleteProductAction} />
            ))}
          </div>
        </div>
      )}

      <AdminPagination page={page} totalPages={totalPages} />
    </div>
  );
}
