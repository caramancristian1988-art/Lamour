import { Check } from "lucide-react";
import { prisma } from "@/lib/prisma";
import AdminPageHeader from "../components/AdminPageHeader";
import SaveButton from "../components/SaveButton";
import { AdminInput } from "../components/AdminField";
import { Switch } from "@/app/components/ui/switch";
import { Label } from "@/app/components/ui/label";
import { Alert, AlertDescription } from "@/app/components/ui/alert";
import { updateSettingsAction } from "@/lib/adminSettingsActions";

const SECTION_TOGGLES = [
  { name: "produseEnabled", label: "Produse", description: "Listele de produse, paginile de categorie și de detaliu." },
  { name: "despreEnabled", label: "Despre noi", description: "Pagina de prezentare a companiei." },
  { name: "blogEnabled", label: "Blog", description: "Articolele de blog și paginile de categorie." },
  { name: "contactEnabled", label: "Contact", description: "Pagina de contact și formularul." },
] as const;

async function getSettings() {
  try {
    return await prisma.settings.findFirst();
  } catch {
    return null;
  }
}

export default async function AdminSetariPage({
  searchParams,
}: {
  searchParams: Promise<{ salvat?: string }>;
}) {
  const settings = await getSettings();
  const { salvat } = await searchParams;

  return (
    <div>
      <AdminPageHeader title="Setări" description="Secțiunile active pe site." />

      {salvat === "1" && (
        <Alert variant="success" role="status" className="max-w-2xl mb-4 animate-slide-up">
          <Check aria-hidden />
          <AlertDescription>Setările au fost salvate cu succes.</AlertDescription>
        </Alert>
      )}

      <form action={updateSettingsAction} className="bg-card border border-border rounded-2xl p-6 flex flex-col gap-6 max-w-2xl">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-wide text-primary mb-3">Date de contact</p>
          <p className="text-xs text-muted-foreground mb-3">
            Telefonul și emailul afișate peste tot pe site (bara de sus, butonul flotant, pagina de contact),
            plus linkurile WhatsApp și Viber, generate automat din același număr.
          </p>
          <div className="flex flex-col gap-3">
            <AdminInput label="Telefon" name="phone" type="tel" defaultValue={settings?.phone ?? "+373 69 000 000"} placeholder="+373 69 000 000" />
            <AdminInput label="Email" name="email" type="email" defaultValue={settings?.email ?? ""} placeholder="contact@exemplu.md" />
            <AdminInput label="Adresă" name="address" defaultValue={settings?.address ?? ""} placeholder="Str. Exemplu 1, Chișinău, Moldova" />
          </div>
        </div>

        <div>
          <p className="text-xs font-extrabold uppercase tracking-wide text-primary mb-3">Secțiuni site</p>
          <p className="text-xs text-muted-foreground mb-3">Dezactivează o secțiune ca să nu mai fie accesibilă pe site (pagina dă 404 și linkul din meniu e ascuns).</p>
          <div className="flex flex-col gap-2.5">
            {SECTION_TOGGLES.map((section) => (
              <div key={section.name} className="flex items-center justify-between gap-3 border border-border rounded-xl px-4 py-3.5">
                <Label htmlFor={`field-${section.name}`} className="cursor-pointer font-normal">
                  <span className="block text-sm font-bold text-primary">{section.label}</span>
                  <span className="block text-xs text-muted-foreground mt-0.5">{section.description}</span>
                </Label>
                <Switch
                  id={`field-${section.name}`}
                  name={section.name}
                  defaultChecked={settings?.[section.name] ?? true}
                  className="shrink-0"
                />
              </div>
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs font-extrabold uppercase tracking-wide text-primary mb-3">Funcționalități</p>
          <div className="flex flex-col gap-2.5">
            <div className="flex items-center justify-between gap-3 border border-border rounded-xl px-4 py-3.5">
              <Label htmlFor="field-ratesEnabled" className="cursor-pointer font-normal">
                <span className="block text-sm font-bold text-primary">Plata în rate</span>
                <span className="block text-xs text-muted-foreground mt-0.5">
                  Dezactivează ca să dispară butonul &quot;Cumpără în rate&quot; și estimarea lunară de pe toate produsele,
                  indiferent de setarea individuală a fiecărui produs.
                </span>
              </Label>
              <Switch id="field-ratesEnabled" name="ratesEnabled" defaultChecked={settings?.ratesEnabled ?? true} className="shrink-0" />
            </div>

            <div className="flex items-center justify-between gap-3 border border-border rounded-xl px-4 py-3.5">
              <Label htmlFor="field-installmentMonths" className="cursor-pointer font-normal">
                <span className="block text-sm font-bold text-primary">Număr de rate</span>
                <span className="block text-xs text-muted-foreground mt-0.5">
                  Numărul de luni folosit la calculul estimării lunare (ex: preț ÷ {settings?.installmentMonths ?? 4} = lei/lună).
                </span>
              </Label>
              <input
                id="field-installmentMonths"
                type="number"
                name="installmentMonths"
                min={1}
                max={60}
                defaultValue={settings?.installmentMonths ?? 4}
                className="w-20 border-2 border-input rounded-lg px-3 py-2 text-sm text-center bg-card text-foreground focus-visible:outline-none focus-visible:border-accent focus-visible:ring-3 focus-visible:ring-accent/20 shrink-0"
              />
            </div>
            <div className="flex items-center justify-between gap-3 border border-border rounded-xl px-4 py-3.5">
              <Label htmlFor="field-popupCountdownMinutes" className="cursor-pointer font-normal">
                <span className="block text-sm font-bold text-primary">Cronometru popup (minute)</span>
                <span className="block text-xs text-muted-foreground mt-0.5">
                  Numărul de minute afișat la countdown-ul din popup-ul de oferte speciale.
                </span>
              </Label>
              <input
                id="field-popupCountdownMinutes"
                type="number"
                name="popupCountdownMinutes"
                min={1}
                max={120}
                defaultValue={settings?.popupCountdownMinutes ?? 10}
                className="w-20 border-2 border-input rounded-lg px-3 py-2 text-sm text-center bg-card text-foreground focus-visible:outline-none focus-visible:border-accent focus-visible:ring-3 focus-visible:ring-accent/20 shrink-0"
              />
            </div>
          </div>
        </div>

        <div>
          <p className="text-xs font-extrabold uppercase tracking-wide text-primary mb-3">Rețele sociale</p>
          <p className="text-xs text-muted-foreground mb-3">Linkurile către care duc iconițele din footer. Lasă gol ca să ascunzi o iconiță.</p>
          <div className="flex flex-col gap-3">
            <AdminInput label="Facebook" name="facebook" type="url" defaultValue={settings?.facebook ?? ""} placeholder="https://www.facebook.com/..." />
            <AdminInput label="Instagram" name="instagram" type="url" defaultValue={settings?.instagram ?? ""} placeholder="https://www.instagram.com/..." />
            <AdminInput label="TikTok" name="tiktok" type="url" defaultValue={settings?.tiktok ?? ""} placeholder="https://www.tiktok.com/@..." />
          </div>
        </div>

        <SaveButton />
      </form>
    </div>
  );
}
