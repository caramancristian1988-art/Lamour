"use client";

import { useActionState, useEffect } from "react";
import { useAuthModal } from "./AuthModalProvider";
import { loginAction, type AuthFormState } from "@/lib/authActions";

const initialState: AuthFormState = {};

export default function AuthModal() {
  const { mode, close } = useAuthModal();

  useEffect(() => {
    if (!mode) return;
    document.body.style.overflow = "hidden";
    function onEscape(e: KeyboardEvent) {
      if (e.key === "Escape") close();
    }
    document.addEventListener("keydown", onEscape);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", onEscape);
    };
  }, [mode, close]);

  if (!mode) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60" onClick={close} aria-hidden />

      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-8">
        <button
          onClick={close}
          aria-label="Închide"
          className="absolute top-4 right-4 text-gray-400 hover:text-[#c7092b] transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <LoginFields />
      </div>
    </div>
  );
}

function LoginFields() {
  const [state, formAction, pending] = useActionState(loginAction, initialState);

  return (
    <>
      <h2 className="text-xl font-extrabold text-[#1d2353] text-center mb-6">Intră în cont</h2>
      <form action={formAction} className="flex flex-col gap-3">
        {state.error && (
          <p className="text-sm text-[#c7092b] bg-[#fdf2f3] border border-[#fbd5d9] rounded-lg px-4 py-2.5">
            {state.error}
          </p>
        )}
        <input
          type="email"
          name="email"
          required
          placeholder="Email"
          className="border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#c7092b] placeholder:text-gray-400"
        />
        <input
          type="password"
          name="password"
          required
          placeholder="Parolă"
          className="border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#c7092b] placeholder:text-gray-400"
        />
        <button
          type="submit"
          disabled={pending}
          className="bg-[#c7092b] hover:bg-[#a5071f] disabled:opacity-60 text-white font-bold py-3 rounded-xl transition-colors text-sm uppercase tracking-wide mt-2"
        >
          {pending ? "Se conectează..." : "Conectează-te"}
        </button>
      </form>
    </>
  );
}
