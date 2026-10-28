import { PrismaClient } from "@prisma/client";
import { withSiteSync } from "./siteSyncEnqueue";

// Clientul de bază + extensia „site-sync": cât timp CRM_SYNC_KEY lipsește, extensia nu face nimic (zero efect asupra site-ului);
// când e setată, orice scriere de produs / categorie / comandă din coș lasă un eveniment în coada către CRM (lib/siteSyncEnqueue.ts).
function createClient() {
  return withSiteSync(new PrismaClient());
}

const globalForPrisma = globalThis as unknown as { prisma: ReturnType<typeof createClient> };

export const prisma = globalForPrisma.prisma ?? createClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
