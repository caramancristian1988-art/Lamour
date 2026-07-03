"use client";

import { usePathname, useSearchParams } from "next/navigation";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationPrevious,
  PaginationNext,
} from "@/app/components/ui/pagination";

export default function AdminPagination({ page, totalPages }: { page: number; totalPages: number }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  if (totalPages <= 1) return null;

  function hrefForPage(target: number) {
    const params = new URLSearchParams(searchParams.toString());
    if (target <= 1) params.delete("page");
    else params.set("page", String(target));
    const query = params.toString();
    return query ? `${pathname}?${query}` : pathname;
  }

  return (
    <div className="flex items-center justify-between mt-4 gap-4 flex-wrap">
      <Pagination className="mx-0 w-auto">
        <PaginationContent>
          <PaginationItem>
            {page <= 1 ? (
              <span className="inline-flex items-center gap-1.5 pl-3 h-10 px-4 text-sm font-semibold text-muted-foreground opacity-40 rounded-xl border border-border">
                Anterior
              </span>
            ) : (
              <PaginationPrevious href={hrefForPage(page - 1)} scroll={false} />
            )}
          </PaginationItem>
        </PaginationContent>
      </Pagination>

      <span className="text-sm text-muted-foreground">
        Pagina {page} din {totalPages}
      </span>

      <Pagination className="mx-0 w-auto">
        <PaginationContent>
          <PaginationItem>
            {page >= totalPages ? (
              <span className="inline-flex items-center gap-1.5 pr-3 h-10 px-4 text-sm font-semibold text-muted-foreground opacity-40 rounded-xl border border-border">
                Următor
              </span>
            ) : (
              <PaginationNext href={hrefForPage(page + 1)} scroll={false} />
            )}
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}
