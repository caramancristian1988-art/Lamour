import { AdminInput, AdminTextarea, AdminSelect } from "../components/AdminField";
import ImageUploadField from "../components/ImageUploadField";
import { Card, CardContent } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";

interface ServiceDefaults {
  id?: string;
  title?: string;
  description?: string;
  image?: string | null;
  detailImage?: string | null;
  heroImageDesktop?: string | null;
  href?: string | null;
  section?: string;
}

export default function ServiceForm({
  action,
  defaults,
  submitLabel,
}: {
  action: (formData: FormData) => void;
  defaults?: ServiceDefaults;
  submitLabel: string;
}) {
  return (
    <Card className="max-w-xl">
      <CardContent className="p-6">
        <form action={action} className="flex flex-col gap-4">
          {defaults?.id && <input type="hidden" name="id" value={defaults.id} />}

          <AdminInput label="Titlu" name="title" required defaultValue={defaults?.title} placeholder="Instalare condiționere" />
          <AdminTextarea
            label="Descriere"
            name="description"
            required
            defaultValue={defaults?.description}
            placeholder="Montaj rapid și sigur pentru apartamente, case, birouri și spații comerciale."
          />
          <ImageUploadField name="image" label="Imagine (card listă servicii)" defaultValue={defaults?.image} />
          <ImageUploadField name="detailImage" label="Imagine hero (mobil) + secțiunea Despre serviciu" defaultValue={defaults?.detailImage} />
          <ImageUploadField name="heroImageDesktop" label="Imagine hero (calculator/desktop)" defaultValue={defaults?.heroImageDesktop} />
          <AdminInput label="Link (href)" name="href" defaultValue={defaults?.href ?? ""} placeholder="/servicii/instalare" />

          <AdminSelect label="Secțiune" name="section" defaultValue={defaults?.section ?? "principale"}>
            <option value="principale">Principale</option>
            <option value="avansate">Avansate</option>
            <option value="suplimentare">Suplimentare</option>
          </AdminSelect>

          <Button type="submit" variant="accent" className="self-start mt-2">
            {submitLabel}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
