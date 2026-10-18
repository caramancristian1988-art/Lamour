"use client";

import { createContext, useContext, useEffect, useState } from "react";

interface AuthContextValue {
  isLoggedIn: boolean;
}

const AuthContext = createContext<AuthContextValue>({ isLoggedIn: false });

// Fiecare apel la /api/session e o invocare de funcție (Fluid CPU). Înainte se făcea la FIECARE pagină, pentru FIECARE vizitator.
// Acum: o singură dată pe încărcare de pagină, și doar dacă există semnul „logged_in” (pus la autentificare). Pentru conturile
// create înainte de acest semn, o singură verificare pe sesiune de browser (sessionStorage) le recunoaște și le marchează.
const LOGGED_IN_COOKIE = "logged_in";
const CHECKED_KEY = "session-checked";

function hasLoggedInFlag(): boolean {
  return document.cookie.split("; ").some((c) => c === `${LOGGED_IN_COOKIE}=1`);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    let alreadyChecked = false;
    try {
      alreadyChecked = sessionStorage.getItem(CHECKED_KEY) === "1";
    } catch {
      // sessionStorage blocat: facem verificarea o dată pe încărcare
    }
    if (!hasLoggedInFlag() && alreadyChecked) return;

    fetch("/api/session")
      .then((res) => res.json())
      .then((data) => {
        setIsLoggedIn(Boolean(data.isLoggedIn));
        try {
          sessionStorage.setItem(CHECKED_KEY, "1");
        } catch {
          // ignorat
        }
      })
      .catch(() => setIsLoggedIn(false));
  }, []);

  return <AuthContext.Provider value={{ isLoggedIn }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
