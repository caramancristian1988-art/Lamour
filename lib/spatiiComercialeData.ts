import { prisma } from "@/lib/prisma";

export interface SpaceCharacteristic {
  label: string;
  value: string;
}

export interface SpaceListing {
  id: string;
  slug: string;
  type: string;
  title: string;
  priceLabel: string;
  price: number | null;
  area: number;
  location: string;
  image: string | null;
  description: string | null;
  characteristics: SpaceCharacteristic[];
}

export async function getSpaceListings(): Promise<SpaceListing[]> {
  try {
    return await prisma.spaceListing.findMany({ orderBy: [{ order: "asc" }, { createdAt: "desc" }] });
  } catch {
    return [];
  }
}

export async function getSpaceListingBySlug(slug: string): Promise<SpaceListing | null> {
  try {
    return await prisma.spaceListing.findUnique({ where: { slug } });
  } catch {
    return null;
  }
}

export function mapsSearchUrl(location: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`;
}
