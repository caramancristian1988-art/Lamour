import { prisma } from "@/lib/prisma";
import AdminPageHeader from "../components/AdminPageHeader";
import { AdminInput, AdminTextarea } from "../components/AdminField";
import { updateSettingsAction } from "@/lib/adminSettingsActions";

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
          <label className="flex items-center justify-between gap-3 border border-gray-200 rounded-xl px-4 py-3.5 cursor-pointer">
            <span>
              <span className="block text-sm font-bold text-[#1d2353]">Activează secțiunea Proiecte</span>
              <span className="block text-xs text-gray-500 mt-0.5">Afișează pagina /proiecte și linkul din meniu pe site.</span>
            </span>
            <input
              type="checkbox"
              name="proiecteEnabled"
              defaultChecked={settings?.proiecteEnabled ?? false}
              className="w-5 h-5 rounded border-gray-300 text-[#c7092b] focus:ring-[#c7092b] accent-[#c7092b] shrink-0"
            />
          </label>
        </div>

        <button type="submit" className="self-start bg-[#c7092b] hover:bg-[#a5071f] text-white font-bold px-6 py-2.5 rounded-xl transition-colors text-sm uppercase tracking-wide">
          Salvează setările
        </button>
      </form>
    </div>
  );
}
