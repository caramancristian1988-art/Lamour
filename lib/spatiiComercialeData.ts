import { prisma } from "@/lib/prisma";

export interface SpaceCharacteristic {
  label: string;
  value: string;
}

export interface SpaceTypeOption {
  id: string;
  name: string;
  slug: string;
}

export interface SpaceListing {
  id: string;
  slug: string;
  typeId: string;
  type: SpaceTypeOption;
  title: string;
  priceLabel: string;
  price: number | null;
  area: number;
  location: string;
  mapAddress: string | null;
  image: string | null;
  description: string | null;
  characteristics: SpaceCharacteristic[];
}

export async function getSpaceListings(): Promise<SpaceListing[]> {
  try {
    return await prisma.spaceListing.findMany({
      orderBy: [{ order: "asc" }, { createdAt: "desc" }],
      include: { type: true },
    });
  } catch {
    return [];
  }
}

export async function getSpaceListingBySlug(slug: string): Promise<SpaceListing | null> {
  try {
    return await prisma.spaceListing.findUnique({ where: { slug }, include: { type: true } });
  } catch {
    return null;
  }
}

export async function getSpaceTypes(): Promise<SpaceTypeOption[]> {
  try {
    return await prisma.spaceType.findMany({ orderBy: { name: "asc" } });
  } catch {
    return [];
  }
}

export function mapsSearchUrl(listing: Pick<SpaceListing, "location" | "mapAddress">): string {
  const query = listing.mapAddress?.trim() || listing.location;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}
