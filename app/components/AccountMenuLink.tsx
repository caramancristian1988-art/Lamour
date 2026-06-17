"use client";

import Link from "next/link";
import { useAuth } from "./AuthProvider";
import { useAuthModal } from "./AuthModalProvider";

export default function AccountMenuLink({ className, children }: { className: string; children: React.ReactNode }) {
  const { isLoggedIn } = useAuth();
  const { openLogin } = useAuthModal();

  if (isLoggedIn) {
    return (
      <Link href="/cont" className={className} aria-label="Contul meu">
        {children}
      </Link>
    );
  }

  return (
    <button onClick={openLogin} className={className} aria-label="Contul meu">
      {children}
    </button>
  );
}
