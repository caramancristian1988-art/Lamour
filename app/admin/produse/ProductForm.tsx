"use client";

import { useActionState, useState } from "react";
import { AdminInput, AdminTextarea, AdminSelect } from "../components/AdminField";
import ImageUploadField from "../components/ImageUploadField";
import MultiImageUploadField from "../components/MultiImageUploadField";
import ManagedSelect from "../components/ManagedSelect";
import SpecificationsEditor from "../components/SpecificationsEditor";
import VariantRowsEditor from "../components/VariantRowsEditor";
import type { ProductFormState } from "@/lib/adminProductActions";
import { createCategoryInlineAction, deleteCategoryInlineAction } from "@/lib/adminCategoryActions";
import { Alert, AlertDescription } from "@/app/components/ui/alert";
import { Checkbox } from "@/app/components/ui/checkbox";
import { Label } from "@/app/components/ui/label";
import { Button } from "@/app/components/ui/button";
import { Switch } from "@/app/components/ui/switch";

interface CategoryOption {
  id: string;
  name: string;
}

interface VariantOption {
  id: string;
  name: string;
}

const COMMON_VARIANT_UNITS = ["L", "ml", "kg", "g", "m²", "buc", "rolă", "set", "pachet"];

// A saved variantLabel is stored as one string ("12 buc"), but the form edits
// it as two separate fields (number + unit) so units become pickable presets
// instead of the admin retyping the symbol every time. Split on the first
// run of digits to prefill those two fields when editing an existing variant.
function splitVariantLabel(label: string): { qty: string; unit: string } {
  const match = label.trim().match(/^([\d.,]+)\s*(.*)$/);
  if (!match) return { qty: "", unit: label.trim() };
  return { qty: match[1], unit: match[2].trim() };
}

const PRODUCT_SPEC_TEMPLATE = [
  { label: "Numărul de role în set", value: "" },
  { label: "Numărul de straturi", value: "" },
  { label: "Lungimea", value: "" },
  { label: "Numărul de foi", value: "" },
  { label: "Lățimea foii", value: "" },
  { label: "Înălțimea foii", value: "" },
  { label: "Greutatea", value: "" },
  { label: "Densitatea (g/m²)", value: "" },
  { label: "Dimensiunile setului", value: "" },
];

interface ProductDefaults {
  id?: string;
  name?: string;
  slug?: string;
  description?: string | null;
  price?: number;
  oldPrice?: number | null;
  bulkMinQty?: number | null;
  bulkPrice?: number | null;
  image?: string | null;
  images?: string[];
  packageQuantity?: string | null;
  brand?: string | null;
  badge?: string | null;
  availability?: string;
  installmentsEnabled?: boolean;
  categoryId?: string;
  specifications?: { label: string; value: string }[];
  variantGroupId?: string | null;
  variantLabel?: string | null;
  salesCount?: number;
}

const initialState: ProductFormState = {};

