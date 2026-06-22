"use client";

import { createContext, useContext, useState } from "react";

interface FloatingUIValue {
  contactMenuOpen: boolean;
  setContactMenuOpen: (open: boolean) => void;
}

const FloatingUIContext = createContext<FloatingUIValue | null>(null);

export function FloatingUIProvider({ children }: { children: React.ReactNode }) {
  const [contactMenuOpen, setContactMenuOpen] = useState(false);
  return (
    <FloatingUIContext.Provider value={{ contactMenuOpen, setContactMenuOpen }}>
      {children}
    </FloatingUIContext.Provider>
  );
}

export function useFloatingUI() {
  const ctx = useContext(FloatingUIContext);
  if (!ctx) throw new Error("useFloatingUI must be used within a FloatingUIProvider");
  return ctx;
}
