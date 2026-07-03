import * as React from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/app/components/ui/button";

function Pagination({ className, ...props }: React.ComponentProps<"nav">) {
  return (
    <nav
      role="navigation"
      aria-label="Paginare"
      className={cn("mx-auto flex w-full justify-center", className)}
      {...props}
    />
  );
}

function PaginationContent({ className, ...props }: React.ComponentProps<"ul">) {
  return <ul className={cn("flex flex-row items-center gap-1.5", className)} {...props} />;
}

function PaginationItem(props: React.ComponentProps<"li">) {
  return <li {...props} />;
}

interface PaginationLinkProps extends React.ComponentProps<typeof Link> {
  isActive?: boolean;
  size?: "default" | "icon";
}

function PaginationLink({ className, isActive, size = "icon", ...props }: PaginationLinkProps) {
  return (
    <Link
      aria-current={isActive ? "page" : undefined}
      className={cn(
        buttonVariants({
          variant: isActive ? "accent" : "ghost",
          size,
        }),
        "border border-border",
        className
      )}
      {...props}
    />
  );
}

function PaginationPrevious({ className, ...props }: React.ComponentProps<typeof Link>) {
  return (
    <PaginationLink aria-label="Pagina anterioară" size="default" className={cn("gap-1.5 pl-3", className)} {...props}>
      <ChevronLeft className="h-4 w-4" />
      <span>Anterior</span>
    </PaginationLink>
  );
}

function PaginationNext({ className, ...props }: React.ComponentProps<typeof Link>) {
  return (
    <PaginationLink aria-label="Pagina următoare" size="default" className={cn("gap-1.5 pr-3", className)} {...props}>
      <span>Următor</span>
      <ChevronRight className="h-4 w-4" />
    </PaginationLink>
  );
}

function PaginationEllipsis({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span aria-hidden className={cn("flex h-10 w-10 items-center justify-center text-muted-foreground", className)} {...props}>
      <MoreHorizontal className="h-4 w-4" />
      <span className="sr-only">Mai multe pagini</span>
    </span>
  );
}

export {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
};
