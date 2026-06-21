import { AdminInput, AdminTextarea } from "../components/AdminField";

interface ServiceTestimonialDefaults {
  id?: string;
  text?: string;
  name?: string;
  city?: string;
  initials?: string;
  order?: number;
}

export default function ServiceTestimonialForm({
  action,
  serviceId,
  defaults,
  submitLabel,
}: {
  action: (formData: FormData) => void;
  serviceId: string;
  defaults?: ServiceTestimonialDefaults;
  submitLabel: string;
}) {
  return (
    <form action={action} className="bg-white border border-gray-100 rounded-2xl p-6 flex flex-col gap-4 max-w-xl">
      {defaults?.id && <input type="hidden" name="id" value={defaults.id} />}
      <input type="hidden" name="serviceId" value={serviceId} />

      <AdminTextarea
        label="Recenzie"
        name="text"
        required
        defaultValue={defaults?.text}
        placeholder="Servicii excelente! Montajul a fost realizat rapid și foarte curat."
        rows={3}
      />
      <div className="grid grid-cols-2 gap-4">
        <AdminInput label="Nume" name="name" required defaultValue={defaults?.name} placeholder="Andrei M." />
        <AdminInput label="Oraș" name="city" required defaultValue={defaults?.city} placeholder="Chișinău" />
      </div>
      <AdminInput label="Inițiale" name="initials" required defaultValue={defaults?.initials} placeholder="AM" />
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
