"use client";

import { createContext, useContext, useEffect, useState } from "react";

interface AccessibilityContextValue {
  enabled: boolean;
  toggle: () => void;
}

const AccessibilityContext = createContext<AccessibilityContextValue | null>(null);

const STORAGE_KEY = "site-a11y-mode";

export function AccessibilityProvider({ children }: { children: React.ReactNode }) {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === "1") setEnabled(true);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("a11y-mode", enabled);
  }, [enabled]);

  function toggle() {
    setEnabled((prev) => {
      const next = !prev;
      window.localStorage.setItem(STORAGE_KEY, next ? "1" : "0");
      return next;
    });
  }

  return <AccessibilityContext.Provider value={{ enabled, toggle }}>{children}</AccessibilityContext.Provider>;
}

export function useAccessibility() {
  const ctx = useContext(AccessibilityContext);
  if (!ctx) throw new Error("useAccessibility must be used within an AccessibilityProvider");
  return ctx;
}
