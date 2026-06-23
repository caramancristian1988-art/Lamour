"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";

export default function AdminPagination({ page, totalPages }: { page: number; totalPages: number }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  if (totalPages <= 1) return null;

  function goToPage(target: number) {
    const params = new URLSearchParams(searchParams.toString());
    if (target <= 1) params.delete("page");
    else params.set("page", String(target));
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  }

  return (
    <div className="flex items-center justify-between mt-4">
      <button
        type="button"
        onClick={() => goToPage(page - 1)}
        disabled={page <= 1}
        className="text-xs font-bold text-[#1d2353] border border-gray-200 rounded-lg px-4 py-2 hover:bg-gray-50 disabled:opacity-40 disabled:hover:bg-transparent transition-colors"
      >
        ← Anterior
      </button>
      <span className="text-xs text-gray-400">
        Pagina {page} din {totalPages}
      </span>
      <button
        type="button"
        onClick={() => goToPage(page + 1)}
        disabled={page >= totalPages}
        className="text-xs font-bold text-[#1d2353] border border-gray-200 rounded-lg px-4 py-2 hover:bg-gray-50 disabled:opacity-40 disabled:hover:bg-transparent transition-colors"
      >
        Următor →
      </button>
    </div>
  );
}
