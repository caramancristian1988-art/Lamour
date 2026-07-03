"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronDown, Loader2 } from "lucide-react";
import { Button } from "@/app/components/ui/button";

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
      <Button onClick={handleClick} disabled={loading} variant="outline" size="lg">
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" aria-hidden />
            Se încarcă...
          </>
        ) : (
          <>
            Încarcă mai multe
            <ChevronDown className="w-4 h-4" aria-hidden />
          </>
        )}
      </Button>
    </div>
  );
}
