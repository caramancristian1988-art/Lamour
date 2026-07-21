import { prisma } from "@/lib/prisma";

export interface FurnitureCharacteristic {
  label: string;
  value: string;
}

export interface FurnitureTypeOption {
  id: string;
  name: string;
  slug: string;
}

export interface FurnitureListing {
  id: string;
  slug: string;
  typeId: string;
  type: FurnitureTypeOption;
  title: string;
  priceLabel: string;
  price: number | null;
  material: string;
  leadTime: string | null;
  image: string | null;
  description: string | null;
  characteristics: FurnitureCharacteristic[];
}

export async function getFurnitureListings(): Promise<FurnitureListing[]> {
  try {
    return await prisma.furnitureListing.findMany({
      orderBy: [{ order: "asc" }, { createdAt: "desc" }],
      include: { type: true },
    });
  } catch {
    return [];
  }
}

export async function getFurnitureListingBySlug(slug: string): Promise<FurnitureListing | null> {
  try {
    return await prisma.furnitureListing.findUnique({ where: { slug }, include: { type: true } });
  } catch {
    return null;
  }
}

export async function getFurnitureTypes(): Promise<FurnitureTypeOption[]> {
  try {
    return await prisma.furnitureType.findMany({ orderBy: { name: "asc" } });
  } catch {
    return [];
  }
}
