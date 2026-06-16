import Link from "next/link";

interface Props {
  basePath: string;
  page: number;
  totalPages: number;
  sort: string;
}

function buildHref(basePath: string, page: number, sort: string) {
  const params = new URLSearchParams();
  if (sort !== "newest") params.set("sort", sort);
  if (page > 1) params.set("page", String(page));
  const qs = params.toString();
  return qs ? `${basePath}?${qs}` : basePath;
}

export default function ProductPagination({ basePath, page, totalPages, sort }: Props) {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div className="flex items-center justify-center gap-1 mt-12">
      <Link
        href={buildHref(basePath, Math.max(1, page - 1), sort)}
        aria-disabled={page === 1}
        className={`w-9 h-9 flex items-center justify-center rounded-lg transition-colors ${
          page === 1 ? "text-gray-300 pointer-events-none" : "text-gray-400 hover:bg-gray-100"
        }`}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
      </Link>
      {pages.map((p) => (
        <Link
          key={p}
          href={buildHref(basePath, p, sort)}
          className={`w-9 h-9 flex items-center justify-center rounded-lg text-sm font-bold transition-colors ${
            p === page ? "bg-[#1d2353] text-white" : "text-gray-500 hover:bg-gray-100"
          }`}
        >
          {p}
        </Link>
      ))}
      <Link
        href={buildHref(basePath, Math.min(totalPages, page + 1), sort)}
        aria-disabled={page === totalPages}
        className={`w-9 h-9 flex items-center justify-center rounded-lg transition-colors ${
          page === totalPages ? "text-gray-300 pointer-events-none" : "text-gray-400 hover:bg-gray-100"
        }`}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </Link>
    </div>
  );
}
