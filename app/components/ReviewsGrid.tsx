"use client";

import { useState } from "react";
import WriteReviewModal from "./WriteReviewModal";

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

function StarRating({ rating, size = "w-4 h-4" }: { rating: number; size?: string }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          className={`${size} ${star <= Math.round(rating) ? "text-amber-400" : "text-gray-200"}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

function getInitials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}

function WriteReviewCard({ productSlug, productName }: { productSlug: string; productName: string }) {
  return (
    <WriteReviewModal
      productSlug={productSlug}
      productName={productName}
      className="group flex flex-col items-center justify-center gap-3 bg-white border-2 border-dashed border-gray-200 rounded-2xl p-6 text-center hover:border-[#c7092b] hover:bg-[#fdf2f3] transition-colors min-h-[160px]"
    >
      <span className="w-11 h-11 rounded-full bg-[#fdf2f3] text-[#c7092b] flex items-center justify-center transition-transform group-hover:scale-110">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
        </svg>
      </span>
      <span className="text-sm font-bold text-[#1d2353] group-hover:text-[#c7092b] transition-colors">Scrie o recenzie</span>
      <span className="text-xs text-gray-400">Spune-ne ce părere ai despre acest produs</span>
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
          <p className="text-gray-500 text-sm">Nu există încă recenzii pentru acest produs. Fii primul!</p>
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
          <div key={review.id} className="bg-white border border-gray-100 rounded-2xl p-6 flex flex-col">
            <StarRating rating={review.rating} size="w-4 h-4" />
            <p className="text-sm text-gray-600 mt-3 leading-relaxed">&ldquo;{review.text}&rdquo;</p>
            {review.pros && (
              <p className="text-xs text-green-700 mt-2"><span className="font-bold">Plusuri:</span> {review.pros}</p>
            )}
            {review.cons && (
              <p className="text-xs text-[#c7092b] mt-1"><span className="font-bold">Minusuri:</span> {review.cons}</p>
            )}
            <div className="flex-1" />
            <div className="flex items-center gap-3 mt-4 pt-4 border-t border-gray-100">
              <div className="w-9 h-9 bg-[#1d2353] rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0">
                {getInitials(review.name)}
              </div>
              <div className="text-sm font-bold text-[#111827]">{review.name}</div>
            </div>
          </div>
        ))}

        <WriteReviewCard productSlug={productSlug} productName={productName} />
      </div>

      {(hasMore || visibleCount > PAGE_SIZE) && (
        <div className="flex justify-center gap-3 mt-6">
          {hasMore && (
            <button
              onClick={() => setVisibleCount(reviews.length)}
              className="bg-white border border-gray-200 hover:border-[#c7092b] hover:text-[#c7092b] text-[#1d2353] font-bold px-6 py-3 rounded-xl transition-colors text-sm uppercase tracking-wide"
            >
              Mai multe recenzii
            </button>
          )}
          {visibleCount > PAGE_SIZE && (
            <button
              onClick={() => setVisibleCount(PAGE_SIZE)}
              className="text-gray-400 hover:text-[#c7092b] font-bold px-6 py-3 rounded-xl transition-colors text-sm uppercase tracking-wide"
            >
              Mai puține recenzii
            </button>
          )}
        </div>
      )}
    </>
  );
}
