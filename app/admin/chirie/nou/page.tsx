import { prisma } from "@/lib/prisma";
import AdminPageHeader from "../../components/AdminPageHeader";
import SpaceListingForm from "../SpaceListingForm";
import { createSpaceAction } from "@/lib/adminSpaceActions";

export default async function NewSpaceListingPage() {
  const listings = await prisma.spaceListing.findMany({ select: { type: true } });
  const types = Array.from(new Set(listings.map((l) => l.type))).sort();

  return (
    <div>
      <AdminPageHeader title="Adaugă anunț de chirie" />
      <SpaceListingForm action={createSpaceAction} types={types} submitLabel="Adaugă anunț" />
    </div>
  );
}
