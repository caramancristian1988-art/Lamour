import { AdminInput } from "../components/AdminField";
import BannerImagePositionField from "./BannerImagePositionField";
import { Button } from "@/app/components/ui/button";

interface BannerDefaults {
  id?: string;
  image?: string;
  alt?: string;
  title?: string | null;
  subtitle?: string | null;
  ctaLabel?: string | null;
  ctaPositionX?: number;
  ctaPositionY?: number;
  link?: string | null;
  order?: number;
}

export default function BannerForm({
  action,
  defaults,
  submitLabel,
}: {
  action: (formData: FormData) => void;
  defaults?: BannerDefaults;
  submitLabel: string;
}) {
  return (
    <form action={action} className="bg-card border border-border rounded-2xl p-6 flex flex-col gap-4 max-w-xl">
      {defaults?.id && <input type="hidden" name="id" value={defaults.id} />}

      <BannerImagePositionField
        imageDefault={defaults?.image}
        ctaLabelDefault={defaults?.ctaLabel}
        posXDefault={defaults?.ctaPositionX}
        posYDefault={defaults?.ctaPositionY}
      />
      <AdminInput
        label="Text alternativ"
        name="alt"
        required
        defaultValue={defaults?.alt}
        placeholder="Ofertă de vară -20% la hârtie igienică"
      />
      <AdminInput
        label="Titlu (opțional, afișat suprapus pe banner)"
        name="title"
        defaultValue={defaults?.title ?? ""}
        placeholder="Oferte speciale"
      />
      <AdminInput
        label="Subtitlu (opțional)"
        name="subtitle"
        defaultValue={defaults?.subtitle ?? ""}
        placeholder="pentru confortul fiecărei familii!"
      />
      <AdminInput
        label="Text buton (opțional)"
        name="ctaLabel"
        defaultValue={defaults?.ctaLabel ?? ""}
        placeholder="Vezi ofertele"
      />
      <AdminInput
        label="Link (opțional)"
        name="link"
        defaultValue={defaults?.link ?? ""}
        placeholder="/produse?oferte=1"
      />
      <AdminInput label="Ordine" name="order" type="number" defaultValue={defaults?.order ?? 0} />

      <Button type="submit" variant="accent" className="self-start mt-2">
        {submitLabel}
      </Button>
    </form>
  );
}
