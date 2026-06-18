"use client";

import { useActionState } from "react";
import { AdminInput, AdminTextarea } from "../components/AdminField";
import ImageUploadField from "../components/ImageUploadField";
import MultiImageUploadField from "../components/MultiImageUploadField";
import ManagedSelect from "../components/ManagedSelect";
import type { ProductFormState } from "@/lib/adminProductActions";
import { createCategoryInlineAction, deleteCategoryInlineAction } from "@/lib/adminCategoryActions";

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

  const defaultEnergyClasses = ["A", "A+", "A++", "A+++"];
  const energyClassOptions =
    defaults?.energyClass && !defaultEnergyClasses.includes(defaults.energyClass)
      ? [...defaultEnergyClasses, defaults.energyClass]
      : defaultEnergyClasses;

  const defaultBadges = ["Eficiență A++", "Nou", "Reducere", "Cel mai vândut"];
  const badgeOptions =
    defaults?.badge && !defaultBadges.includes(defaults.badge)
      ? [...defaultBadges, defaults.badge]
      : defaultBadges;

  return (
    <form action={formAction} className="bg-white border border-gray-100 rounded-2xl p-6 flex flex-col gap-4 max-w-2xl">
      {defaults?.id && <input type="hidden" name="id" value={defaults.id} />}

      {state.error && (
        <p className="text-sm text-[#c7092b] bg-[#fdf2f3] border border-[#fbd5d9] rounded-lg px-4 py-2.5">{state.error}</p>
      )}

      <AdminInput label="Nume produs" name="name" required defaultValue={defaults?.name} placeholder="Daikin Sensira FTXF35E" />
      <AdminInput label="Slug" name="slug" required defaultValue={defaults?.slug} placeholder="daikin-sensira-ftxf35e" />
      <AdminTextarea label="Descriere" name="description" defaultValue={defaults?.description ?? ""} placeholder="Descrierea produsului..." rows={3} />

      <ManagedSelect
        name="categoryId"
        label="Categorie"
        required
        defaultOptions={categories.map((c) => ({ value: c.id, label: c.name }))}
        defaultValue={defaults?.categoryId}
        emptyOptionLabel="Alege o categorie"
        addPlaceholder="Nume categorie nouă"
        deleteConfirmText="Sigur vrei să ștergi această categorie? Funcționează doar dacă niciun produs nu o folosește."
        onAdd={async (label) => {
          const formData = new FormData();
          formData.set("name", label);
          const result = await createCategoryInlineAction(formData);
          if (result.error || !result.category) return { error: result.error ?? "Nu am putut crea categoria." };
          return { option: { value: result.category.id, label: result.category.name } };
        }}
        onDelete={async (option) => {
          const result = await deleteCategoryInlineAction(option.value);
          if (result.error) return { error: result.error };
        }}
      />

      <div className="grid grid-cols-2 gap-4">
        <AdminInput label="Preț (MDL)" name="price" type="number" required defaultValue={defaults?.price} placeholder="12999" />
        <AdminInput label="Preț vechi (opțional)" name="oldPrice" type="number" defaultValue={defaults?.oldPrice ?? ""} placeholder="14999" />
      </div>

      <ImageUploadField name="image" label="Imagine principală" defaultValue={defaults?.image} />
      <MultiImageUploadField name="images" label="Galerie imagini (opțional)" defaultValue={defaults?.images} />

      <div className="grid grid-cols-2 gap-4">
        <AdminInput label="BTU (opțional)" name="btu" type="number" defaultValue={defaults?.btu ?? ""} placeholder="12000" />
        <ManagedSelect
          name="energyClass"
          label="Clasă energetică"
          defaultOptions={energyClassOptions.map((value) => ({ value, label: value }))}
          defaultValue={defaults?.energyClass ?? ""}
          addPlaceholder="ex: B"
          deleteConfirmText="Sigur vrei să ștergi această clasă energetică din listă?"
          onAdd={async (label) => ({ option: { value: label, label } })}
          onDelete={async () => {}}
        />
      </div>

      <ManagedSelect
        name="badge"
        label="Badge (opțional)"
        defaultOptions={badgeOptions.map((value) => ({ value, label: value }))}
        defaultValue={defaults?.badge ?? ""}
        addPlaceholder="Eticheta nouă, ex: Top vânzări"
        deleteConfirmText="Sigur vrei să ștergi acest badge din listă?"
        onAdd={async (label) => ({ option: { value: label, label } })}
        onDelete={async () => {}}
      />

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
