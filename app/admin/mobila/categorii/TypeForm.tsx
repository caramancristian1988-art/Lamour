import { AdminInput } from "../../components/AdminField";
import { Button } from "@/app/components/ui/button";

interface TypeDefaults {
  id?: string;
  name?: string;
}

export default function TypeForm({
  action,
  defaults,
  submitLabel,
}: {
  action: (formData: FormData) => void;
  defaults?: TypeDefaults;
  submitLabel: string;
}) {
  return (
    <form action={action} className="bg-card border border-border rounded-2xl p-6 flex flex-col gap-4">
      {defaults?.id && <input type="hidden" name="id" value={defaults.id} />}
      <AdminInput label="Nume tip" name="name" required defaultValue={defaults?.name} placeholder="Terasă" />
      <Button type="submit" variant="accent" className="self-start mt-2">
        {submitLabel}
      </Button>
    </form>
  );
}
