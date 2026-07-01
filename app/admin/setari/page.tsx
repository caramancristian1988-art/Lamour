import { prisma } from "@/lib/prisma";
import AdminPageHeader from "../components/AdminPageHeader";
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
      <AdminPageHeader title="Setări" description="Secțiunile active pe site." />

      <form action={updateSettingsAction} className="bg-white border border-gray-100 rounded-2xl p-6 flex flex-col gap-6 max-w-2xl">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-wide text-[#1d2353] mb-3">Date de contact</p>
          <p className="text-xs text-gray-400 mb-3">
            Telefonul și emailul afișate peste tot pe site (bara de sus, butonul flotant, paginile de servicii și contact),
            plus linkurile WhatsApp și Viber, generate automat din același număr.
          </p>
          <div className="flex flex-col gap-2.5">
            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-bold text-[#1d2353]">Telefon</span>
              <input
                type="tel"
                name="phone"
                defaultValue={settings?.phone ?? "+373 69 000 000"}
                placeholder="+373 69 000 000"
                className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#c7092b]"
              />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-bold text-[#1d2353]">Email</span>
              <input
                type="email"
                name="email"
                defaultValue={settings?.email ?? "contact@climatrapid.md"}
                placeholder="contact@climatrapid.md"
                className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#c7092b]"
              />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-bold text-[#1d2353]">Adresă</span>
              <input
                type="text"
                name="address"
                defaultValue={settings?.address ?? ""}
                placeholder="Str. Exemplu 1, Chișinău, Moldova"
                className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#c7092b]"
              />
            </label>
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

        <div>
          <p className="text-xs font-extrabold uppercase tracking-wide text-[#1d2353] mb-3">Funcționalități</p>
          <label className="flex items-center justify-between gap-3 border border-gray-200 rounded-xl px-4 py-3.5 cursor-pointer">
            <span>
              <span className="block text-sm font-bold text-[#1d2353]">Plata în rate</span>
              <span className="block text-xs text-gray-500 mt-0.5">
                Dezactivează ca să dispară butonul &quot;Cumpără în rate&quot; și estimarea lunară de pe toate produsele,
                indiferent de setarea individuală a fiecărui produs.
              </span>
            </span>
            <input
              type="checkbox"
              name="ratesEnabled"
              defaultChecked={settings?.ratesEnabled ?? true}
              className="w-5 h-5 rounded border-gray-300 text-[#c7092b] focus:ring-[#c7092b] accent-[#c7092b] shrink-0"
            />
          </label>

          <label className="flex items-center justify-between gap-3 border border-gray-200 rounded-xl px-4 py-3.5 mt-2.5">
            <span>
              <span className="block text-sm font-bold text-[#1d2353]">Număr de rate</span>
              <span className="block text-xs text-gray-500 mt-0.5">
                Numărul de luni folosit la calculul estimării lunare (ex: preț ÷ {settings?.installmentMonths ?? 4} = lei/lună).
              </span>
            </span>
            <input
              type="number"
              name="installmentMonths"
              min={1}
              max={60}
              defaultValue={settings?.installmentMonths ?? 4}
              className="w-20 border border-gray-300 rounded-lg px-3 py-2 text-sm text-center focus:outline-none focus:border-[#c7092b] shrink-0"
            />
          </label>
          <label className="flex items-center justify-between gap-3 border border-gray-200 rounded-xl px-4 py-3.5 mt-2.5">
            <span>
              <span className="block text-sm font-bold text-[#1d2353]">Cronometru popup (minute)</span>
              <span className="block text-xs text-gray-500 mt-0.5">
                Numărul de minute afișat la countdown-ul din popup-ul de oferte speciale.
              </span>
            </span>
            <input
              type="number"
              name="popupCountdownMinutes"
              min={1}
              max={120}
              defaultValue={settings?.popupCountdownMinutes ?? 10}
              className="w-20 border border-gray-300 rounded-lg px-3 py-2 text-sm text-center focus:outline-none focus:border-[#c7092b] shrink-0"
            />
          </label>
        </div>

        <div>
          <p className="text-xs font-extrabold uppercase tracking-wide text-[#1d2353] mb-3">Rețele sociale</p>
          <p className="text-xs text-gray-400 mb-3">Linkurile către care duc iconițele din footer. Lasă gol ca să ascunzi o iconiță.</p>
          <div className="flex flex-col gap-2.5">
            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-bold text-[#1d2353]">Facebook</span>
              <input
                type="url"
                name="facebook"
                defaultValue={settings?.facebook ?? ""}
                placeholder="https://www.facebook.com/..."
                className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#c7092b]"
              />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-bold text-[#1d2353]">Instagram</span>
              <input
                type="url"
                name="instagram"
                defaultValue={settings?.instagram ?? "https://www.instagram.com/climatrapid_srl/"}
                placeholder="https://www.instagram.com/..."
                className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#c7092b]"
              />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-bold text-[#1d2353]">TikTok</span>
              <input
                type="url"
                name="tiktok"
                defaultValue={settings?.tiktok ?? ""}
                placeholder="https://www.tiktok.com/@..."
                className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#c7092b]"
              />
            </label>
          </div>
        </div>

        <SaveButton />
      </form>
    </div>
  );
}
