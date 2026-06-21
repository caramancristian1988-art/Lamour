"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

export default function HomeLink({ className, children }: { className?: string; children: ReactNode }) {
  const pathname = usePathname();

  return (
    <Link
      href="/"
      className={className}
      onClick={(e) => {
        if (pathname === "/") {
          e.preventDefault();
          window.scrollTo({ top: 0, behavior: "smooth" });
        }
      }}
    >
      {children}
    </Link>
  );
}
