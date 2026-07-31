import { AdminInput, AdminTextarea, AdminSelect } from "../../components/AdminField";
import ImageUploadField from "../../components/ImageUploadField";
import { Button } from "@/app/components/ui/button";

interface CategoryDefaults {
  id?: string;
  name?: string;
  slug?: string;
  description?: string | null;
  image?: string | null;
  parentId?: string | null;
}

interface ParentOption {
  id: string;
  name: string;
}

export default function CategoryForm({
  action,
  defaults,
  parentOptions,
  submitLabel,
}: {
  action: (formData: FormData) => void;
  defaults?: CategoryDefaults;
  parentOptions: ParentOption[];
  submitLabel: string;
}) {
  return (
    <form action={action} className="bg-card border border-border rounded-2xl p-6 flex flex-col gap-4">
      {defaults?.id && <input type="hidden" name="id" value={defaults.id} />}

      <AdminInput label="Nume categorie" name="name" required defaultValue={defaults?.name} placeholder="Condiționere rezidențiale" />
      <AdminInput label="Slug" name="slug" required defaultValue={defaults?.slug} placeholder="conditioane-rezidentiale" />
      <AdminTextarea label="Descriere (opțional)" name="description" defaultValue={defaults?.description ?? ""} placeholder="Pentru confortul casei tale" rows={2} />
      <ImageUploadField name="image" label="Imagine (opțional)" defaultValue={defaults?.image} />

      <AdminSelect label="Categorie părinte (opțional)" name="parentId" defaultValue={defaults?.parentId ?? ""}>
        <option value="">— Categorie principală (fără părinte) —</option>
        {parentOptions.map((p) => (
          <option key={p.id} value={p.id}>
            {p.name}
          </option>
        ))}
      </AdminSelect>
      <p className="text-xs text-muted-foreground -mt-2">
        Dacă alegi o categorie părinte, aceasta va apărea ca filtru (buton) pe pagina categoriei părinte, iar produsele ei se văd și acolo.
      </p>

      <Button type="submit" variant="accent" className="self-start mt-2">
        {submitLabel}
      </Button>
    </form>
  );
}
