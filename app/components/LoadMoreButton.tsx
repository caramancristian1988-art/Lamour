import Link from "next/link";

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
  if (!hasMore) return null;

  return (
    <div className="flex justify-center mt-12">
      <Link
        href={buildHref(basePath, page + 1, sort, extraParams)}
        scroll={false}
        className="inline-flex items-center gap-2 border-2 border-[#1d2353] text-[#1d2353] hover:bg-[#1d2353] hover:text-white font-bold px-8 py-3 rounded-xl transition-all text-sm uppercase tracking-wide"
      >
        Încarcă mai multe
      </Link>
    </div>
  );
}
