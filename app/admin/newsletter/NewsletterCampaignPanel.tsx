"use client";

import { useActionState, useMemo, useState, useTransition } from "react";
import { AlertCircle, Check, ChevronLeft, ChevronRight, ImageOff, Mail, Search, X } from "lucide-react";
import Image from "next/image";
import {
  sendNewsletterCampaignAction,
  deleteSubscriberAction,
  type NewsletterCampaignState,
} from "@/lib/newsletterActions";
import { AdminInput, AdminTextarea } from "../components/AdminField";
import { Button } from "@/app/components/ui/button";
import { Checkbox } from "@/app/components/ui/checkbox";
import { Alert, AlertDescription } from "@/app/components/ui/alert";
import DeleteButton from "../components/DeleteButton";

interface Subscriber {
  id: string;
  email: string;
  createdAt: Date;
}

interface PickerProduct {
  id: string;
  name: string;
  price: number;
  oldPrice: number | null;
  image: string | null;
  categoryId: string;
}

interface PickerCategory {
  id: string;
  name: string;
}

const initialState: NewsletterCampaignState = {};
const PRODUCTS_PER_PAGE = 9;

export default function NewsletterCampaignPanel({
  subscribers,
  products,
  categories,
}: {
  subscribers: Subscriber[];
  products: PickerProduct[];
  categories: PickerCategory[];
}) {
  const [selected, setSelected] = useState<Set<string>>(() => new Set(subscribers.map((s) => s.id)));
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set());
  const [productSearch, setProductSearch] = useState("");
  const [productCategory, setProductCategory] = useState("");
  const [productPage, setProductPage] = useState(1);
  const [state, formAction, pending] = useActionState(sendNewsletterCampaignAction, initialState);
  const [, startTransition] = useTransition();

  const filteredProducts = useMemo(() => {
    const q = productSearch.trim().toLowerCase();
    return products.filter((p) => {
      if (productCategory && p.categoryId !== productCategory) return false;
      if (!q) return true;
      return p.name.toLowerCase().includes(q) || p.id.toLowerCase() === q || p.id.toLowerCase().includes(q);
    });
  }, [products, productSearch, productCategory]);

  const productTotalPages = Math.max(1, Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE));
  const currentProductPage = Math.min(productPage, productTotalPages);
  const pagedProducts = filteredProducts.slice(
    (currentProductPage - 1) * PRODUCTS_PER_PAGE,
    currentProductPage * PRODUCTS_PER_PAGE
  );

  function updateProductSearch(value: string) {
    setProductSearch(value);
    setProductPage(1);
  }

  function updateProductCategory(value: string) {
    setProductCategory(value);
    setProductPage(1);
  }

  function toggleProduct(id: string) {
    setSelectedProducts((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const selectedProductList = products.filter((p) => selectedProducts.has(p.id));

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function selectAll() {
    setSelected(new Set(subscribers.map((s) => s.id)));
  }

  function deselectAll() {
    setSelected(new Set());
  }

  function handleDelete(id: string) {
    startTransition(() => {
      const fd = new FormData();
      fd.set("id", id);
      deleteSubscriberAction(fd);
    });
    setSelected((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="font-bold text-sm text-primary mb-3">
          Produse pentru ofertă <span className="font-normal text-muted-foreground">(opțional)</span>
        </p>
        <div className="bg-card border border-border rounded-2xl p-4 flex flex-col gap-3">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="relative flex-1 min-w-[220px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden />
              <label className="sr-only" htmlFor="product-picker-search">
                Caută produse
              </label>
              <input
                id="product-picker-search"
                type="text"
                value={productSearch}
                onChange={(e) => updateProductSearch(e.target.value)}
                placeholder="Caută după nume sau ID produs..."
                className="w-full text-sm font-semibold text-foreground border-2 border-input rounded-xl pl-9 pr-3 py-2 focus-visible:outline-none focus-visible:border-accent focus-visible:ring-3 focus-visible:ring-accent/20 bg-card transition-colors"
              />
            </div>
            <select
              value={productCategory}
              onChange={(e) => updateProductCategory(e.target.value)}
              aria-label="Filtrează după categorie"
              className="text-sm font-semibold text-muted-foreground border-2 border-input rounded-xl px-3 py-2 focus-visible:outline-none focus-visible:border-accent focus-visible:ring-3 focus-visible:ring-accent/20 bg-card transition-colors"
            >
              <option value="">Toate categoriile</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            <p className="text-xs text-muted-foreground ml-auto">
              {selectedProducts.size} produse selectate
            </p>
          </div>

          {selectedProductList.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {selectedProductList.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => toggleProduct(p.id)}
                  className="inline-flex items-center gap-1 text-xs font-semibold bg-accent/10 text-accent border border-accent/30 rounded-full pl-2.5 pr-1.5 py-1 hover:bg-accent/20 transition-colors"
                >
                  {p.name}
                  <X className="w-3 h-3" aria-hidden />
                </button>
              ))}
            </div>
          )}

          <div className="flex flex-col gap-1.5 pr-1">
            {filteredProducts.length === 0 ? (
              <p className="text-sm text-muted-foreground py-6 text-center">Niciun produs găsit pentru acest filtru.</p>
            ) : (
              pagedProducts.map((p) => {
                const id = `product-${p.id}`;
                return (
                  <label
                    key={p.id}
                    htmlFor={id}
                    className="flex items-center gap-3 border border-border rounded-xl px-3 py-2 cursor-pointer hover:border-accent/40 transition-colors"
                  >
                    <Checkbox id={id} checked={selectedProducts.has(p.id)} onCheckedChange={() => toggleProduct(p.id)} />
                    <div className="relative w-10 h-10 rounded-lg bg-muted overflow-hidden shrink-0 flex items-center justify-center">
                      {p.image ? (
                        <Image src={p.image} alt={p.name} fill className="object-contain p-1" />
                      ) : (
                        <ImageOff className="w-4 h-4 text-muted-foreground" aria-hidden />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold text-primary truncate">{p.name}</p>
                      <div className="flex items-center gap-2">
                        <p className="text-xs text-muted-foreground">{p.price.toLocaleString("ro-MD")} MDL</p>
                        {p.oldPrice && (
                          <p className="text-xs text-muted-foreground line-through">
                            {p.oldPrice.toLocaleString("ro-MD")} MDL
                          </p>
                        )}
                      </div>
                    </div>
                  </label>
                );
              })
            )}
          </div>

          {filteredProducts.length > 0 && (
            <div className="flex items-center justify-between gap-3 pt-1">
              <button
                type="button"
                onClick={() => setProductPage((p) => Math.max(1, p - 1))}
                disabled={currentProductPage <= 1}
                aria-label="Produsele anterioare"
                className="w-8 h-8 rounded-full border border-border flex items-center justify-center text-primary hover:text-accent hover:border-accent/40 transition-colors disabled:opacity-40 disabled:pointer-events-none"
              >
                <ChevronLeft className="w-4 h-4" aria-hidden />
              </button>
              <p className="text-xs text-muted-foreground">
                Pagina {currentProductPage} din {productTotalPages}
              </p>
              <button
                type="button"
                onClick={() => setProductPage((p) => Math.min(productTotalPages, p + 1))}
                disabled={currentProductPage >= productTotalPages}
                aria-label="Produsele următoare"
                className="w-8 h-8 rounded-full border border-border flex items-center justify-center text-primary hover:text-accent hover:border-accent/40 transition-colors disabled:opacity-40 disabled:pointer-events-none"
              >
                <ChevronRight className="w-4 h-4" aria-hidden />
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6">
        <div className="flex flex-col gap-3 order-2 lg:order-1">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <p className="text-sm text-muted-foreground">
              {selected.size} din {subscribers.length} abonați selectați
            </p>
            <div className="flex gap-2">
              <Button type="button" variant="outline" size="sm" onClick={selectAll}>
                Selectează tot
              </Button>
              <Button type="button" variant="outline" size="sm" onClick={deselectAll}>
                Deselectează tot
              </Button>
            </div>
          </div>

          {subscribers.length === 0 ? (
            <div className="bg-card border border-border rounded-2xl p-10 text-center text-muted-foreground flex flex-col items-center gap-2">
              <Mail className="w-8 h-8 text-muted-foreground/60" aria-hidden />
              Niciun abonat încă.
            </div>
          ) : (
            subscribers.map((s) => {
              const id = `subscriber-${s.id}`;
              return (
                <div key={s.id} className="bg-card border border-border rounded-2xl p-4 flex items-center gap-4">
                  <Checkbox id={id} checked={selected.has(s.id)} onCheckedChange={() => toggle(s.id)} />
                  <label htmlFor={id} className="flex-1 min-w-0 cursor-pointer">
                    <p className="font-bold text-sm text-primary truncate">{s.email}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Abonat pe {s.createdAt.toLocaleDateString("ro-MD", { day: "numeric", month: "long", year: "numeric" })}
                    </p>
                  </label>
                  <DeleteButton
                    action={(formData) => handleDelete(String(formData.get("id")))}
                    id={s.id}
                    confirmText={`Sigur vrei să elimini "${s.email}" din lista de abonați?`}
                    label={`Elimină abonatul ${s.email}`}
                  />
                </div>
              );
            })
          )}
        </div>

        <div className="order-1 lg:order-2">
          <p className="font-bold text-sm text-primary mb-3">Trimite o ofertă</p>
          <form action={formAction} className="bg-card border border-border rounded-2xl p-6 flex flex-col gap-4">
            <input type="hidden" name="subscriberIds" value={Array.from(selected).join(",")} />
            <input type="hidden" name="productIds" value={Array.from(selectedProducts).join(",")} />

            {state.error && (
              <Alert variant="destructive">
                <AlertCircle aria-hidden />
                <AlertDescription>{state.error}</AlertDescription>
              </Alert>
            )}
            {state.success && (
              <Alert variant="success" role="status">
                <Check aria-hidden />
                <AlertDescription>Ofertă trimisă cu succes către {state.sentCount} abonați.</AlertDescription>
              </Alert>
            )}

            <AdminInput label="Subiect" name="subject" required placeholder="Ofertă specială luna aceasta" />
            <AdminInput
              label="Etichetă ofertă (opțional)"
              name="offerBadge"
              placeholder="-20% doar astăzi, doar pentru tine"
            />
            <AdminTextarea label="Mesaj (opțional)" name="message" rows={8} placeholder="Scrie oferta pe care vrei să o trimiți abonaților..." />

            <Button type="submit" variant="accent" disabled={pending || selected.size === 0} className="self-start mt-2">
              {pending ? "Se trimite..." : `Trimite către ${selected.size} abonați selectați`}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
