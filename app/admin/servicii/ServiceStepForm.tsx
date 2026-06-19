import { AdminInput, AdminTextarea } from "../components/AdminField";
import ImageUploadField from "../components/ImageUploadField";

interface ServiceStepDefaults {
  id?: string;
  title?: string;
  description?: string;
  image?: string | null;
  order?: number;
}

export default function ServiceStepForm({
  action,
  serviceId,
  defaults,
  submitLabel,
}: {
  action: (formData: FormData) => void;
  serviceId: string;
  defaults?: ServiceStepDefaults;
  submitLabel: string;
}) {
  return (
    <form action={action} className="bg-white border border-gray-100 rounded-2xl p-6 flex flex-col gap-4 max-w-xl">
      {defaults?.id && <input type="hidden" name="id" value={defaults.id} />}
      <input type="hidden" name="serviceId" value={serviceId} />

      <AdminInput label="Titlu pas" name="title" required defaultValue={defaults?.title} placeholder="Consultare" />
      <AdminTextarea
        label="Descriere"
        name="description"
        required
        defaultValue={defaults?.description}
        placeholder="Analizăm nevoile tale și îți recomandăm soluția optimă pentru spațiul tău."
      />
      <ImageUploadField name="image" label="Imagine pas" defaultValue={defaults?.image} />
      <AdminInput label="Ordine" name="order" type="number" defaultValue={defaults?.order ?? 0} />

      <button
        type="submit"
        className="self-start bg-[#c7092b] hover:bg-[#a5071f] text-white font-bold px-6 py-2.5 rounded-xl transition-colors text-sm uppercase tracking-wide mt-2"
      >
        {submitLabel}
      </button>
    </form>
  );
}
