// Drepturile utilizatorilor Telegram asupra registrului de comenzi. Identitatea e ID-ul Telegram (from.id) —
// NU numele afișat și NU simpla apartenență la grup: oricine intră în grup ar putea altfel vedea date personale.
//
// Surse (în ordine):
//   1. TELEGRAM_REGISTRY_ADMIN_IDS — lista de ID-uri (separate prin virgulă) cu toate drepturile; bootstrap, ca
//      să existe un prim administrator înainte de a configura permisiuni din /admin/telegram.
//   2. Tabela TelegramUserPermission — drepturi per utilizator, editate din /admin/telegram.
import { prisma } from "./prisma";

export const REGISTRY_PERMISSIONS = [
  { value: "vizualizare", label: "Vizualizare notificări și liste (fără date personale)" },
  { value: "consultare", label: "Consultare detalii comandă (fără telefon/adresă)" },
  { value: "date_personale", label: "Date personale: telefon și adresă, doar în privat" },
  { value: "extragere", label: "Extragere Excel (primește fișierul complet, cu date personale)" },
  { value: "confirmare", label: "Confirmare / anulare extragere" },
  { value: "administrare", label: "Administrare (toate drepturile)" },
] as const;

export type RegistryPermission = (typeof REGISTRY_PERMISSIONS)[number]["value"];

export function isRegistryPermission(value: string): value is RegistryPermission {
  return REGISTRY_PERMISSIONS.some((p) => p.value === value);
}

function envAdminIds(): Set<string> {
  return new Set(
    (process.env.TELEGRAM_REGISTRY_ADMIN_IDS ?? "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
  );
}

export async function getUserPermissions(telegramUserId: string): Promise<Set<RegistryPermission>> {
  if (envAdminIds().has(telegramUserId)) return new Set(REGISTRY_PERMISSIONS.map((p) => p.value));
  try {
    const row = await prisma.telegramUserPermission.findUnique({ where: { telegramUserId } });
    const perms = new Set<RegistryPermission>((row?.permissions ?? []).filter(isRegistryPermission));
    // „administrare” le include pe toate.
    if (perms.has("administrare")) return new Set(REGISTRY_PERMISSIONS.map((p) => p.value));
    return perms;
  } catch (err) {
    console.error("telegram: nu am putut citi drepturile utilizatorului:", err);
    return new Set();
  }
}

export function permissionLabel(p: string): string {
  return REGISTRY_PERMISSIONS.find((x) => x.value === p)?.label ?? p;
}