export default function ProductForm({
  action,
  defaults,
  categories,
  brands,
  variantOptions,
  variantLabels,
  submitLabel,
}: {
  action: (prevState: ProductFormState, formData: FormData) => Promise<ProductFormState>;
  defaults?: ProductDefaults;
  categories: CategoryOption[];
  brands: string[];
  variantOptions: VariantOption[];
  variantLabels: string[];
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState(action, initialState);
  const [isVariant, setIsVariant] = useState(Boolean(defaults?.variantGroupId));

  const defaultBadges = ["Nou", "Reducere", "Cel mai vândut", "Eco"];
  const badgeOptions =
    defaults?.badge && !defaultBadges.includes(defaults.badge)
      ? [...defaultBadges, defaults.badge]
      : defaultBadges;

  const brandOptions =
    defaults?.brand && !brands.includes(defaults.brand) ? [...brands, defaults.brand] : brands;

  const currentVariantLabel = splitVariantLabel(defaults?.variantLabel ?? "");
  const variantUnitOptions = Array.from(
    new Set([
      ...COMMON_VARIANT_UNITS,
      ...variantLabels.map((l) => splitVariantLabel(l).unit).filter(Boolean),
      ...(currentVariantLabel.unit ? [currentVariantLabel.unit] : []),
    ])
  );

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

      <div className="grid grid-cols-2 gap-4">
        <AdminInput
          label="Cantitate minimă pentru preț redus (opțional)"
          name="bulkMinQty"
          type="number"
          defaultValue={defaults?.bulkMinQty ?? ""}
          placeholder="ex: 6"
        />
        <AdminInput
          label="Preț per bucată la cantitate mare (opțional)"
          name="bulkPrice"
          type="number"
          defaultValue={defaults?.bulkPrice ?? ""}
          placeholder="ex: 58"
        />
      </div>
      <p className="text-xs text-muted-foreground -mt-2">
        Dacă le completezi pe amândouă, pe pagina produsului apare &quot;de la {"{cantitate}"} buc. preț {"{preț}"} lei&quot;.
        Doar informativ — nu se aplică automat la adăugarea în coș.
      </p>

      <AdminInput
        label="Cantitate / Ambalaj (opțional)"
        name="packageQuantity"
        defaultValue={defaults?.packageQuantity ?? ""}
        placeholder="ex: 32 role, 100 buc, 500 ml"
      />

      <div className="border border-border rounded-xl p-4 flex flex-col gap-3">
        <p className="text-xs font-bold uppercase tracking-wide text-primary">
          Variante de mărime / cantitate
        </p>
        <p className="text-xs text-muted-foreground -mt-1.5">
          Ai deja pe site un produs asemănător (ex: același borcan, dar la 1L) și vrei ca ăsta să
          apară lângă el ca buton de mărime, nu ca produs separat în listă? Activează mai jos.
        </p>

        <div className="flex items-center justify-between gap-3 border border-border rounded-xl px-4 py-3.5">
          <Label htmlFor="field-isVariant" className="cursor-pointer font-normal">
            <span className="block text-sm font-bold text-primary">E o mărime/variantă a altui produs</span>
            <span className="block text-xs text-muted-foreground mt-0.5">
              Dezactivat = produs de sine stătător, apare normal în listă.
            </span>
          </Label>
          <Switch
            id="field-isVariant"
            checked={isVariant}
            onCheckedChange={setIsVariant}
            className="shrink-0"
          />
        </div>

        {isVariant && (
          <>
            <AdminSelect
              name="variantGroupId"
              label="1. Care e produsul deja existent pe site?"
              defaultValue={defaults?.variantGroupId ?? ""}
            >
              <option value="">— Alege produsul —</option>
              {variantOptions.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </AdminSelect>
            <p className="text-xs font-bold text-primary -mb-1.5">
              2. Ce scrie pe butonul de selecție pentru mărimea asta?
            </p>
            <div className="grid grid-cols-[1fr_1.4fr] gap-3">
              <AdminInput
                label="Număr"
                name="variantQty"
                defaultValue={currentVariantLabel.qty}
                placeholder="ex: 12, 2, 35"
              />
              <ManagedSelect
                name="variantUnit"
                label="Unitate"
                defaultOptions={variantUnitOptions.map((value) => ({ value, label: value }))}
                defaultValue={currentVariantLabel.unit}
                emptyOptionLabel="Alege unitatea"
                addPlaceholder="Unitate nouă, ex: seturi"
                deleteConfirmText="Sigur vrei să ștergi această unitate din listă?"
                onAdd={async (label) => ({ option: { value: label, label } })}
                onDelete={async () => {}}
              />
            </div>
            <p className="text-xs text-muted-foreground -mt-1.5">
              Numărul îl scrii tu de fiecare dată, unitatea o alegi din listă (sau apeși
              &quot;Adaugă&quot; pentru una nouă, care rămâne disponibilă și pentru variantele
              viitoare). Ex: &quot;12&quot; + &quot;buc&quot; → pe pagina produsului apare un buton
              &quot;12 buc&quot; care duce la produsul ăsta, cu prețul lui.
            </p>
          </>
        )}

        {!defaults?.id && !isVariant && <VariantRowsEditor unitOptions={variantUnitOptions} />}
      </div>

      <ImageUploadField name="image" label="Imagine principală" defaultValue={defaults?.image} />
      <MultiImageUploadField name="images" label="Galerie imagini (opțional)" defaultValue={defaults?.images} />

      <SpecificationsEditor defaultValue={defaults?.specifications} template={PRODUCT_SPEC_TEMPLATE} />

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

      <div>
        <AdminInput
          label="Vânzări (numărul de bucăți vândute)"
          name="salesCount"
          type="number"
          defaultValue={defaults?.salesCount ?? 0}
          placeholder="0"
        />
        <p className="text-xs text-muted-foreground mt-1.5">
          Crește automat cu 1 când marchezi o comandă legată de acest produs ca &quot;Achitat&quot; în Mesaje.
          Poți și corecta manual aici. Rămâne ascuns pe site sub 10 bucăți vândute.
        </p>
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
