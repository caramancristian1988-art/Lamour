"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ChevronDown } from "lucide-react";
import ProductCard from "./ProductCard";
import ProductFilterSidebar from "./ProductFilterSidebar";
import { MultiNavChips, ProductsNavProvider, PendingRegion, useProductsNavigate } from "./ProductsNav";
import { Button } from "@/app/components/ui/button";
import {
  applyFilters,
  paginate,
  parseFilters,
  parsePage,
  parseSort,
  sortProducts,
  type VariantOption,
} from "@/lib/productListing";
import type { CatalogCategory, CatalogProduct } from "@/lib/clientCatalog";

// Lista de produse a Catalogului / a unei categorii, cu TOATE filtrele în browser. Serverul trimite o singură dată
// produsele (în formă compactă); căutarea, categoriile, brandurile, prețul, ofertele, sortarea și „Încarcă mai multe"
// se calculează aici din parametrii din adresă — instant, fără cereri la server. Adresele rămân partajabile.

interface Props {
  /** catalog = /produse (toate categoriile); category = /produse/[categorie] (subcategoriile prin `subcat`). */
  mode: "catalog" | "category";
  products: CatalogProduct[];
  variantOptions: Record<string, VariantOption[]>;
  /** catalog: toate categoriile; category: subcategoriile categoriei curente. */
  categories: CatalogCategory[];
  ratesEnabled: boolean;
  installmentMonths: number;
}

type Params = URLSearchParams;

const EMPTY = new URLSearchParams();

function toQuery(params: Params) {
  const out: Record<string, string | undefined> = {};
  for (const key of ["q", "cat", "brand", "pretMin", "pretMax", "oferte", "sort", "page", "subcat"]) {
    out[key] = params.get(key) ?? undefined;
  }
  return out;
}

