"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { usePathname } from "next/navigation";

type AuthModalMode = "login" | "register" | null;

interface AuthModalContextValue {
  mode: AuthModalMode;
  openLogin: () => void;
  openRegister: () => void;
  close: () => void;
}

const AuthModalContext = createContext<AuthModalContextValue | null>(null);

export function AuthModalProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<AuthModalMode>(null);
  const pathname = usePathname();

  useEffect(() => {
    setMode(null);
  }, [pathname]);

  return (
    <AuthModalContext.Provider
      value={{
        mode,
        openLogin: () => setMode("login"),
        openRegister: () => setMode("register"),
        close: () => setMode(null),
      }}
    >
      {children}
    </AuthModalContext.Provider>
  );
}

export function useAuthModal() {
  const ctx = useContext(AuthModalContext);
  if (!ctx) throw new Error("useAuthModal must be used within an AuthModalProvider");
  return ctx;
}
