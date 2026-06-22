import { AdminInput, AdminTextarea } from "../components/AdminField";
import ImageUploadField from "../components/ImageUploadField";

interface ServiceDefaults {
  id?: string;
  title?: string;
  description?: string;
  image?: string | null;
  detailImage?: string | null;
  heroImageDesktop?: string | null;
  href?: string | null;
  section?: string;
}

export default function ServiceForm({
  action,
  defaults,
  submitLabel,
}: {
  action: (formData: FormData) => void;
  defaults?: ServiceDefaults;
  submitLabel: string;
}) {
  return (
    <form action={action} className="bg-white border border-gray-100 rounded-2xl p-6 flex flex-col gap-4 max-w-xl">
      {defaults?.id && <input type="hidden" name="id" value={defaults.id} />}

      <AdminInput label="Titlu" name="title" required defaultValue={defaults?.title} placeholder="Instalare condiționere" />
      <AdminTextarea
        label="Descriere"
        name="description"
        required
        defaultValue={defaults?.description}
        placeholder="Montaj rapid și sigur pentru apartamente, case, birouri și spații comerciale."
      />
      <ImageUploadField name="image" label="Imagine (card listă servicii)" defaultValue={defaults?.image} />
      <ImageUploadField name="detailImage" label="Imagine hero (mobil) + secțiunea Despre serviciu" defaultValue={defaults?.detailImage} />
      <ImageUploadField name="heroImageDesktop" label="Imagine hero (calculator/desktop)" defaultValue={defaults?.heroImageDesktop} />
      <AdminInput label="Link (href)" name="href" defaultValue={defaults?.href ?? ""} placeholder="/servicii/instalare" />

      <label className="flex flex-col gap-1.5">
        <span className="text-xs font-bold text-gray-600">Secțiune</span>
        <select
          name="section"
          defaultValue={defaults?.section ?? "principale"}
          className="border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#c7092b] bg-white"
        >
          <option value="principale">Principale</option>
          <option value="avansate">Avansate</option>
          <option value="suplimentare">Suplimentare</option>
        </select>
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
