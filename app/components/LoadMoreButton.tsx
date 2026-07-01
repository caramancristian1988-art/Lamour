"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

interface Props {
  basePath: string;
  page: number;
  sort: string;
  hasMore: boolean;
  extraParams?: Record<string, string>;
}

function buildHref(basePath: string, page: number, sort: string, extraParams: Record<string, string> = {}) {
  const params = new URLSearchParams(extraParams);
  if (sort !== "newest") params.set("sort", sort);
  params.set("page", String(page));
  return `${basePath}?${params.toString()}`;
}

export default function LoadMoreButton({ basePath, page, sort, hasMore, extraParams }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);

  // Reset loading when search params change (navigation completed)
  useEffect(() => {
    setLoading(false);
  }, [searchParams]);

  if (!hasMore) return null;

  function handleClick() {
    setLoading(true);
    router.push(buildHref(basePath, page + 1, sort, extraParams), { scroll: false });
  }

  return (
    <div className="flex justify-center mt-12">
      <button
        onClick={handleClick}
        disabled={loading}
        className="inline-flex items-center gap-2 border-2 border-[#1d2353] text-[#1d2353] hover:bg-[#1d2353] hover:text-white font-bold px-8 py-3 rounded-xl transition-all text-sm uppercase tracking-wide disabled:opacity-70 disabled:cursor-not-allowed"
      >
        {loading ? (
          <>
            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Se încarcă...
          </>
        ) : (
          <>
            Încarcă mai multe
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </>
        )}
      </button>
    </div>
  );
}
