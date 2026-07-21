import { prisma } from "@/lib/prisma";
import AdminPageHeader from "../../components/AdminPageHeader";
import SpaceListingForm from "../SpaceListingForm";
import { createSpaceAction } from "@/lib/adminSpaceActions";

export default async function NewSpaceListingPage() {
  const types = await prisma.spaceType.findMany({ orderBy: { name: "asc" } });

  return (
    <div>
      <AdminPageHeader title="Adaugă anunț de chirie" />
      <SpaceListingForm action={createSpaceAction} types={types} submitLabel="Adaugă anunț" />
    </div>
  );
}
