"use client";

import { useEffect, useState } from "react";

// Sesiunea de editare comandă (pornită din /editare-comanda) — stocată în
// localStorage ca CheckoutPanel să persiste peste reload-uri, dar cu un
// eveniment custom pe deasupra, ca alte componente deja montate în layout
// (ex: EditSessionBanner) să afle imediat când sesiunea apare/dispare, fără
// remount — o simplă citire în useEffect la montare nu ar prinde-o, pentru
// că EditSessionHydrator o setează DUPĂ ce layout-ul e deja montat.
export interface OrderEditSession {
  messageId: string;
  editToken: string;
  name: string;
  phone: string;
  email: string;
  locality: string;
  address: string;
  zip: string;
}

export const ORDER_EDIT_SESSION_KEY = "order-edit-session";
const EVENT_NAME = "order-edit-session-changed";

export function getOrderEditSession(): OrderEditSession | null {
  try {
    const raw = window.localStorage.getItem(ORDER_EDIT_SESSION_KEY);
    return raw ? (JSON.parse(raw) as OrderEditSession) : null;
  } catch {
    return null;
  }
}

export function setOrderEditSession(session: OrderEditSession) {
  window.localStorage.setItem(ORDER_EDIT_SESSION_KEY, JSON.stringify(session));
  window.dispatchEvent(new Event(EVENT_NAME));
}

export function clearOrderEditSession() {
  window.localStorage.removeItem(ORDER_EDIT_SESSION_KEY);
  window.dispatchEvent(new Event(EVENT_NAME));
}

export function subscribeOrderEditSession(callback: () => void): () => void {
  window.addEventListener(EVENT_NAME, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(EVENT_NAME, callback);
    window.removeEventListener("storage", callback);
  };
}

export function useOrderEditSession(): OrderEditSession | null {
  const [session, setSession] = useState<OrderEditSession | null>(null);

  useEffect(() => {
    setSession(getOrderEditSession());
    return subscribeOrderEditSession(() => setSession(getOrderEditSession()));
  }, []);

  return session;
}
