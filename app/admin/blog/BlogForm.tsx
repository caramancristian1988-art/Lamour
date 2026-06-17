"use client";

import { useActionState } from "react";
import { AdminInput, AdminTextarea } from "../components/AdminField";
import type { BlogFormState } from "@/lib/adminBlogActions";

interface BlogDefaults {
  id?: string;
  title?: string;
  slug?: string;
  description?: string;
  image?: string | null;
  content?: string | null;
  published?: boolean;
}

const initialState: BlogFormState = {};

export default function BlogForm({
  action,
  defaults,
  submitLabel,
}: {
  action: (prevState: BlogFormState, formData: FormData) => Promise<BlogFormState>;
  defaults?: BlogDefaults;
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="bg-white border border-gray-100 rounded-2xl p-6 flex flex-col gap-4 max-w-2xl">
      {defaults?.id && <input type="hidden" name="id" value={defaults.id} />}

      {state.error && (
        <p className="text-sm text-[#c7092b] bg-[#fdf2f3] border border-[#fbd5d9] rounded-lg px-4 py-2.5">{state.error}</p>
      )}

      <AdminInput label="Titlu" name="title" required defaultValue={defaults?.title} placeholder="5 sfaturi pentru întreținerea aparatului de aer condiționat" />
      <AdminInput label="Slug" name="slug" defaultValue={defaults?.slug} placeholder="se generează automat din titlu dacă e gol" />
      <AdminTextarea label="Descriere scurtă" name="description" defaultValue={defaults?.description} placeholder="Apare în lista de articole și la SEO." rows={2} />
      <AdminInput label="URL imagine principală" name="image" defaultValue={defaults?.image ?? ""} placeholder="/blog/articol-1.jpg" />
      <AdminTextarea label="Conținut" name="content" defaultValue={defaults?.content ?? ""} placeholder="Conținutul complet al articolului..." rows={10} />

      <label className="flex items-center gap-2 text-sm font-bold text-gray-600">
        <input type="checkbox" name="published" defaultChecked={defaults?.published ?? true} className="w-4 h-4 accent-[#c7092b]" />
        Publicat (vizibil pe site)
      </label>

      <button
        type="submit"
        disabled={pending}
        className="self-start bg-[#c7092b] hover:bg-[#a5071f] disabled:opacity-60 text-white font-bold px-6 py-2.5 rounded-xl transition-colors text-sm uppercase tracking-wide mt-2"
      >
        {pending ? "Se salvează..." : submitLabel}
      </button>
    </form>
  );
}
