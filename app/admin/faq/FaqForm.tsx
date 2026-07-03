import { AdminInput, AdminTextarea } from "../components/AdminField";
import { Button } from "@/app/components/ui/button";

interface FaqDefaults {
  id?: string;
  question?: string;
  answer?: string;
  order?: number;
}

export default function FaqForm({
  action,
  defaults,
  submitLabel,
}: {
  action: (formData: FormData) => void;
  defaults?: FaqDefaults;
  submitLabel: string;
}) {
  return (
    <form action={action} className="bg-card border border-border rounded-2xl p-6 flex flex-col gap-4">
      {defaults?.id && <input type="hidden" name="id" value={defaults.id} />}

      <AdminInput label="Întrebare" name="question" required defaultValue={defaults?.question} placeholder="Cât durează instalarea unui aparat de aer condiționat?" />
      <AdminTextarea label="Răspuns" name="answer" required defaultValue={defaults?.answer} placeholder="Instalarea durează în medie 2-3 ore, în funcție de complexitatea sistemului." rows={4} />
      <AdminInput label="Ordine" name="order" type="number" defaultValue={defaults?.order ?? 0} placeholder="0" />

      <Button type="submit" variant="accent" className="self-start mt-2">
        {submitLabel}
      </Button>
    </form>
  );
}
