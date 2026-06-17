"use client";

import { useActionState } from "react";
import { AdminInput, AdminTextarea } from "../components/AdminField";
import ImageUploadField from "../components/ImageUploadField";
import MultiImageUploadField from "../components/MultiImageUploadField";
import type { ProductFormState } from "@/lib/adminProductActions";

interface CategoryOption {
  id: string;
  name: string;
}

interface ProductDefaults {
  id?: string;
  name?: string;
  slug?: string;
  description?: string | null;
  price?: number;
  oldPrice?: number | null;
  image?: string | null;
  images?: string[];
  btu?: number | null;
  inverter?: boolean;
  energyClass?: string | null;
  badge?: string | null;
  inStock?: boolean;
  categoryId?: string;
}

const initialState: ProductFormState = {};

export default function ProductForm({
  action,
  defaults,
  categories,
  submitLabel,
}: {
  action: (prevState: ProductFormState, formData: FormData) => Promise<ProductFormState>;
  defaults?: ProductDefaults;
  categories: CategoryOption[];
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="bg-white border border-gray-100 rounded-2xl p-6 flex flex-col gap-4 max-w-2xl">
      {defaults?.id && <input type="hidden" name="id" value={defaults.id} />}

      {state.error && (
        <p className="text-sm text-[#c7092b] bg-[#fdf2f3] border border-[#fbd5d9] rounded-lg px-4 py-2.5">{state.error}</p>
      )}

      <AdminInput label="Nume produs" name="name" required defaultValue={defaults?.name} placeholder="Daikin Sensira FTXF35E" />
      <AdminInput label="Slug" name="slug" required defaultValue={defaults?.slug} placeholder="daikin-sensira-ftxf35e" />
      <AdminTextarea label="Descriere" name="description" defaultValue={defaults?.description ?? ""} placeholder="Descrierea produsului..." rows={3} />

      <label className="flex flex-col gap-1.5">
        <span className="text-xs font-bold text-gray-600">Categorie <span className="text-[#c7092b]">*</span></span>
        <select
          name="categoryId"
          required
          defaultValue={defaults?.categoryId ?? ""}
          className="border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#c7092b] bg-white"
        >
          <option value="" disabled>
            Alege o categorie
          </option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </label>

      <div className="grid grid-cols-2 gap-4">
        <AdminInput label="Preț (MDL)" name="price" type="number" required defaultValue={defaults?.price} placeholder="12999" />
        <AdminInput label="Preț vechi (opțional)" name="oldPrice" type="number" defaultValue={defaults?.oldPrice ?? ""} placeholder="14999" />
      </div>

      <ImageUploadField name="image" label="Imagine principală" defaultValue={defaults?.image} />
      <MultiImageUploadField name="images" label="Galerie imagini (opțional)" defaultValue={defaults?.images} />

      <div className="grid grid-cols-2 gap-4">
        <AdminInput label="BTU (opțional)" name="btu" type="number" defaultValue={defaults?.btu ?? ""} placeholder="12000" />
        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-bold text-gray-600">Clasă energetică</span>
          <select
            name="energyClass"
            defaultValue={defaults?.energyClass ?? ""}
            className="border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#c7092b] bg-white"
          >
            <option value="">—</option>
            <option value="A">A</option>
            <option value="A+">A+</option>
            <option value="A++">A++</option>
            <option value="A+++">A+++</option>
          </select>
        </label>
      </div>

      <AdminInput label="Badge (opțional)" name="badge" defaultValue={defaults?.badge ?? ""} placeholder="Eficiență A++" />

      <div className="flex items-center gap-6">
        <label className="flex items-center gap-2 text-sm font-bold text-gray-600">
          <input type="checkbox" name="inverter" defaultChecked={defaults?.inverter ?? false} className="w-4 h-4 accent-[#c7092b]" />
          Inverter
        </label>
        <label className="flex items-center gap-2 text-sm font-bold text-gray-600">
          <input type="checkbox" name="inStock" defaultChecked={defaults?.inStock ?? true} className="w-4 h-4 accent-[#c7092b]" />
          În stoc
        </label>
      </div>

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
