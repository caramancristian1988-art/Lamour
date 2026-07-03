"use client";

import { useActionState, useEffect, useState } from "react";
import Image from "next/image";
import { ImageOff, AlertCircle } from "lucide-react";
import { submitContactMessageAction, type ContactFormState } from "@/lib/adminMessageActions";
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from "@/app/components/ui/dialog";
import { Input } from "@/app/components/ui/input";
import { Textarea } from "@/app/components/ui/textarea";
import { Button } from "@/app/components/ui/button";
import { Alert, AlertDescription } from "@/app/components/ui/alert";
import { SuccessState } from "@/app/components/ui/success-state";

const initialState: ContactFormState = {};

function OfferFormPanel({
  productId,
  productName,
  productImage,
  title,
  sourceLabel,
  onSuccess,
}: {
  productId: string;
  productName: string;
  productImage: string | null;
  title: string;
  sourceLabel: string;
  onSuccess: () => void;
}) {
  const [state, formAction, pending] = useActionState(submitContactMessageAction, initialState);

  useEffect(() => {
    if (state.success) {
      const timeout = setTimeout(onSuccess, 2200);
      return () => clearTimeout(timeout);
    }
  }, [state.success, onSuccess]);

  if (state.success) {
    return <SuccessState title="Cererea ta a fost trimisă!" description="Te vom contacta în cel mai scurt timp." />;
  }

  return (
    <>
      <h2 className="text-xl font-bold text-primary text-center">{title}</h2>

      <div className="flex items-center gap-3 my-5 p-3 border border-border rounded-xl bg-muted">
        <span className="relative w-14 h-14 rounded-lg bg-card overflow-hidden shrink-0 border border-border flex items-center justify-center">
          {productImage ? (
            <Image src={productImage} alt={productName} fill className="object-contain p-1" />
          ) : (
            <ImageOff className="w-6 h-6 text-muted-foreground" aria-hidden />
          )}
        </span>
        <p className="text-sm font-bold text-primary line-clamp-2">{productName}</p>
      </div>

      <form action={formAction} className="flex flex-col gap-4">
        <input type="hidden" name="source" value={`${sourceLabel} – ${productName}`} />
        <input type="hidden" name="productId" value={productId} />

        {state.error && (
          <Alert variant="destructive">
            <AlertCircle aria-hidden />
            <AlertDescription>{state.error}</AlertDescription>
          </Alert>
        )}

        <Input name="name" required placeholder="Nume complet" aria-label="Nume complet" />
        <Input type="tel" name="phone" required placeholder="Telefon" aria-label="Telefon" />
        <Input type="email" name="email" placeholder="Email (opțional)" aria-label="Email" />
        <Textarea name="message" placeholder="Mesaj suplimentar (opțional)" rows={3} className="min-h-0" aria-label="Mesaj suplimentar" />

        <Button type="submit" variant="accent" disabled={pending} className="mt-1">
          {pending ? "Se trimite..." : "Trimite"}
        </Button>
      </form>
    </>
  );
}

export default function ProductOfferModal({
  productId,
  productName,
  productImage,
  className,
  children,
  title = "Cere consultație",
  sourceLabel = "Cere consultație",
}: {
  productId: string;
  productName: string;
  productImage: string | null;
  className?: string;
  children?: React.ReactNode;
  title?: string;
  sourceLabel?: string;
}) {
  const [open, setOpen] = useState(false);
  const [openCount, setOpenCount] = useState(0);

  function handleOpenChange(next: boolean) {
    if (next) setOpenCount((c) => c + 1);
    setOpen(next);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <button
          className={
            className ??
            "w-full h-12 flex items-center justify-center border-2 border-primary text-primary hover:bg-primary hover:text-white font-bold rounded-xl transition-all text-sm uppercase tracking-wide"
          }
        >
          {children ?? "Cere consultație"}
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogTitle className="sr-only">{title}</DialogTitle>
        <OfferFormPanel
          key={openCount}
          productId={productId}
          productName={productName}
          productImage={productImage}
          title={title}
          sourceLabel={sourceLabel}
          onSuccess={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
