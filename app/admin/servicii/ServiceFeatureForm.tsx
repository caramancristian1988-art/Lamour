import { AdminInput, AdminTextarea, AdminSelect } from "../components/AdminField";
import { ICON_OPTIONS } from "@/app/components/ServiceFeatureIcon";
import { Card, CardContent } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";

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
    <Card className="max-w-xl">
      <CardContent className="p-6">
        <form action={action} className="flex flex-col gap-4">
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

          <AdminSelect label="Iconiță" name="icon" defaultValue={defaults?.icon ?? "award"}>
            {ICON_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </AdminSelect>

          <AdminInput label="Ordine" name="order" type="number" defaultValue={defaults?.order ?? 0} />

          <Button type="submit" variant="accent" className="self-start mt-2">
            {submitLabel}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
