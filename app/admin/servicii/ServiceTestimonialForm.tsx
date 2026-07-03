import { AdminInput, AdminTextarea } from "../components/AdminField";
import { Card, CardContent } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";

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
    <Card className="max-w-xl">
      <CardContent className="p-6">
        <form action={action} className="flex flex-col gap-4">
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

          <Button type="submit" variant="accent" className="self-start mt-2">
            {submitLabel}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
