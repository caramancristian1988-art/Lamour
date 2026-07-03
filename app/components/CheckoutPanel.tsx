"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AlertCircle, ImageOff, ShoppingCart } from "lucide-react";
import { useCart } from "./CartProvider";
import { submitContactMessageAction } from "@/lib/adminMessageActions";
import { Input } from "@/app/components/ui/input";
import { Textarea } from "@/app/components/ui/textarea";
import { Button } from "@/app/components/ui/button";
import { Alert, AlertDescription } from "@/app/components/ui/alert";
import { SuccessState } from "@/app/components/ui/success-state";

type Status = "idle" | "error" | "success" | "pending";

export default function CheckoutPanel() {
  const { items, clearCart } = useCart();
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const savings = items.reduce((sum, i) => sum + (i.oldPrice ? (i.oldPrice - i.price) * i.quantity : 0), 0);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const data = new FormData(e.currentTarget);
    const name = String(data.get("name") ?? "").trim();
    const phone = String(data.get("phone") ?? "").trim();
    const extra = String(data.get("extraMessage") ?? "").trim();

    const missing = [!name && "numele", !phone && "numărul de telefon"].filter(Boolean);
    if (missing.length > 0) {
      setErrorMsg(`Lipsește ${missing.join(" și ")}.`);
      setStatus("error");
      return;
    }

    const itemsList = items
      .map((i) => `${i.quantity}x ${i.name} — ${i.price.toLocaleString("ro-MD")} MDL/buc`)
      .join("\n");
    const message = [
      "Produse comandate:",
      itemsList,
      "",
      `Total: ${subtotal.toLocaleString("ro-MD")} MDL`,
      extra ? `\nMesaj client: ${extra}` : null,
    ]
      .filter((l) => l !== null)
      .join("\n");

    const submitData = new FormData();
    submitData.set("name", name);
    submitData.set("phone", phone);
    submitData.set("message", message);
    submitData.set("source", "Comandă din coș");
    submitData.set("productSlugs", items.map((i) => i.slug).join(","));

    setStatus("pending");
    const result = await submitContactMessageAction({}, submitData);

    if (result.error) {
      setErrorMsg(result.error);
      setStatus("error");
      return;
    }

    setStatus("success");
    clearCart();
  }

  if (status === "success") {
    return (
      <div className="max-w-md mx-auto py-8">
        <SuccessState
          title="Comanda ta a fost trimisă!"
          description="Te vom contacta în cel mai scurt timp pentru confirmare."
        />
        <div className="flex justify-center mt-4">
          <Button asChild variant="primary">
            <Link href="/produse">Continuă cumpărăturile</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-16">
        <ShoppingCart className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" strokeWidth={1.5} aria-hidden />
        <p className="text-muted-foreground mb-6">Coșul tău este gol.</p>
        <Button asChild variant="primary">
          <Link href="/produse">Vezi produsele</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8">
      <form onSubmit={handleSubmit} noValidate className="border border-border rounded-2xl p-6 flex flex-col gap-3.5 h-fit bg-card">
        <h2 className="font-extrabold text-primary text-lg mb-1">Datele tale</h2>

        {status === "error" && (
          <Alert variant="destructive">
            <AlertCircle aria-hidden />
            <AlertDescription>{errorMsg}</AlertDescription>
          </Alert>
        )}

        <Input type="text" name="name" required placeholder="Nume complet" aria-label="Nume complet" />
        <Input type="tel" name="phone" required placeholder="Telefon" aria-label="Telefon" />
        <Textarea name="extraMessage" placeholder="Mesaj suplimentar (opțional)" rows={3} className="min-h-0" aria-label="Mesaj suplimentar" />

        <Button type="submit" variant="accent" disabled={status === "pending"} className="mt-1">
          {status === "pending" ? "Se trimite..." : "Trimite comanda"}
        </Button>
        <p className="text-center text-[11px] text-muted-foreground">
          Te contactăm telefonic pentru confirmare și stabilirea livrării.
        </p>
      </form>

      <div className="border border-border rounded-2xl p-6 h-fit bg-card">
        <h2 className="font-extrabold text-primary mb-4">Sumar comandă</h2>

        <div className="flex flex-col gap-2.5 mb-4 max-h-64 overflow-y-auto pr-1">
          {items.map((item) => (
            <div key={item.slug} className="flex items-center gap-3 p-2.5 border border-border rounded-xl bg-muted">
              <span className="relative w-11 h-11 rounded-lg bg-card overflow-hidden shrink-0 border border-border flex items-center justify-center">
                {item.image ? (
                  <Image src={item.image} alt={item.name} fill className="object-contain p-1" />
                ) : (
                  <ImageOff className="w-5 h-5 text-muted-foreground/40" aria-hidden />
                )}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-primary line-clamp-1">{item.name}</p>
                <p className="text-xs text-muted-foreground">{item.quantity} × {item.price.toLocaleString("ro-MD")} MDL</p>
              </div>
            </div>
          ))}
        </div>

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
        <div className="flex items-center justify-between border-t border-border pt-4">
          <span className="font-bold text-primary">Total</span>
          <span className="font-extrabold text-xl text-primary">{subtotal.toLocaleString("ro-MD")} MDL</span>
        </div>
      </div>
    </div>
  );
}
