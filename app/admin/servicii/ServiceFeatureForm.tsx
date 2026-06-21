import { AdminInput, AdminTextarea } from "../components/AdminField";
import { ICON_OPTIONS } from "@/app/components/ServiceFeatureIcon";

interface ServiceFeatureDefaults {
  id?: string;
  title?: string;
  description?: string;
  icon?: string;
  order?: number;
}

export default function ServiceFeatureForm({
  action,
  serviceId,
  defaults,
  submitLabel,
}: {
  action: (formData: FormData) => void;
  serviceId: string;
  defaults?: ServiceFeatureDefaults;
  submitLabel: string;
}) {
  return (
    <form action={action} className="bg-white border border-gray-100 rounded-2xl p-6 flex flex-col gap-4 max-w-xl">
      {defaults?.id && <input type="hidden" name="id" value={defaults.id} />}
      <input type="hidden" name="serviceId" value={serviceId} />

      <AdminInput label="Titlu" name="title" required defaultValue={defaults?.title} placeholder="Garanție inclusă" />
      <AdminTextarea
        label="Descriere"
        name="description"
        required
        defaultValue={defaults?.description}
        placeholder="Oferim garanție pentru manoperă și echipamente."
        rows={2}
      />

      <label className="flex flex-col gap-1.5">
        <span className="text-xs font-bold text-gray-600">Iconiță</span>
        <select
          name="icon"
          defaultValue={defaults?.icon ?? "award"}
          className="border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#c7092b]"
        >
          {ICON_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </label>

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
