"use client";

import { useActionState, useState } from "react";
import { AdminInput, AdminTextarea } from "../components/AdminField";
import ImageUploadField from "../components/ImageUploadField";
import MultiImageUploadField from "../components/MultiImageUploadField";
import type { ProductFormState } from "@/lib/adminProductActions";
import { createCategoryInlineAction } from "@/lib/adminCategoryActions";

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

  const [categoryOptions, setCategoryOptions] = useState(categories);
  const [selectedCategoryId, setSelectedCategoryId] = useState(defaults?.categoryId ?? "");
  const [addingCategory, setAddingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [categoryError, setCategoryError] = useState<string | null>(null);
  const [creatingCategory, setCreatingCategory] = useState(false);

  async function handleCreateCategory() {
    const name = newCategoryName.trim();
    if (!name) return;

    setCreatingCategory(true);
    setCategoryError(null);

    const formData = new FormData();
    formData.set("name", name);
    const result = await createCategoryInlineAction(formData);

    setCreatingCategory(false);

    if (result.error || !result.category) {
      setCategoryError(result.error ?? "Nu am putut crea categoria.");
      return;
    }

    setCategoryOptions((prev) => [...prev, result.category!]);
    setSelectedCategoryId(result.category.id);
    setNewCategoryName("");
    setAddingCategory(false);
  }

  const defaultEnergyClasses = ["A", "A+", "A++", "A+++"];
  const [energyClassOptions, setEnergyClassOptions] = useState(
    defaults?.energyClass && !defaultEnergyClasses.includes(defaults.energyClass)
      ? [...defaultEnergyClasses, defaults.energyClass]
      : defaultEnergyClasses
  );
  const [selectedEnergyClass, setSelectedEnergyClass] = useState(defaults?.energyClass ?? "");
  const [addingEnergyClass, setAddingEnergyClass] = useState(false);
  const [newEnergyClass, setNewEnergyClass] = useState("");

  function handleAddEnergyClass() {
    const value = newEnergyClass.trim();
    if (!value) return;

    if (!energyClassOptions.includes(value)) {
      setEnergyClassOptions((prev) => [...prev, value]);
    }
    setSelectedEnergyClass(value);
    setNewEnergyClass("");
    setAddingEnergyClass(false);
  }

  return (
    <form action={formAction} className="bg-white border border-gray-100 rounded-2xl p-6 flex flex-col gap-4 max-w-2xl">
      {defaults?.id && <input type="hidden" name="id" value={defaults.id} />}

      {state.error && (
        <p className="text-sm text-[#c7092b] bg-[#fdf2f3] border border-[#fbd5d9] rounded-lg px-4 py-2.5">{state.error}</p>
      )}

      <AdminInput label="Nume produs" name="name" required defaultValue={defaults?.name} placeholder="Daikin Sensira FTXF35E" />
      <AdminInput label="Slug" name="slug" required defaultValue={defaults?.slug} placeholder="daikin-sensira-ftxf35e" />
      <AdminTextarea label="Descriere" name="description" defaultValue={defaults?.description ?? ""} placeholder="Descrierea produsului..." rows={3} />

      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-gray-600">Categorie <span className="text-[#c7092b]">*</span></span>
          {!addingCategory && (
            <button
              type="button"
              onClick={() => setAddingCategory(true)}
              className="text-xs font-bold text-[#c7092b] hover:underline"
            >
              + Categorie nouă
            </button>
          )}
        </div>

        <select
          name="categoryId"
          required
          value={selectedCategoryId}
          onChange={(e) => setSelectedCategoryId(e.target.value)}
          className="border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#c7092b] bg-white"
        >
          <option value="" disabled>
            Alege o categorie
          </option>
          {categoryOptions.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>

        {addingCategory && (
          <div className="flex items-center gap-2 mt-1.5">
            <input
              type="text"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              placeholder="Nume categorie nouă"
              className="flex-1 border border-gray-300 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-[#c7092b]"
            />
            <button
              type="button"
              onClick={handleCreateCategory}
              disabled={creatingCategory || !newCategoryName.trim()}
              className="bg-[#1d2353] hover:bg-[#2a3470] disabled:opacity-60 text-white text-xs font-bold px-4 py-2 rounded-xl transition-colors shrink-0"
            >
              {creatingCategory ? "Se adaugă..." : "Adaugă"}
            </button>
            <button
              type="button"
              onClick={() => {
                setAddingCategory(false);
                setNewCategoryName("");
                setCategoryError(null);
              }}
              className="text-gray-400 hover:text-[#c7092b] transition-colors shrink-0"
              aria-label="Anulează"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}
        {categoryError && <p className="text-xs text-[#c7092b]">{categoryError}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <AdminInput label="Preț (MDL)" name="price" type="number" required defaultValue={defaults?.price} placeholder="12999" />
        <AdminInput label="Preț vechi (opțional)" name="oldPrice" type="number" defaultValue={defaults?.oldPrice ?? ""} placeholder="14999" />
      </div>

      <ImageUploadField name="image" label="Imagine principală" defaultValue={defaults?.image} />
      <MultiImageUploadField name="images" label="Galerie imagini (opțional)" defaultValue={defaults?.images} />

      <div className="grid grid-cols-2 gap-4">
        <AdminInput label="BTU (opțional)" name="btu" type="number" defaultValue={defaults?.btu ?? ""} placeholder="12000" />
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-600">Clasă energetică</span>
            {!addingEnergyClass && (
              <button
                type="button"
                onClick={() => setAddingEnergyClass(true)}
                className="text-xs font-bold text-[#c7092b] hover:underline"
              >
                + Valoare nouă
              </button>
            )}
          </div>

          <select
            name="energyClass"
            value={selectedEnergyClass}
            onChange={(e) => setSelectedEnergyClass(e.target.value)}
            className="border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#c7092b] bg-white"
          >
            <option value="">—</option>
            {energyClassOptions.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>

          {addingEnergyClass && (
            <div className="flex items-center gap-2 mt-1.5">
              <input
                type="text"
                value={newEnergyClass}
                onChange={(e) => setNewEnergyClass(e.target.value)}
                placeholder="ex: B"
                className="flex-1 border border-gray-300 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-[#c7092b]"
              />
              <button
                type="button"
                onClick={handleAddEnergyClass}
                disabled={!newEnergyClass.trim()}
                className="bg-[#1d2353] hover:bg-[#2a3470] disabled:opacity-60 text-white text-xs font-bold px-4 py-2 rounded-xl transition-colors shrink-0"
              >
                Adaugă
              </button>
              <button
                type="button"
                onClick={() => {
                  setAddingEnergyClass(false);
                  setNewEnergyClass("");
                }}
                className="text-gray-400 hover:text-[#c7092b] transition-colors shrink-0"
                aria-label="Anulează"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          )}
        </div>
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
