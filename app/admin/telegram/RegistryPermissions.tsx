import { prisma } from "@/lib/prisma";
import { REGISTRY_PERMISSIONS } from "@/lib/telegramPermissions";
import { saveTelegramUserPermissionAction, deleteTelegramUserPermissionAction } from "@/lib/telegramPermissionActions";

async function getEntries() {
  try {
    return await prisma.telegramUserPermission.findMany({ orderBy: { createdAt: "asc" } });
  } catch {
    return [];
  }
}

function PermissionBoxes({ idPrefix, selected }: { idPrefix: string; selected: string[] }) {
  return (
    <fieldset className="mt-3">
      <legend className="text-sm font-bold text-primary">Drepturi</legend>
      <div className="mt-1 flex flex-col gap-1.5">
        {REGISTRY_PERMISSIONS.map((p) => (
          <label key={p.value} htmlFor={`${idPrefix}-${p.value}`} className="flex items-start gap-2 text-sm">
            <input
              id={`${idPrefix}-${p.value}`}
              type="checkbox"
              name="permissions"
              value={p.value}
              defaultChecked={selected.includes(p.value)}
              className="mt-1 h-4 w-4"
            />
            <span>{p.label}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

// Cine are voie să vadă și să extragă comenzile din registru, direct din Telegram. Identitatea e ID-ul Telegram
// (nu numele afișat); fără o intrare aici, un membru al grupului nu vede nimic și nu poate extrage nimic.
export default async function RegistryPermissions() {
  const entries = await getEntries();

  return (
    <section aria-labelledby="drepturi-titlu" className="mt-8 max-w-2xl">
      <h2 id="drepturi-titlu" className="text-xl font-extrabold text-primary">
        Registrul de comenzi în Telegram — drepturi
      </h2>
      <p className="text-sm text-muted-foreground mt-1">
        Persoana trimite comanda <b>/id</b> botului și îți spune numărul primit. Apartenența la grup nu dă niciun drept: datele personale și
        extragerea Excel se văd doar de cei trecuți mai jos. Primul administrator se poate seta din variabila de mediu{" "}
        <code>TELEGRAM_REGISTRY_ADMIN_IDS</code>.
      </p>

      {entries.length > 0 && (
        <ul className="mt-4 flex flex-col gap-4">
          {entries.map((e) => (
            <li key={e.id} className="bg-card border border-border rounded-2xl p-4">
              <form action={saveTelegramUserPermissionAction}>
                <input type="hidden" name="telegramUserId" value={e.telegramUserId} />
                <h3 className="text-base font-bold text-primary">
                  {e.name} <span className="font-normal text-muted-foreground">(ID Telegram {e.telegramUserId})</span>
                </h3>
                <div className="mt-2 flex flex-col gap-1">
                  <label htmlFor={`nume-${e.id}`} className="text-sm font-bold text-primary">Nume</label>
                  <input id={`nume-${e.id}`} name="name" defaultValue={e.name} required className="h-11 rounded-xl border-2 border-input bg-card px-3 text-sm max-w-xs" />
                </div>
                <PermissionBoxes idPrefix={`p-${e.id}`} selected={e.permissions} />
                <button type="submit" className="mt-3 h-11 px-5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold">
                  Salvează drepturile pentru {e.name}
                </button>
              </form>
              <form action={deleteTelegramUserPermissionAction} className="mt-2">
                <input type="hidden" name="telegramUserId" value={e.telegramUserId} />
                <button type="submit" className="h-11 px-5 rounded-xl border-2 border-destructive text-destructive text-sm font-semibold">
                  Elimină accesul lui {e.name}
                </button>
              </form>
            </li>
          ))}
        </ul>
      )}

      <form action={saveTelegramUserPermissionAction} className="mt-4 bg-card border border-border rounded-2xl p-4">
        <h3 className="text-base font-bold text-primary">Adaugă o persoană</h3>
        <div className="mt-2 flex flex-wrap gap-4">
          <div className="flex flex-col gap-1">
            <label htmlFor="nou-id" className="text-sm font-bold text-primary">ID Telegram (doar cifre)</label>
            <input id="nou-id" name="telegramUserId" inputMode="numeric" pattern="\d{3,15}" required className="h-11 rounded-xl border-2 border-input bg-card px-3 text-sm w-48" />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="nou-nume" className="text-sm font-bold text-primary">Nume</label>
            <input id="nou-nume" name="name" required className="h-11 rounded-xl border-2 border-input bg-card px-3 text-sm w-56" />
          </div>
        </div>
        <PermissionBoxes idPrefix="nou" selected={["vizualizare", "consultare"]} />
        <button type="submit" className="mt-3 h-11 px-5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold">
          Adaugă persoana
        </button>
      </form>
    </section>
  );
}
