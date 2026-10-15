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

/** ID-ul grupului principal (cel cu notificările comenzilor pentru operatori). */
export function mainGroupChatId(): string | null {
  return process.env.TELEGRAM_CHAT_ID?.trim() || null;
}

/**
 * Drepturile date tuturor membrilor unui grup (TelegramGroupPermission), sau null dacă grupul nu are o astfel de regulă.
 * Rândul cu chatId "principal" se aplică grupului principal.
 */
export async function getGroupPermissions(chatId: string): Promise<Set<RegistryPermission> | null> {
  try {
    const candidates = [chatId];
    if (chatId === mainGroupChatId()) candidates.push("principal");
    const rows = await prisma.telegramGroupPermission.findMany({ where: { chatId: { in: candidates } } });
    if (rows.length === 0) return null;
    return new Set<RegistryPermission>(rows.flatMap((r) => r.permissions).filter(isRegistryPermission));
  } catch (err) {
    console.error("telegram: nu am putut citi drepturile grupului:", err);
    return null;
  }
}

function expand(perms: Set<RegistryPermission>): Set<RegistryPermission> {
  // „administrare” le include pe toate.
  return perms.has("administrare") ? new Set(REGISTRY_PERMISSIONS.map((p) => p.value)) : perms;
}

/**
 * Drepturile unui utilizator: cele individuale + (dacă scrie într-un grup cu regulă) cele ale grupului.
 * Apartenența la un grup fără regulă NU dă niciun drept.
 */
export async function getUserPermissions(telegramUserId: string, groupPerms?: Set<RegistryPermission> | null): Promise<Set<RegistryPermission>> {
  if (envAdminIds().has(telegramUserId)) return new Set(REGISTRY_PERMISSIONS.map((p) => p.value));
  const perms = new Set<RegistryPermission>(groupPerms ?? []);
  try {
    const row = await prisma.telegramUserPermission.findUnique({ where: { telegramUserId } });
    for (const p of row?.permissions ?? []) if (isRegistryPermission(p)) perms.add(p);
  } catch (err) {
    console.error("telegram: nu am putut citi drepturile utilizatorului:", err);
  }
  return expand(perms);
}

export function permissionLabel(p: string): string {
  return REGISTRY_PERMISSIONS.find((x) => x.value === p)?.label ?? p;
}
