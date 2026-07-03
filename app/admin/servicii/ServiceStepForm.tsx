import { AdminInput, AdminTextarea } from "../components/AdminField";
import ImageUploadField from "../components/ImageUploadField";
import { Card, CardContent } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";

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
    <Card className="max-w-xl">
      <CardContent className="p-6">
        <form action={action} className="flex flex-col gap-4">
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

          <Button type="submit" variant="accent" className="self-start mt-2">
            {submitLabel}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
