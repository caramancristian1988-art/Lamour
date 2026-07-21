"use client";

import { useActionState } from "react";
import { AdminInput, AdminTextarea } from "../components/AdminField";
import ImageUploadField from "../components/ImageUploadField";
import ManagedSelect from "../components/ManagedSelect";
import SpecificationsEditor from "../components/SpecificationsEditor";
import type { SpaceFormState } from "@/lib/adminSpaceActions";
import { createSpaceTypeInlineAction, deleteSpaceTypeInlineAction } from "@/lib/adminSpaceTypeActions";
import { Alert, AlertDescription } from "@/app/components/ui/alert";
import { Button } from "@/app/components/ui/button";

const CHARACTERISTIC_TEMPLATE = [
  { label: "Suprafață", value: "" },
  { label: "Camere", value: "" },
  { label: "Etaj", value: "" },
  { label: "Stare", value: "" },
  { label: "Parcare", value: "" },
  { label: "Disponibilitate", value: "" },
];

interface TypeOption {
  id: string;
  name: string;
}

interface SpaceDefaults {
  id?: string;
  slug?: string;
  typeId?: string;
  title?: string;
  priceLabel?: string;
  price?: number | null;
  area?: number;
  location?: string;
  mapAddress?: string | null;
  image?: string | null;
  description?: string | null;
  characteristics?: { label: string; value: string }[];
}

const initialState: SpaceFormState = {};

export default function SpaceListingForm({
  action,
  defaults,
  types,
  submitLabel,
}: {
  action: (prevState: SpaceFormState, formData: FormData) => Promise<SpaceFormState>;
  defaults?: SpaceDefaults;
  types: TypeOption[];
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

      <AdminInput label="Titlu" name="title" required defaultValue={defaults?.title} placeholder="Apartament 2 camere, zona Centru" />
      <AdminInput label="Slug" name="slug" required defaultValue={defaults?.slug} placeholder="apartament-2-camere-centru" />
      <AdminTextarea label="Descriere" name="description" defaultValue={defaults?.description ?? ""} placeholder="Descrierea anunțului..." rows={3} />

      <ManagedSelect
        name="typeId"
        label="Tip"
        required
        defaultOptions={types.map((t) => ({ value: t.id, label: t.name }))}
        defaultValue={defaults?.typeId ?? ""}
        emptyOptionLabel="Alege un tip"
        addPlaceholder="Tip nou, ex: Vilă"
        deleteConfirmText="Sigur vrei să ștergi acest tip? Funcționează doar dacă niciun anunț nu îl folosește."
        onAdd={async (label) => {
          const formData = new FormData();
          formData.set("name", label);
          const result = await createSpaceTypeInlineAction(formData);
          if (result.error || !result.type) return { error: result.error ?? "Nu am putut crea tipul." };
          return { option: { value: result.type.id, label: result.type.name } };
        }}
        onDelete={async (option) => {
          const result = await deleteSpaceTypeInlineAction(option.value);
          if (result.error) return { error: result.error };
        }}
      />

      <div className="grid grid-cols-2 gap-4">
        <AdminInput label="Preț numeric (opțional)" name="price" type="number" defaultValue={defaults?.price ?? ""} placeholder="350" />
        <AdminInput label="Preț afișat" name="priceLabel" required defaultValue={defaults?.priceLabel} placeholder="350 €/lună" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <AdminInput label="Suprafață (m²)" name="area" type="number" required defaultValue={defaults?.area} placeholder="62" />
        <AdminInput label="Zonă (afișată pe card)" name="location" required defaultValue={defaults?.location} placeholder="Chișinău, sector Centru" />
      </div>

      <AdminInput
        label="Adresă exactă sau coordonate GPS (opțional)"
        name="mapAddress"
        defaultValue={defaults?.mapAddress ?? ""}
        placeholder="Str. Ismail 45, Chișinău sau 47.0105, 28.8638"
      />
      <p className="text-xs text-muted-foreground -mt-2">
        Folosită pentru linkul spre Google Maps. Dacă o lași goală, se folosește zona de mai sus.
      </p>

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
