import { prisma } from "@/lib/prisma";

export interface FurnitureCharacteristic {
  label: string;
  value: string;
}

export interface FurnitureListing {
  id: string;
  slug: string;
  type: string;
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
    return await prisma.furnitureListing.findMany({ orderBy: [{ order: "asc" }, { createdAt: "desc" }] });
  } catch {
    return [];
  }
}

export async function getFurnitureListingBySlug(slug: string): Promise<FurnitureListing | null> {
  try {
    return await prisma.furnitureListing.findUnique({ where: { slug } });
  } catch {
    return null;
  }
}
