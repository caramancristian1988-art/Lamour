import { prisma } from "@/lib/prisma";
import { REGISTRY_PERMISSIONS } from "@/lib/telegramPermissions";
import {
  saveTelegramUserPermissionAction,
  deleteTelegramUserPermissionAction,
  saveTelegramGroupPermissionAction,
  deleteTelegramGroupPermissionAction,
} from "@/lib/telegramPermissionActions";

async function getEntries() {
  try {
    return await prisma.telegramUserPermission.findMany({ orderBy: { createdAt: "asc" } });
  } catch {
    return [];
  }
}

async function getGroupEntries() {
  try {
    return await prisma.telegramGroupPermission.findMany({ orderBy: { createdAt: "asc" } });
  } catch {
    return [];
  }
}

function PermissionBoxes({ idPrefix, selected, hideAdmin = false }: { idPrefix: string; selected: string[]; hideAdmin?: boolean }) {
  return (
    <fieldset className="mt-3">
      <legend className="text-sm font-bold text-primary">Drepturi</legend>
      <div className="mt-1 flex flex-col gap-1.5">
        {REGISTRY_PERMISSIONS.filter((p) => !(hideAdmin && p.value === "administrare")).map((p) => (
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
  const groupEntries = await getGroupEntries();

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

      <section aria-labelledby="grup-titlu" className="mt-4 bg-card border border-border rounded-2xl p-4">
        <h3 id="grup-titlu" className="text-base font-bold text-primary">
          Drepturi pentru toți membrii unui grup
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          Ca să nu adaugi ID-ul fiecărei persoane: oricine scrie în grupul ales primește aceste drepturi. În <b>grupul principal</b>{" "}
          (cel cu notificările comenzilor) fișierul Excel și detaliile comenzii se trimit direct în grup, unde telefonul și adresa sunt
          oricum vizibile tuturor membrilor. Dacă ai nevoie de restricții, folosește drepturile individuale de mai jos.
        </p>

        {groupEntries.length > 0 && (
          <ul className="mt-3 flex flex-col gap-3">
            {groupEntries.map((g) => (
              <li key={g.id} className="border border-border rounded-xl p-3">
                <form action={saveTelegramGroupPermissionAction}>
                  <input type="hidden" name="chatId" value={g.chatId} />
                  <input type="hidden" name="name" value={g.name} />
                  <h4 className="text-sm font-bold text-primary">
                    {g.name} <span className="font-normal text-muted-foreground">({g.chatId === "principal" ? "grupul principal" : `ID grup ${g.chatId}`})</span>
                  </h4>
                  <PermissionBoxes idPrefix={`g-${g.id}`} selected={g.permissions} hideAdmin />
                  <button type="submit" className="mt-3 h-11 px-5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold">
                    Salvează drepturile grupului {g.name}
                  </button>
                </form>
                <form action={deleteTelegramGroupPermissionAction} className="mt-2">
                  <input type="hidden" name="chatId" value={g.chatId} />
                  <button type="submit" className="h-11 px-5 rounded-xl border-2 border-destructive text-destructive text-sm font-semibold">
                    Elimină regula pentru {g.name}
                  </button>
                </form>
              </li>
            ))}
          </ul>
        )}

        <form action={saveTelegramGroupPermissionAction} className="mt-4">
          <h4 className="text-sm font-bold text-primary">Adaugă sau schimbă regula unui grup</h4>
          <div className="mt-2 flex flex-wrap gap-4">
            <div className="flex flex-col gap-1">
              <label htmlFor="grup-id" className="text-sm font-bold text-primary">ID grup (scrie „principal” pentru grupul principal)</label>
              <input id="grup-id" name="chatId" defaultValue="principal" required className="h-11 rounded-xl border-2 border-input bg-card px-3 text-sm w-64" />
            </div>
            <div className="flex flex-col gap-1">
              <label htmlFor="grup-nume" className="text-sm font-bold text-primary">Nume (pentru tine)</label>
              <input id="grup-nume" name="name" defaultValue="Grupul principal" className="h-11 rounded-xl border-2 border-input bg-card px-3 text-sm w-56" />
            </div>
          </div>
          <PermissionBoxes idPrefix="grup-nou" selected={["vizualizare", "consultare", "date_personale", "extragere", "confirmare"]} hideAdmin />
          <button type="submit" className="mt-3 h-11 px-5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold">
            Salvează regula grupului
          </button>
        </form>
      </section>

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