function CatalogView({ mode, products: baseProducts, variantOptions, categories, ratesEnabled, installmentMonths, params }: Props & { params: Params }) {
  const query = toQuery(params);
  const sort = parseSort(query.sort);
  const page = parsePage(query.page);
  const filters = parseFilters(query);

  let visible: CatalogProduct[];
  let scoped = baseProducts; // produsele pe baza cărora se calculează limitele de preț / brandurile / ofertele
  let subcategoryChips: { parentSlug: string | null; options: { value: string; label: string }[] } | null = null;
  let categoryOptions: { id: string; slug: string; name: string; count: number }[] | undefined;
  let brandBase: CatalogProduct[];
  let effectiveCategorySlugs: string[] = [];
  const categorySlugById = new Map(categories.map((c) => [c.id, c.slug]));
  const categoryNameById = new Map(categories.map((c) => [c.id, c.name]));

  if (mode === "category") {
    const wanted = (query.subcat ?? "").split(",").filter(Boolean);
    const activeChildren = categories.filter((c) => wanted.includes(c.slug));
    if (activeChildren.length > 0) {
      const ids = new Set(activeChildren.map((c) => c.id));
      scoped = baseProducts.filter((p) => ids.has(p.categoryId));
    }
    if (categories.length > 0) {
      subcategoryChips = { parentSlug: null, options: categories.map((c) => ({ value: c.slug, label: c.name })) };
    }
    visible = applyFilters(scoped, filters);
    brandBase = scoped;
  } else {
    // Când toate categoriile alese sunt din aceeași familie (un părinte și/sau subcategoriile lui), apar butoanele
    // „în 2/3/4 straturi" (selecție multiplă) și, cât timp e ales părintele („Toate"), produsele lui se îmbină cu ale subcategoriilor.
    const selectedCategories = filters.categorySlugs
      .map((slug) => categories.find((c) => c.slug === slug))
      .filter((c): c is CatalogCategory => Boolean(c));
    const familyParentIds = new Set(selectedCategories.map((c) => c.parentId ?? c.id));
    const parentCategory =
      familyParentIds.size === 1 && selectedCategories.length === filters.categorySlugs.length
        ? categories.find((c) => c.id === [...familyParentIds][0])
        : undefined;
    const siblingCategories = parentCategory ? categories.filter((c) => c.parentId === parentCategory.id) : [];
    const showSubcategoryFilters = Boolean(parentCategory) && siblingCategories.length > 0;
    const isParentActive =
      showSubcategoryFilters &&
      (filters.categorySlugs.includes(parentCategory!.slug) || !selectedCategories.some((c) => c.parentId));

    effectiveCategorySlugs =
      showSubcategoryFilters && isParentActive
        ? [parentCategory!.slug, ...siblingCategories.map((c) => c.slug)]
        : filters.categorySlugs;
    const effectiveFilters = { ...filters, categorySlugs: effectiveCategorySlugs };

    const getCategorySlug = (p: CatalogProduct) => categorySlugById.get(p.categoryId) ?? "";
    const getSearchText = (p: CatalogProduct) => `${categoryNameById.get(p.categoryId) ?? ""} ${p.id} ${p.code ?? p.id.slice(-6)}`;

    visible = applyFilters(baseProducts, effectiveFilters, getCategorySlug, getSearchText);
    // Brandurile se numără față de toate celelalte filtre active, MAI PUȚIN brandul, ca alegerea unuia să nu le ascundă pe restul.
    brandBase = applyFilters(baseProducts, { ...effectiveFilters, brands: [] }, getCategorySlug, getSearchText);

    if (showSubcategoryFilters) {
      subcategoryChips = {
        parentSlug: parentCategory!.slug,
        options: siblingCategories.map((s) => ({ value: s.slug, label: s.name })),
      };
    }

    categoryOptions = categories
      .filter((cat) => !cat.parentId)
      .map((cat) => ({
        id: cat.id,
        slug: cat.slug,
        name: cat.name,
        // Un părinte numără și produsele subcategoriilor lui — altfel „Prosoape de bucătărie" apărea cu (0).
        count: baseProducts.filter(
          (p) => p.categoryId === cat.id || categories.some((sub) => sub.parentId === cat.id && sub.id === p.categoryId)
        ).length,
      }));
  }

  const priceBounds = scoped.reduce(
    (acc, p) => ({ min: Math.min(acc.min, p.price), max: Math.max(acc.max, p.price) }),
    { min: scoped[0]?.price ?? 0, max: scoped[0]?.price ?? 0 }
  );
  const brandCounts = new Map<string, number>();
  for (const p of mode === "category" ? scoped : baseProducts) if (p.brand) brandCounts.set(p.brand, brandCounts.get(p.brand) ?? 0);
  for (const p of brandBase) if (p.brand && brandCounts.has(p.brand)) brandCounts.set(p.brand, (brandCounts.get(p.brand) ?? 0) + 1);
  const brandOptions = [...brandCounts.entries()]
    .map(([value, count]) => ({ value, count }))
    .filter((opt) => mode === "category" || opt.count > 0)
    .sort((a, b) => a.value.localeCompare(b.value));
  const offersCount = scoped.filter((p) => p.oldPrice != null).length;

  const sorted = sortProducts(visible, sort);
  const { items, page: currentPage, hasMore } = paginate(sorted, page);

  const emptyText = filters.query
    ? `Niciun produs nu corespunde căutării "${filters.query}".`
    : filters.offersOnly
    ? "Momentan nu există oferte speciale active."
    : "Niciun produs nu corespunde filtrelor selectate.";

  return (
    <ProductsNavProvider params={params}>
      {subcategoryChips && (
        <MultiNavChips
          paramKey={mode === "category" ? "subcat" : "cat"}
          allValue={subcategoryChips.parentSlug}
          ariaLabel="Filtrează după subcategorie (poți alege mai multe)"
          className="flex items-center gap-2 flex-wrap mb-6"
          options={subcategoryChips.options}
        />
      )}

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        <ProductFilterSidebar
          sort={sort}
          categories={categoryOptions}
          brands={brandOptions}
          priceBounds={priceBounds}
          offersCount={offersCount}
        />

        <PendingRegion className="flex-1 min-w-0">
          {/* aria-live: cine folosește cititor de ecran află imediat câte produse au rămas după un filtru. */}
          <p className="text-sm text-muted-foreground mb-3 sm:mb-6" role="status" aria-live="polite">
            {filters.query ? (
              <>
                {visible.length} rezultate pentru <span className="font-bold text-primary">&ldquo;{filters.query}&rdquo;</span>
              </>
            ) : (
              <>{visible.length} produse găsite</>
            )}
          </p>

          {items.length > 0 ? (
            <div className="grid grid-cols-2 lg:grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-3 sm:gap-5">
              {items.map((product, i) => (
                <ProductCard
                  key={product.id}
                  name={product.name}
                  slug={product.slug}
                  price={product.price}
                  oldPrice={product.oldPrice}
                  image={product.image}
                  packageQuantity={product.packageQuantity}
                  rating={product.rating}
                  reviewCount={product.reviewCount}
                  badge={product.badge}
                  priceTiers={product.priceTiers}
                  bulkMinQty={product.bulkMinQty}
                  bulkPrice={product.bulkPrice}
                  showDiscount={filters.offersOnly}
                  installmentsEnabled={ratesEnabled && product.installmentsEnabled}
                  installmentMonths={installmentMonths}
                  variantOptions={variantOptions[product.id]}
                  priority={i < 4}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-card border border-border rounded-2xl">
              <p className="text-muted-foreground mb-4">{emptyText}</p>
              {mode === "category" && (
                <Link
                  href="/produse"
                  className="inline-flex items-center bg-primary hover:bg-brand-maroon-dark text-primary-foreground font-bold px-6 py-3 rounded-lg transition-colors text-sm uppercase tracking-wide"
                >
                  Vezi toate produsele
                </Link>
              )}
            </div>
          )}

          {hasMore && <LoadMore page={currentPage} params={params} />}
        </PendingRegion>
      </div>
    </ProductsNavProvider>
  );
}

function LoadMore({ page, params }: { page: number; params: Params }) {
  const navigate = useProductsNavigate();
  return (
    <div className="flex justify-center mt-12">
      <Button
        variant="outline"
        size="lg"
        onClick={() => {
          const next = new URLSearchParams(params.toString());
          next.set("page", String(page + 1));
          navigate(`${window.location.pathname}?${next.toString()}`, { scroll: false, replace: true });
        }}
      >
        Încarcă mai multe
        <ChevronDown className="w-4 h-4" aria-hidden />
      </Button>
    </div>
  );
}

function WithUrl(props: Props) {
  const search = useSearchParams().toString();
  return <CatalogView {...props} params={new URLSearchParams(search)} />;
}

export default function ProductsCatalog(props: Props) {
  // Pagina e statică: pe server (și până se încarcă JavaScript-ul) se vede lista implicită, fără filtre — aceeași
  // pe care o primesc motoarele de căutare. După hidratare, filtrele din adresă se aplică pe loc.
  return (
    <Suspense fallback={<CatalogView {...props} params={EMPTY} />}>
      <WithUrl {...props} />
    </Suspense>
  );
}
