import Link from "next/link";
import Image from "next/image";
import { Prisma } from "@prisma/client";
import { ArrowRight, X, ImageOff, Check } from "lucide-react";
import { prisma } from "@/lib/prisma";
import AdminPageHeader from "../components/AdminPageHeader";
import SaveButton from "../components/SaveButton";
import AdminProductFilters from "../produse/AdminProductFilters";
import AdminPagination from "../components/AdminPagination";
import PopupStatsFilters from "./PopupStatsFilters";
import PageFade from "../components/PageFade";
import { Card } from "@/app/components/ui/card";
import { Label } from "@/app/components/ui/label";
import { Checkbox } from "@/app/components/ui/checkbox";
import { Badge } from "@/app/components/ui/badge";
import { Alert, AlertDescription } from "@/app/components/ui/alert";
import {
  getPopupEnabledProductIds,
  updatePopupProductsAction,
  getPopupCountdownMinutes,
  updatePopupTimerAction,
} from "@/lib/popupProduct";
import { getPopupStatsByProduct } from "@/lib/popupStatActions";

const PER_PAGE = 9;
const STATS_PER_PAGE = 9;

function buildHref(current: Record<string, string | string[] | undefined>, overrides: Record<string, string | null>) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(current)) {
    if (typeof value === "string") params.set(key, value);
  }
  for (const [key, value] of Object.entries(overrides)) {
    if (value === null) params.delete(key);
    else params.set(key, value);
  }
  const qs = params.toString();
  return qs ? `?${qs}` : "?";
}

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

  const statCat = typeof query.statCat === "string" ? query.statCat : "";
  const statQ = typeof query.statQ === "string" ? query.statQ : "";
  const statPage = Math.max(1, Number(query.statPage) || 1);

  const saved = typeof query.saved === "string" ? query.saved : "";

  const [{ products, total, categories, enabledIds }, countdownMinutes, allProductStats] = await Promise.all([
    getData(catFilter, sort, page),
    getPopupCountdownMinutes(),
    getPopupStatsByProduct(statCat || undefined, statQ || undefined),
  ]);
  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE));

  const statTotalPages = Math.max(1, Math.ceil(allProductStats.length / STATS_PER_PAGE));
  const productStats = allProductStats.slice((statPage - 1) * STATS_PER_PAGE, statPage * STATS_PER_PAGE);

  return (
    <div>
      <AdminPageHeader
        title="Pop-up ofertă"
        description="Alege ce produse pot apărea în pop-up-ul cu reducere de pe site. La fiecare vizită se arată unul ales aleatoriu din lista bifată. Dacă nu bifezi niciun produs, se arată automat unul cu reducere."
      />

      {saved === "1" && (
        <Alert variant="success" role="status" className="max-w-2xl mb-4 animate-slide-up">
          <Check aria-hidden />
          <AlertDescription>Selecția a fost salvată cu succes.</AlertDescription>
        </Alert>
      )}

      <Card className="p-6 mb-6">
        <form action={updatePopupTimerAction} className="flex flex-wrap items-end gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="countdownMinutes">Durată numărătoare inversă (minute)</Label>
            <input
              id="countdownMinutes"
              type="number"
              name="countdownMinutes"
              min={1}
              max={180}
              defaultValue={countdownMinutes}
              className="h-12 w-40 rounded-xl border-2 border-input bg-card px-4 py-3 text-base text-foreground focus-visible:outline-none focus-visible:border-accent focus-visible:ring-3 focus-visible:ring-accent/20"
            />
          </div>
          <SaveButton label="Salvează durata" />
        </form>
      </Card>

      <Card className="p-6 mb-6">
        <p className="text-xs font-bold uppercase tracking-wide text-primary mb-1">Interacțiuni pe ofertă</p>
        <p className="text-xs text-muted-foreground mb-4">
          Câte persoane au dat click pe „Vezi produsul” față de câte au închis pop-up-ul, per produs — un semn că oferta atrage interes.
        </p>

        <PopupStatsFilters categories={categories} />

        <PageFade pageKey={`${statCat}-${statQ}-${statPage}`}>
          {productStats.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Încă nu există interacțiuni înregistrate cu pop-up-ul{statCat || statQ ? " pentru acest filtru" : ""}.
            </p>
          ) : (
            <div className="flex flex-col gap-2">
              {productStats.map((stat) => {
                const total = stat.clicks + stat.closes;
                const clickRate = total > 0 ? Math.round((stat.clicks / total) * 100) : 0;
                return (
                  <div key={stat.slug} className="flex items-center gap-4 px-3 py-2.5 border border-border rounded-xl">
                    <div className="relative w-10 h-10 rounded-lg bg-muted overflow-hidden shrink-0 flex items-center justify-center">
                      {stat.image ? (
                        <Image src={stat.image} alt={stat.name} fill className="object-contain p-1" />
                      ) : (
                        <ImageOff className="w-4 h-4 text-muted-foreground" aria-hidden />
                      )}
                    </div>
                    <p className="text-sm font-bold text-primary truncate flex-1 min-w-0">{stat.name}</p>
                    <div className="flex items-center gap-1.5 text-xs font-bold text-success shrink-0">
                      <ArrowRight className="w-3.5 h-3.5" aria-hidden />
                      {stat.clicks} click-uri
                    </div>
                    <div className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground shrink-0">
                      <X className="w-3.5 h-3.5" aria-hidden />
                      {stat.closes} închideri
                    </div>
                    <Badge variant="accent" className="normal-case">{clickRate}%</Badge>
                  </div>
                );
              })}
            </div>
          )}
        </PageFade>

        {statTotalPages > 1 && (
          <div className="flex items-center justify-between mt-4">
            <Link
              href={buildHref(query, { statPage: statPage > 2 ? String(statPage - 1) : null })}
              scroll={false}
              aria-disabled={statPage <= 1}
              className={`text-xs font-bold text-primary border border-border rounded-lg px-4 py-2 hover:bg-muted transition-colors ${
                statPage <= 1 ? "opacity-40 pointer-events-none" : ""
              }`}
            >
              ← Anterior
            </Link>
            <span className="text-xs text-muted-foreground">
              Pagina {statPage} din {statTotalPages}
            </span>
            <Link
              href={buildHref(query, { statPage: String(statPage + 1) })}
              scroll={false}
              aria-disabled={statPage >= statTotalPages}
              className={`text-xs font-bold text-primary border border-border rounded-lg px-4 py-2 hover:bg-muted transition-colors ${
                statPage >= statTotalPages ? "opacity-40 pointer-events-none" : ""
              }`}
            >
              Următor →
            </Link>
          </div>
        )}
      </Card>

      <AdminProductFilters categories={categories} />
      <p className="text-xs text-muted-foreground mb-4">{total} produse găsite</p>

      <form action={updatePopupProductsAction}>
        <Card className="p-6">
          <input type="hidden" name="allIds" value={products.map((p) => p.id).join(",")} />
          <input type="hidden" name="cat" value={catFilter} />
          <input type="hidden" name="sort" value={sort} />
          <input type="hidden" name="page" value={page} />

          <PageFade pageKey={`${catFilter}-${sort}-${page}`}>
            {products.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nu există produse pentru acest filtru.</p>
            ) : (
              <div className="flex flex-col gap-2 mb-6">
                {products.map((product) => (
                  <ProductRow key={product.id} product={product} checked={enabledIds.has(product.id)} />
                ))}
              </div>
            )}
          </PageFade>

          <SaveButton key={`${page}-${catFilter}-${sort}`} label="Salvează selecția" />
        </Card>
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
    <label className="flex items-center gap-4 border border-border rounded-xl px-4 py-3 cursor-pointer hover:border-accent/40 transition-colors">
      <Checkbox name="productIds" value={product.id} defaultChecked={checked} />
      <div className="relative w-12 h-12 rounded-lg bg-muted overflow-hidden shrink-0 flex items-center justify-center">
        {product.image ? (
          <Image src={product.image} alt={product.name} fill className="object-contain p-1" />
        ) : (
          <ImageOff className="w-5 h-5 text-muted-foreground" aria-hidden />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-bold text-primary truncate">{product.name}</p>
        <div className="flex items-center gap-2">
          <p className="text-xs text-muted-foreground truncate">{product.category?.name ?? "Fără categorie"}</p>
          <p className="text-xs text-muted-foreground">{product.price.toLocaleString("ro-MD")} MDL</p>
          {product.oldPrice && (
            <p className="text-xs text-muted-foreground line-through">{product.oldPrice.toLocaleString("ro-MD")} MDL</p>
          )}
        </div>
      </div>
    </label>
  );
}
