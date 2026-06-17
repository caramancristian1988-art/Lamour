import { AdminInput, AdminTextarea } from "../components/AdminField";
import MultiImageUploadField from "../components/MultiImageUploadField";

interface ProjectDefaults {
  id?: string;
  title?: string;
  description?: string;
  images?: string[];
}

export default function ProjectForm({
  action,
  defaults,
  submitLabel,
}: {
  action: (formData: FormData) => void;
  defaults?: ProjectDefaults;
  submitLabel: string;
}) {
  return (
    <form action={action} className="bg-white border border-gray-100 rounded-2xl p-6 flex flex-col gap-4 max-w-xl">
      {defaults?.id && <input type="hidden" name="id" value={defaults.id} />}

      <AdminInput label="Titlu" name="title" required defaultValue={defaults?.title} placeholder="Instalare sistem multisplit, birou Chișinău" />
      <AdminTextarea
        label="Descriere"
        name="description"
        required
        defaultValue={defaults?.description}
        placeholder="Descrierea proiectului realizat..."
      />

      <MultiImageUploadField name="images" label="Galerie imagini" defaultValue={defaults?.images} />

      <button
        type="submit"
        className="self-start bg-[#c7092b] hover:bg-[#a5071f] text-white font-bold px-6 py-2.5 rounded-xl transition-colors text-sm uppercase tracking-wide mt-2"
      >
        {submitLabel}
      </button>
    </form>
  );
}
