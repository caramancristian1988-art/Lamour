"use client";

import { useActionState } from "react";
import { AdminInput, AdminTextarea, AdminSelect } from "../components/AdminField";
import ImageUploadField from "../components/ImageUploadField";
import { Alert, AlertDescription } from "@/app/components/ui/alert";
import { Checkbox } from "@/app/components/ui/checkbox";
import { Label } from "@/app/components/ui/label";
import { Button } from "@/app/components/ui/button";
import type { BlogFormState } from "@/lib/adminBlogActions";

interface BlogDefaults {
  id?: string;
  title?: string;
  slug?: string;
  description?: string;
  image?: string | null;
  content?: string | null;
  category?: string | null;
  published?: boolean;
}

const BLOG_CATEGORIES = ["Ghiduri", "Sfaturi", "Întreținere", "Tehnologie", "Noutăți"];

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
    <form action={formAction} className="bg-card border border-border rounded-2xl p-6 flex flex-col gap-4 max-w-2xl">
      {defaults?.id && <input type="hidden" name="id" value={defaults.id} />}

      {state.error && (
        <Alert variant="destructive">
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      )}

      <AdminInput label="Titlu" name="title" required defaultValue={defaults?.title} placeholder="5 sfaturi pentru întreținerea aparatului de aer condiționat" />
      <AdminInput label="Slug" name="slug" defaultValue={defaults?.slug} placeholder="se generează automat din titlu dacă e gol" />
      <AdminTextarea label="Descriere scurtă" name="description" defaultValue={defaults?.description} placeholder="Apare în lista de articole și la SEO." rows={2} />

      <AdminSelect label="Categorie" name="category" defaultValue={defaults?.category ?? ""}>
        <option value="">—</option>
        {BLOG_CATEGORIES.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </AdminSelect>

      <ImageUploadField name="image" label="Imagine principală" defaultValue={defaults?.image} />
      <AdminTextarea label="Conținut" name="content" defaultValue={defaults?.content ?? ""} placeholder="Conținutul complet al articolului..." rows={10} />

      <div className="flex items-center gap-2.5">
        <Checkbox id="field-published" name="published" defaultChecked={defaults?.published ?? true} />
        <Label htmlFor="field-published" className="font-bold">
          Publicat (vizibil pe site)
        </Label>
      </div>

      <Button type="submit" variant="accent" disabled={pending} className="self-start mt-2">
        {pending ? "Se salvează..." : submitLabel}
      </Button>
    </form>
  );
}
