"use client";

import { useActionState } from "react";
import Link from "next/link";
import { loginAction, type AuthFormState } from "@/lib/authActions";

const initialState: AuthFormState = {};

export default function LoginForm() {
  const [state, formAction, pending] = useActionState(loginAction, initialState);

  return (
    <div className="w-full max-w-sm">
      <nav className="flex items-center gap-1.5 text-xs text-gray-400 mb-6 justify-center">
        <Link href="/" className="hover:text-[#c7092b] transition-colors">Acasă</Link>
        <span>›</span>
        <span className="text-gray-600">Autentificare</span>
      </nav>

      <h1 className="text-2xl font-extrabold text-[#1d2353] text-center mb-1">
        Conectează-te la <span className="text-[#c7092b]">contul tău</span>
      </h1>
      <p className="text-sm text-gray-500 text-center mb-8">
        Conturile sunt create de un administrator.
      </p>

      <form action={formAction} className="flex flex-col gap-4">
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
          className="bg-[#c7092b] hover:bg-[#a5071f] disabled:opacity-60 text-white font-bold py-3 rounded-xl transition-colors text-sm uppercase tracking-wide"
        >
          {pending ? "Se conectează..." : "Conectează-te"}
        </button>
      </form>
    </div>
  );
}
