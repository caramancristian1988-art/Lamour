"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { usePathname } from "next/navigation";

interface AuthContextValue {
  isLoggedIn: boolean;
}

const AuthContext = createContext<AuthContextValue>({ isLoggedIn: false });

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    fetch("/api/session")
      .then((res) => res.json())
      .then((data) => setIsLoggedIn(Boolean(data.isLoggedIn)))
      .catch(() => setIsLoggedIn(false));
  }, [pathname]);

  return <AuthContext.Provider value={{ isLoggedIn }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
