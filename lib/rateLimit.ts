// Limitare simplă a cererilor pentru acțiunile publice (comandă/contact, recenzii, newsletter, login),
// bazată pe baza de date — pe serverless un contor în memorie nu se împarte între instanțe, deci nu ajută.
// Fail-open: dacă baza de date nu răspunde, cererea trece (mai bine un spam ocazional decât un client blocat).
import { headers } from "next/headers";
import { prisma } from "./prisma";

// Adresa clientului, așa cum o raportează platforma (Vercel setează x-forwarded-for; primul element e clientul).
export async function getClientIp(): Promise<string> {
  try {
    const h = await headers();
    const forwarded = h.get("x-forwarded-for")?.split(",")[0]?.trim();
    return forwarded || h.get("x-real-ip") || "necunoscut";
  } catch {
    return "necunoscut";
  }
}

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

/**
 * Întoarce true dacă cererea e permisă (și o înregistrează), false dacă `key` a depășit `limit` cereri în `windowMs`.
 * Limitele sunt generoase intenționat: multe rețele mobile (CGNAT) împart aceeași adresă IP între mulți clienți.
 */
export async function allowRequest(key: string, limit: number, windowMs: number): Promise<boolean> {
  try {
    const since = new Date(Date.now() - windowMs);
    const recent = await prisma.rateLimitHit.count({ where: { key, createdAt: { gte: since } } });
    if (recent >= limit) return false;
    await prisma.rateLimitHit.create({ data: { key } });

    // Curățare ocazională a înregistrărilor vechi (nu avem TTL nativ prin Prisma pe MongoDB).
    if (Math.random() < 0.02) {
      await prisma.rateLimitHit.deleteMany({ where: { createdAt: { lt: new Date(Date.now() - WEEK_MS) } } });
    }
    return true;
  } catch (err) {
    console.error("rateLimit: verificarea a eșuat, cererea este permisă:", err);
    return true;
  }
}

export const TOO_MANY_REQUESTS = "Prea multe încercări într-un timp scurt. Te rugăm să încerci din nou peste câteva minute.";
