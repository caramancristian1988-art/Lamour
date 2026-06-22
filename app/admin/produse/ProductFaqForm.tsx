import { AdminInput, AdminTextarea } from "../components/AdminField";

interface ProductFaqDefaults {
  id?: string;
  question?: string;
  answer?: string;
  order?: number;
}

export default function ProductFaqForm({
  action,
  productId,
  defaults,
  submitLabel,
}: {
  action: (formData: FormData) => void;
  productId: string;
  defaults?: ProductFaqDefaults;
  submitLabel: string;
}) {
  return (
    <form action={action} className="bg-white border border-gray-100 rounded-2xl p-6 flex flex-col gap-4 max-w-xl">
      {defaults?.id && <input type="hidden" name="id" value={defaults.id} />}
      <input type="hidden" name="productId" value={productId} />

      <AdminInput label="Întrebare" name="question" required defaultValue={defaults?.question} placeholder="Cât consum de energie are acest model?" />
      <AdminTextarea label="Răspuns" name="answer" required defaultValue={defaults?.answer} placeholder="Aparatul are clasă energetică A++, consum redus..." rows={3} />
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
