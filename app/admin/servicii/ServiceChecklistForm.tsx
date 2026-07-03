import { AdminInput } from "../components/AdminField";
import { Card, CardContent } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";

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
    <Card className="max-w-xl">
      <CardContent className="p-6">
        <form action={action} className="flex flex-col gap-4">
          {defaults?.id && <input type="hidden" name="id" value={defaults.id} />}
          <input type="hidden" name="serviceId" value={serviceId} />

          <AdminInput label="Text" name="text" required defaultValue={defaults?.text} placeholder="Verificare completă și testare sistem" />
          <AdminInput label="Ordine" name="order" type="number" defaultValue={defaults?.order ?? 0} />

          <Button type="submit" variant="accent" className="self-start mt-2">
            {submitLabel}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
