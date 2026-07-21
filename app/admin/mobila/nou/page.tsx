import { prisma } from "@/lib/prisma";
import AdminPageHeader from "../../components/AdminPageHeader";
import FurnitureListingForm from "../FurnitureListingForm";
import { createFurnitureAction } from "@/lib/adminFurnitureActions";

export default async function NewFurnitureListingPage() {
  const [types, listings] = await Promise.all([
    prisma.furnitureType.findMany({ orderBy: { name: "asc" } }),
    prisma.furnitureListing.findMany({ select: { material: true } }),
  ]);
  const materials = Array.from(new Set(listings.map((l) => l.material))).sort();

  return (
    <div>
      <AdminPageHeader title="Adaugă lucrare mobilier" />
      <FurnitureListingForm action={createFurnitureAction} types={types} materials={materials} submitLabel="Adaugă lucrare" />
    </div>
  );
}
