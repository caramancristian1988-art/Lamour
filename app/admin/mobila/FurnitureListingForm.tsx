"use client";

import { useActionState } from "react";
import { AdminInput, AdminTextarea } from "../components/AdminField";
import ImageUploadField from "../components/ImageUploadField";
import ManagedSelect from "../components/ManagedSelect";
import SpecificationsEditor from "../components/SpecificationsEditor";
import type { FurnitureFormState } from "@/lib/adminFurnitureActions";
import { Alert, AlertDescription } from "@/app/components/ui/alert";
import { Button } from "@/app/components/ui/button";

const CHARACTERISTIC_TEMPLATE = [
  { label: "Material", value: "" },
  { label: "Dimensiuni", value: "" },
  { label: "Finisaj", value: "" },
  { label: "Termen execuție", value: "" },
  { label: "Garanție", value: "" },
  { label: "Livrare și montaj", value: "" },
];

interface FurnitureDefaults {
  id?: string;
  slug?: string;
  type?: string;
  title?: string;
  priceLabel?: string;
  price?: number | null;
  material?: string;
  leadTime?: string | null;
  image?: string | null;
  description?: string | null;
  characteristics?: { label: string; value: string }[];
}

const initialState: FurnitureFormState = {};

export default function FurnitureListingForm({
  action,
  defaults,
  types,
  materials,
  submitLabel,
}: {
  action: (prevState: FurnitureFormState, formData: FormData) => Promise<FurnitureFormState>;
  defaults?: FurnitureDefaults;
  types: string[];
  materials: string[];
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState(action, initialState);

  const typeOptions = defaults?.type && !types.includes(defaults.type) ? [...types, defaults.type] : types;
  const materialOptions = defaults?.material && !materials.includes(defaults.material) ? [...materials, defaults.material] : materials;

  return (
    <form action={formAction} className="bg-card border border-border rounded-2xl p-6 flex flex-col gap-4 max-w-2xl">
      {defaults?.id && <input type="hidden" name="id" value={defaults.id} />}

      {state.error && (
        <Alert variant="destructive">
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      )}

      <AdminInput label="Titlu" name="title" required defaultValue={defaults?.title} placeholder="Birou de conducere, lemn masiv" />
      <AdminInput label="Slug" name="slug" required defaultValue={defaults?.slug} placeholder="birou-conducere-lemn-masiv" />
      <AdminTextarea label="Descriere" name="description" defaultValue={defaults?.description ?? ""} placeholder="Descrierea lucrării..." rows={3} />

      <ManagedSelect
        name="type"
        label="Tip"
        required
        defaultOptions={typeOptions.map((value) => ({ value, label: value }))}
        defaultValue={defaults?.type ?? ""}
        emptyOptionLabel="Alege un tip"
        addPlaceholder="Tip nou, ex: Terasă"
        deleteConfirmText="Elimini acest tip din listă? (nu șterge lucrările existente)"
        onAdd={async (label) => ({ option: { value: label, label } })}
        onDelete={async () => {}}
      />

      <div className="grid grid-cols-2 gap-4">
        <AdminInput label="Preț de la (MDL, opțional)" name="price" type="number" defaultValue={defaults?.price ?? ""} placeholder="8500" />
        <AdminInput label="Preț afișat" name="priceLabel" required defaultValue={defaults?.priceLabel} placeholder="De la 8.500 MDL" />
      </div>

      <ManagedSelect
        name="material"
        label="Material"
        required
        defaultOptions={materialOptions.map((value) => ({ value, label: value }))}
        defaultValue={defaults?.material ?? ""}
        emptyOptionLabel="Alege un material"
        addPlaceholder="Material nou, ex: Lemn masiv de stejar"
        deleteConfirmText="Elimini acest material din listă? (nu șterge lucrările existente)"
        onAdd={async (label) => ({ option: { value: label, label } })}
        onDelete={async () => {}}
      />

      <AdminInput label="Termen execuție (opțional)" name="leadTime" defaultValue={defaults?.leadTime ?? ""} placeholder="3-4 săptămâni" />

      <ImageUploadField name="image" label="Imagine" defaultValue={defaults?.image} />

      <SpecificationsEditor
        defaultValue={defaults?.characteristics}
        template={CHARACTERISTIC_TEMPLATE}
        label="Caracteristici (opțional)"
      />

      <Button type="submit" variant="accent" disabled={pending} className="self-start mt-2">
        {pending ? "Se salvează..." : submitLabel}
      </Button>
    </form>
  );
}
