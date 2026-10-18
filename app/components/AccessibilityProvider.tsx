"use client";

import { createContext, useCallback, useContext, useMemo, useSyncExternalStore } from "react";
import {
  A11Y_DEFAULTS,
  A11Y_STORAGE_KEY,
  applyToDocument,
  isActive,
  readStored,
  writeStored,
  type A11ySettings,
} from "@/lib/a11y";

// Magazin extern (useSyncExternalStore): starea se citește o singură dată din localStorage, la prima cerere din browser, se aplică
// pe <html> și se sincronizează între filele deschise. Pe server (și la hidratare) valoarea e cea implicită, deci nu apar nepotriviri;
// scriptul din <head> (A11Y_BOOT_SCRIPT) aplică deja clasele înainte de prima afișare.
let current: A11ySettings = A11Y_DEFAULTS;
let loaded = false;
const listeners = new Set<() => void>();

function ensureLoaded(): void {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  current = readStored();
}

function getSnapshot(): A11ySettings {
  ensureLoaded();
  return current;
}

function getServerSnapshot(): A11ySettings {
  return A11Y_DEFAULTS;
}

function emit(): void {
  applyToDocument(current);
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void): () => void {
  ensureLoaded();
  listeners.add(listener);
  applyToDocument(current);
  const onStorage = (e: StorageEvent) => {
    if (e.key !== null && e.key !== A11Y_STORAGE_KEY) return;
    current = readStored();
    emit();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

function set(next: A11ySettings): void {
  current = next;
  writeStored(next);
  emit();
}

interface AccessibilityContextValue {
  settings: A11ySettings;
  /** Cel puțin o setare diferă de cea implicită. */
  active: boolean;
  update: (patch: Partial<A11ySettings>) => void;
  reset: () => void;
}

const AccessibilityContext = createContext<AccessibilityContextValue | null>(null);

export function AccessibilityProvider({ children }: { children: React.ReactNode }) {
  const settings = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const update = useCallback((patch: Partial<A11ySettings>) => set({ ...current, ...patch }), []);
  const reset = useCallback(() => set({ ...A11Y_DEFAULTS }), []);
  const value = useMemo(() => ({ settings, active: isActive(settings), update, reset }), [settings, update, reset]);

  return <AccessibilityContext.Provider value={value}>{children}</AccessibilityContext.Provider>;
}

export function useAccessibility() {
  const ctx = useContext(AccessibilityContext);
  if (!ctx) throw new Error("useAccessibility must be used within an AccessibilityProvider");
  return ctx;
}
