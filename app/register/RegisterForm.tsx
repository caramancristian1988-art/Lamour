"use client";

import { useActionState, useRef } from "react";
import Link from "next/link";
import { registerAction, type AuthFormState } from "@/lib/authActions";

const initialState: AuthFormState = {};

export default function RegisterForm() {
  const [state, formAction, pending] = useActionState(registerAction, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <div className="w-full max-w-sm">
      <nav className="flex items-center gap-1.5 text-xs text-gray-400 mb-6 justify-center">
        <Link href="/admin" className="hover:text-[#c7092b] transition-colors">Admin</Link>
        <span>›</span>
        <span className="text-gray-600">Cont nou</span>
      </nav>

      <h1 className="text-2xl font-extrabold text-[#1d2353] text-center mb-1">
        Creează un <span className="text-[#c7092b]">cont nou</span>
      </h1>
      <p className="text-sm text-gray-500 text-center mb-8">
        Doar administratorii pot crea conturi. Persoana va folosi emailul și parola de mai jos ca să se conecteze.
      </p>

      {state.success && (
        <p className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-4 py-2.5 mb-4">
          Cont creat cu succes!
        </p>
      )}

      <form ref={formRef} action={formAction} key={state.success ? "done" : "form"} className="flex flex-col gap-4">
        {state.error && (
          <p className="text-sm text-[#c7092b] bg-[#fdf2f3] border border-[#fbd5d9] rounded-lg px-4 py-2.5">
            {state.error}
          </p>
        )}

        <input
          type="text"
          name="name"
          required
          placeholder="Nume complet"
          className="border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#c7092b] placeholder:text-gray-400"
        />
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
          minLength={6}
          placeholder="Parolă (minim 6 caractere)"
          className="border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#c7092b] placeholder:text-gray-400"
        />
        <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
          <input type="checkbox" name="isAdmin" className="w-4 h-4 rounded border-gray-300 text-[#c7092b] focus:ring-[#c7092b] accent-[#c7092b]" />
          Acordă drepturi de administrator
        </label>

        <button
          type="submit"
          disabled={pending}
          className="bg-[#c7092b] hover:bg-[#a5071f] disabled:opacity-60 text-white font-bold py-3 rounded-xl transition-colors text-sm uppercase tracking-wide"
        >
          {pending ? "Se creează contul..." : "Creează cont"}
        </button>
      </form>
    </div>
  );
}
