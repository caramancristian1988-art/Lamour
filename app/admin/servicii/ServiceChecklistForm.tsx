import { AdminInput } from "../components/AdminField";

interface ServiceChecklistDefaults {
  id?: string;
  text?: string;
  order?: number;
}

export default function ServiceChecklistForm({
  action,
  serviceId,
  defaults,
  submitLabel,
}: {
  action: (formData: FormData) => void;
  serviceId: string;
  defaults?: ServiceChecklistDefaults;
  submitLabel: string;
}) {
  return (
    <form action={action} className="bg-white border border-gray-100 rounded-2xl p-6 flex flex-col gap-4 max-w-xl">
      {defaults?.id && <input type="hidden" name="id" value={defaults.id} />}
      <input type="hidden" name="serviceId" value={serviceId} />

      <AdminInput label="Text" name="text" required defaultValue={defaults?.text} placeholder="Verificare completă și testare sistem" />
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
