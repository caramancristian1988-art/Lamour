import { AdminInput, AdminTextarea } from "../components/AdminField";

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

      <label className="flex flex-col gap-1.5">
        <span className="text-xs font-bold text-gray-600">Galerie imagini (un URL pe linie)</span>
        <textarea
          name="images"
          rows={5}
          defaultValue={defaults?.images?.join("\n")}
          placeholder={"/proiect-1.jpg\n/proiect-2.jpg"}
          className="border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#c7092b] placeholder:text-gray-400 resize-none font-mono"
        />
      </label>

      <button
        type="submit"
        className="self-start bg-[#c7092b] hover:bg-[#a5071f] text-white font-bold px-6 py-2.5 rounded-xl transition-colors text-sm uppercase tracking-wide mt-2"
      >
        {submitLabel}
      </button>
    </form>
  );
}
