"use client";

import { useActionState, useEffect, useState } from "react";
import { submitReviewAction, type ReviewFormState } from "@/lib/reviewActions";
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from "@/app/components/ui/dialog";
import { Input } from "@/app/components/ui/input";
import { Textarea } from "@/app/components/ui/textarea";
import { Button } from "@/app/components/ui/button";
import { Alert, AlertDescription } from "@/app/components/ui/alert";
import { StarRating } from "@/app/components/ui/star-rating";
import { SuccessState } from "@/app/components/ui/success-state";
import { AlertCircle } from "lucide-react";

const initialState: ReviewFormState = {};

function ReviewFormPanel({
  productSlug,
  productName,
  onSuccess,
}: {
  productSlug: string;
  productName: string;
  onSuccess: () => void;
}) {
  const [rating, setRating] = useState(0);
  const [state, formAction, pending] = useActionState(submitReviewAction, initialState);

  useEffect(() => {
    if (state.success) {
      const timeout = setTimeout(onSuccess, 2200);
      return () => clearTimeout(timeout);
    }
  }, [state.success, onSuccess]);

  if (state.success) {
    return (
      <SuccessState
        title="Recenzia ta a fost trimisă!"
        description="Va fi afișată pe pagina produsului după ce este verificată."
      />
    );
  }

  return (
    <>
      <h2 className="text-xl font-bold text-primary text-center">Recenzii</h2>

      <form action={formAction} className="flex flex-col gap-4 mt-2">
        <input type="hidden" name="productSlug" value={productSlug} />
        <input type="hidden" name="productName" value={productName} />
        <input type="hidden" name="rating" value={rating} />

        <StarRating rating={rating} interactive onChange={setRating} size={30} className="justify-center" />

        {state.error && (
          <Alert variant="destructive">
            <AlertCircle aria-hidden />
            <AlertDescription>{state.error}</AlertDescription>
          </Alert>
        )}

        <Input name="name" required placeholder="Nume/Prenume" aria-label="Nume/Prenume" />
        <Input type="email" name="email" placeholder="Email" aria-label="Email" />
        <Textarea name="pros" placeholder="Plusuri" rows={2} className="min-h-0" aria-label="Plusuri" />
        <Textarea name="cons" placeholder="Minusuri" rows={2} className="min-h-0" aria-label="Minusuri" />
        <Textarea name="text" required placeholder="Comentariu" rows={3} className="min-h-0" aria-label="Comentariu" />

        <Button type="submit" variant="accent" disabled={pending} className="mt-1">
          {pending ? "Se trimite..." : "Trimite"}
        </Button>
      </form>
    </>
  );
}

export default function WriteReviewModal({
  productSlug,
  productName,
  className,
  children,
}: {
  productSlug: string;
  productName: string;
  className?: string;
  children?: React.ReactNode;
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
            "bg-primary hover:bg-brand-maroon-dark text-white font-bold text-sm px-5 py-3 rounded-xl transition-colors uppercase tracking-wide"
          }
        >
          {children ?? "Scrie o recenzie"}
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogTitle className="sr-only">Recenzii produs</DialogTitle>
        <ReviewFormPanel key={openCount} productSlug={productSlug} productName={productName} onSuccess={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}
