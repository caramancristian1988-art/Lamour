"use client";

import { useActionState } from "react";
import { AdminInput, AdminTextarea } from "../components/AdminField";
import ImageUploadField from "../components/ImageUploadField";
import MultiImageUploadField from "../components/MultiImageUploadField";
import ManagedSelect from "../components/ManagedSelect";
import SpecificationsEditor from "../components/SpecificationsEditor";
import type { ProductFormState } from "@/lib/adminProductActions";
import { createCategoryInlineAction, deleteCategoryInlineAction } from "@/lib/adminCategoryActions";
import { Alert, AlertDescription } from "@/app/components/ui/alert";
import { Checkbox } from "@/app/components/ui/checkbox";
import { Label } from "@/app/components/ui/label";
import { Button } from "@/app/components/ui/button";

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
  technology?: string;
  brand?: string | null;
  energyClass?: string | null;
  badge?: string | null;
  availability?: string;
  installmentsEnabled?: boolean;
  categoryId?: string;
  specifications?: { label: string; value: string }[];
}

const initialState: ProductFormState = {};

export default function ProductForm({
  action,
  defaults,
  categories,
  brands,
  submitLabel,
}: {
  action: (prevState: ProductFormState, formData: FormData) => Promise<ProductFormState>;
  defaults?: ProductDefaults;
  categories: CategoryOption[];
  brands: string[];
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState(action, initialState);

  const defaultEnergyClasses = ["A", "A+", "A++", "A+++"];
  const energyClassOptions =
    defaults?.energyClass && !defaultEnergyClasses.includes(defaults.energyClass)
      ? [...defaultEnergyClasses, defaults.energyClass]
      : defaultEnergyClasses;

  const defaultBadges = ["A++", "Nou", "Reducere", "Cel mai vândut"];
  const badgeOptions =
    defaults?.badge && !defaultBadges.includes(defaults.badge)
      ? [...defaultBadges, defaults.badge]
      : defaultBadges;

  const defaultTechnologies = ["Inverter", "On/Off"];
  const technologyOptions =
    defaults?.technology && !defaultTechnologies.includes(defaults.technology)
      ? [...defaultTechnologies, defaults.technology]
      : defaultTechnologies;

  const brandOptions =
    defaults?.brand && !brands.includes(defaults.brand) ? [...brands, defaults.brand] : brands;

  const defaultAvailabilities = ["În stoc", "Stoc epuizat", "La comandă"];
  const availabilityOptions =
    defaults?.availability && !defaultAvailabilities.includes(defaults.availability)
      ? [...defaultAvailabilities, defaults.availability]
      : defaultAvailabilities;

  return (
    <form action={formAction} className="bg-card border border-border rounded-2xl p-6 flex flex-col gap-4 max-w-2xl">
      {defaults?.id && <input type="hidden" name="id" value={defaults.id} />}

      {state.error && (
        <Alert variant="destructive">
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
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

      <ManagedSelect
        name="brand"
        label="Brand (opțional)"
        defaultOptions={brandOptions.map((value) => ({ value, label: value }))}
        defaultValue={defaults?.brand ?? ""}
        emptyOptionLabel="Fără brand"
        addPlaceholder="Brand nou, ex: Samsung"
        deleteConfirmText="Sigur vrei să ștergi acest brand din listă?"
        onAdd={async (label) => ({ option: { value: label, label } })}
        onDelete={async () => {}}
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

      <SpecificationsEditor defaultValue={defaults?.specifications} />

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

      <div className="grid grid-cols-2 gap-4">
        <ManagedSelect
          name="technology"
          label="Tehnologie"
          defaultOptions={technologyOptions.map((value) => ({ value, label: value }))}
          defaultValue={defaults?.technology ?? "On/Off"}
          addPlaceholder="ex: Dual Inverter"
          deleteConfirmText="Sigur vrei să ștergi această tehnologie din listă?"
          onAdd={async (label) => ({ option: { value: label, label } })}
          onDelete={async () => {}}
        />
        <ManagedSelect
          name="availability"
          label="Disponibilitate"
          defaultOptions={availabilityOptions.map((value) => ({ value, label: value }))}
          defaultValue={defaults?.availability ?? "În stoc"}
          addPlaceholder="ex: La comandă"
          deleteConfirmText="Sigur vrei să ștergi această opțiune de disponibilitate?"
          onAdd={async (label) => ({ option: { value: label, label } })}
          onDelete={async () => {}}
        />
      </div>

      <div className="flex items-center gap-2.5">
        <Checkbox
          id="field-installmentsEnabled"
          name="installmentsEnabled"
          defaultChecked={defaults?.installmentsEnabled ?? true}
        />
        <Label htmlFor="field-installmentsEnabled" className="font-bold">
          Disponibil în rate (afișează butonul &quot;Cumpără în rate&quot;)
        </Label>
      </div>

      <Button type="submit" variant="accent" disabled={pending} className="self-start mt-2">
        {pending ? "Se salvează..." : submitLabel}
      </Button>
    </form>
  );
}
