import { AdminInput, AdminTextarea } from "../components/AdminField";
import { Button } from "@/app/components/ui/button";

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
    <form action={action} className="bg-card border border-border rounded-2xl p-6 flex flex-col gap-4 max-w-xl">
      {defaults?.id && <input type="hidden" name="id" value={defaults.id} />}
      <input type="hidden" name="productId" value={productId} />

      <AdminInput label="Întrebare" name="question" required defaultValue={defaults?.question} placeholder="Cât consum de energie are acest model?" />
      <AdminTextarea label="Răspuns" name="answer" required defaultValue={defaults?.answer} placeholder="Aparatul are clasă energetică A++, consum redus..." rows={3} />
      <AdminInput label="Ordine" name="order" type="number" defaultValue={defaults?.order ?? 0} />

      <Button type="submit" variant="accent" className="self-start mt-2">
        {submitLabel}
      </Button>
    </form>
  );
}
