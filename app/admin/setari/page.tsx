import { prisma } from "@/lib/prisma";
import AdminPageHeader from "../components/AdminPageHeader";
import { AdminInput, AdminTextarea } from "../components/AdminField";
import SaveButton from "../components/SaveButton";
import { updateSettingsAction } from "@/lib/adminSettingsActions";

const SECTION_TOGGLES = [
  { name: "produseEnabled", label: "Produse", description: "Listele de produse, paginile de categorie și de detaliu." },
  { name: "serviciiEnabled", label: "Servicii", description: "Pagina de servicii și sub-paginile ei." },
  { name: "proiecteEnabled", label: "Proiecte", description: "Portofoliul de proiecte realizate." },
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

export default async function AdminSetariPage() {
  const settings = await getSettings();

  return (
    <div>
      <AdminPageHeader title="Setări" description="Datele companiei și SEO global, folosite pe tot site-ul." />

      <form action={updateSettingsAction} className="bg-white border border-gray-100 rounded-2xl p-6 flex flex-col gap-6 max-w-2xl">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-wide text-[#1d2353] mb-3">Date companie</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <AdminInput label="Telefon" name="phone" defaultValue={settings?.phone ?? ""} placeholder="+373 69 000 000" />
            <AdminInput label="Email" name="email" type="email" defaultValue={settings?.email ?? ""} placeholder="contact@climatrapid.md" />
          </div>
          <div className="mt-4">
            <AdminInput label="Adresă" name="address" defaultValue={settings?.address ?? ""} placeholder="Chișinău, Moldova" />
          </div>
        </div>

        <div>
          <p className="text-xs font-extrabold uppercase tracking-wide text-[#1d2353] mb-3">Rețele sociale</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <AdminInput label="Link Facebook" name="facebook" defaultValue={settings?.facebook ?? ""} placeholder="https://facebook.com/climatrapid" />
            <AdminInput label="Link Instagram" name="instagram" defaultValue={settings?.instagram ?? ""} placeholder="https://instagram.com/climatrapid" />
          </div>
        </div>

        <div>
          <p className="text-xs font-extrabold uppercase tracking-wide text-[#1d2353] mb-3">SEO global</p>
          <div className="flex flex-col gap-4">
            <AdminInput label="Titlu SEO" name="seoTitle" defaultValue={settings?.seoTitle ?? ""} placeholder="Climat Rapid — Condiționere & Climatizare Moldova" />
            <AdminTextarea label="Descriere SEO" name="seoDescription" defaultValue={settings?.seoDescription ?? ""} placeholder="Magazin online de condiționere și sisteme de climatizare în Moldova." rows={3} />
          </div>
        </div>

        <div>
          <p className="text-xs font-extrabold uppercase tracking-wide text-[#1d2353] mb-3">Secțiuni site</p>
          <p className="text-xs text-gray-400 mb-3">Dezactivează o secțiune ca să nu mai fie accesibilă pe site (pagina dă 404 și linkul din meniu e ascuns).</p>
          <div className="flex flex-col gap-2.5">
            {SECTION_TOGGLES.map((section) => (
              <label
                key={section.name}
                className="flex items-center justify-between gap-3 border border-gray-200 rounded-xl px-4 py-3.5 cursor-pointer"
              >
                <span>
                  <span className="block text-sm font-bold text-[#1d2353]">{section.label}</span>
                  <span className="block text-xs text-gray-500 mt-0.5">{section.description}</span>
                </span>
                <input
                  type="checkbox"
                  name={section.name}
                  defaultChecked={settings?.[section.name] ?? (section.name === "proiecteEnabled" ? false : true)}
                  className="w-5 h-5 rounded border-gray-300 text-[#c7092b] focus:ring-[#c7092b] accent-[#c7092b] shrink-0"
                />
              </label>
            ))}
          </div>
        </div>

        <SaveButton />
      </form>
    </div>
  );
}
