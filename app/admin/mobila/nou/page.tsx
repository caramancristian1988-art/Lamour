import { prisma } from "@/lib/prisma";
import AdminPageHeader from "../../components/AdminPageHeader";
import FurnitureListingForm from "../FurnitureListingForm";
import { createFurnitureAction } from "@/lib/adminFurnitureActions";

export default async function NewFurnitureListingPage() {
  const listings = await prisma.furnitureListing.findMany({ select: { type: true, material: true } });
  const types = Array.from(new Set(listings.map((l) => l.type))).sort();
  const materials = Array.from(new Set(listings.map((l) => l.material))).sort();

  return (
    <div>
      <AdminPageHeader title="Adaugă lucrare mobilier" />
      <FurnitureListingForm action={createFurnitureAction} types={types} materials={materials} submitLabel="Adaugă lucrare" />
    </div>
  );
}
