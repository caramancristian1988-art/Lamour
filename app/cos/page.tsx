"use client";

import Image from "next/image";
import Link from "next/link";
import { ImageOff, Minus, Plus, ShoppingCart, X } from "lucide-react";
import { useCart } from "../components/CartProvider";
import { Button } from "@/app/components/ui/button";
import { Badge } from "@/app/components/ui/badge";

export default function CosPage() {
  const { items, cartCount, removeFromCart, updateQuantity } = useCart();
  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const savings = items.reduce((sum, i) => sum + (i.oldPrice ? (i.oldPrice - i.price) * i.quantity : 0), 0);

  return (
    <main className="bg-background min-h-[60vh]">
      <section className="border-b border-border bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-8">
          <nav className="flex items-center gap-1.5 text-xs text-muted-foreground mb-4" aria-label="Fir de ariadnă">
            <Link href="/" className="hover:text-accent transition-colors">Acasă</Link>
            <span aria-hidden>›</span>
            <span className="text-foreground">Coș</span>
          </nav>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-primary">
            Coșul <span className="text-accent">tău</span>
          </h1>
          <p className="text-muted-foreground text-sm mt-2">
            {cartCount > 0 ? `${cartCount} produs${cartCount === 1 ? "" : "e"} în coș` : "Coșul tău este gol."}
          </p>
        </div>
      </section>

      <section className="py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
          {items.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8">
              {/* Items */}
              <div className="flex flex-col gap-4">
                {items.map((item) => (
                  <div
                    key={item.slug}
                    className="flex flex-col sm:flex-row sm:items-center gap-4 border border-border rounded-2xl p-4 bg-card"
                  >
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <Link href={`/produse/${item.slug}`} className="relative w-20 h-20 shrink-0 bg-muted rounded-xl overflow-hidden flex items-center justify-center">
                        {item.image ? (
                          <Image src={item.image} alt={item.name} fill className="object-contain" sizes="80px" />
                        ) : (
                          <ImageOff className="w-8 h-8 text-muted-foreground/40" aria-hidden />
                        )}
                      </Link>

                      <div className="flex-1 min-w-0">
                        <Link href={`/produse/${item.slug}`} className="font-bold text-sm text-foreground hover:text-accent transition-colors line-clamp-2">
                          {item.name}
                        </Link>
                        <div className="flex items-center gap-2 flex-wrap mt-1">
                          <p className="text-sm font-extrabold text-foreground">
                            {item.price.toLocaleString("ro-MD")} MDL
                          </p>
                          {item.oldPrice && (
                            <>
                              <p className="text-xs text-muted-foreground line-through">
                                {item.oldPrice.toLocaleString("ro-MD")} MDL
                              </p>
                              <Badge variant="accent" className="normal-case px-1.5 py-0.5">
                                -{Math.round((1 - item.price / item.oldPrice) * 100)}%
                              </Badge>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-4 sm:gap-6">
                      <div className="flex items-center gap-2 border border-border rounded-lg shrink-0">
                        <button
                          onClick={() => updateQuantity(item.slug, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                          className="w-8 h-8 flex items-center justify-center text-muted-foreground hover:text-accent disabled:text-muted-foreground/40 transition-colors"
                          aria-label="Scade cantitatea"
                        >
                          <Minus className="w-3.5 h-3.5" aria-hidden />
                        </button>
                        <span className="text-sm font-bold w-6 text-center">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.slug, item.quantity + 1)}
                          className="w-8 h-8 flex items-center justify-center text-muted-foreground hover:text-accent transition-colors"
                          aria-label="Crește cantitatea"
                        >
                          <Plus className="w-3.5 h-3.5" aria-hidden />
                        </button>
                      </div>

                      <div className="flex items-center gap-3 sm:gap-4 shrink-0">
                        <p className="text-sm font-extrabold text-primary sm:w-24 sm:text-right">
                          {(item.price * item.quantity).toLocaleString("ro-MD")} MDL
                        </p>

                        <button
                          onClick={() => removeFromCart(item.slug)}
                          aria-label={`Elimină ${item.name} din coș`}
                          className="w-9 h-9 flex items-center justify-center text-muted-foreground hover:text-accent hover:bg-muted rounded-lg transition-colors shrink-0"
                        >
                          <X className="w-4.5 h-4.5" aria-hidden />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Summary */}
              <div className="border border-border rounded-2xl p-6 h-fit bg-card">
                <h2 className="font-extrabold text-primary mb-4">Sumar comandă</h2>
                <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
                  <span>Subtotal</span>
                  <span className="font-bold text-foreground">{subtotal.toLocaleString("ro-MD")} MDL</span>
                </div>
                {savings > 0 && (
                  <div className="flex items-center justify-between text-sm text-success mb-2">
                    <span>Economisești</span>
                    <span className="font-bold">−{savings.toLocaleString("ro-MD")} MDL</span>
                  </div>
                )}
                <p className="text-xs text-muted-foreground mb-4">Costul livrării se stabilește la confirmarea comenzii.</p>
                <div className="flex items-center justify-between border-t border-border pt-4 mb-6">
                  <span className="font-bold text-primary">Total</span>
                  <span className="font-extrabold text-xl text-primary">{subtotal.toLocaleString("ro-MD")} MDL</span>
                </div>
                <Button asChild variant="accent" className="w-full">
                  <Link href="/finalizare-comanda">Finalizează comanda</Link>
                </Button>
                <Button asChild variant="ghost" className="w-full mt-3">
                  <Link href="/produse">Continuă cumpărăturile</Link>
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-16">
              <ShoppingCart className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" strokeWidth={1.5} aria-hidden />
              <p className="text-muted-foreground mb-6">Adaugă produse în coș pentru a continua.</p>
              <Button asChild variant="primary">
                <Link href="/produse">Vezi produsele</Link>
              </Button>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
