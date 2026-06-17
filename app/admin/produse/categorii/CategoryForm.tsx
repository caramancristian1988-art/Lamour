import { AdminInput, AdminTextarea } from "../../components/AdminField";
import ImageUploadField from "../../components/ImageUploadField";

interface CategoryDefaults {
  id?: string;
  name?: string;
  slug?: string;
  description?: string | null;
  image?: string | null;
}

export default function CategoryForm({
  action,
  defaults,
  submitLabel,
}: {
  action: (formData: FormData) => void;
  defaults?: CategoryDefaults;
  submitLabel: string;
}) {
  return (
    <form action={action} className="bg-white border border-gray-100 rounded-2xl p-6 flex flex-col gap-4">
      {defaults?.id && <input type="hidden" name="id" value={defaults.id} />}

      <AdminInput label="Nume categorie" name="name" required defaultValue={defaults?.name} placeholder="Condiționere rezidențiale" />
      <AdminInput label="Slug" name="slug" required defaultValue={defaults?.slug} placeholder="conditioane-rezidentiale" />
      <AdminTextarea label="Descriere (opțional)" name="description" defaultValue={defaults?.description ?? ""} placeholder="Pentru confortul casei tale" rows={2} />
      <ImageUploadField name="image" label="Imagine (opțional)" defaultValue={defaults?.image} />

      <button
        type="submit"
        className="self-start bg-[#c7092b] hover:bg-[#a5071f] text-white font-bold px-6 py-2.5 rounded-xl transition-colors text-sm uppercase tracking-wide mt-2"
      >
        {submitLabel}
      </button>
    </form>
  );
}
