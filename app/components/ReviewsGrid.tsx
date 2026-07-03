"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import WriteReviewModal from "./WriteReviewModal";
import { StarRating } from "@/app/components/ui/star-rating";
import { Avatar, AvatarFallback } from "@/app/components/ui/avatar";
import { Button } from "@/app/components/ui/button";

const PAGE_SIZE = 3;

interface Review {
  id: string;
  name: string;
  rating: number;
  text: string;
  pros?: string | null;
  cons?: string | null;
  product: string | null;
}

function getInitials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}

function WriteReviewCard({ productSlug, productName }: { productSlug: string; productName: string }) {
  return (
    <WriteReviewModal
      productSlug={productSlug}
      productName={productName}
      className="group flex flex-col items-center justify-center gap-3 bg-card border-2 border-dashed border-border rounded-2xl p-6 text-center hover:border-accent hover:bg-muted transition-colors min-h-[160px]"
    >
      <span className="w-11 h-11 rounded-full bg-muted text-accent flex items-center justify-center transition-transform group-hover:scale-110">
        <Plus className="w-5 h-5" strokeWidth={2.5} aria-hidden />
      </span>
      <span className="text-sm font-bold text-primary group-hover:text-accent transition-colors">Scrie o recenzie</span>
      <span className="text-xs text-muted-foreground">Spune-ne ce părere ai despre acest produs</span>
    </WriteReviewModal>
  );
}

export default function ReviewsGrid({
  reviews,
  productSlug,
  productName,
}: {
  reviews: Review[];
  productSlug: string;
  productName: string;
}) {
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  if (reviews.length === 0) {
    return (
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <div className="sm:col-span-2 lg:col-span-3 -mb-1">
          <p className="text-muted-foreground text-sm">Nu există încă recenzii pentru acest produs. Fii primul!</p>
        </div>
        <WriteReviewCard productSlug={productSlug} productName={productName} />
      </div>
    );
  }

  const visibleReviews = reviews.slice(0, visibleCount);
  const hasMore = visibleCount < reviews.length;

  return (
    <>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {visibleReviews.map((review) => (
          <div key={review.id} className="bg-card border border-border rounded-2xl p-6 flex flex-col">
            <StarRating rating={review.rating} />
            <p className="text-sm text-muted-foreground mt-3 leading-relaxed flex-1">&ldquo;{review.text}&rdquo;</p>
            {review.pros && (
              <p className="text-xs text-success mt-2"><span className="font-bold">Plusuri:</span> {review.pros}</p>
            )}
            {review.cons && (
              <p className="text-xs text-accent mt-1"><span className="font-bold">Minusuri:</span> {review.cons}</p>
            )}
            <div className="flex items-center gap-3 mt-4 pt-4 border-t border-border">
              <Avatar className="w-9 h-9">
                <AvatarFallback className="bg-primary text-primary-foreground text-xs">{getInitials(review.name)}</AvatarFallback>
              </Avatar>
              <div className="text-sm font-bold text-foreground">{review.name}</div>
            </div>
          </div>
        ))}

        <WriteReviewCard productSlug={productSlug} productName={productName} />
      </div>

      {(hasMore || visibleCount > PAGE_SIZE) && (
        <div className="flex justify-center gap-3 mt-6">
          {hasMore && (
            <Button onClick={() => setVisibleCount(reviews.length)} variant="outline" size="sm">
              Mai multe recenzii
            </Button>
          )}
          {visibleCount > PAGE_SIZE && (
            <Button onClick={() => setVisibleCount(PAGE_SIZE)} variant="ghost" size="sm">
              Mai puține recenzii
            </Button>
          )}
        </div>
      )}
    </>
  );
}
