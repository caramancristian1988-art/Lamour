import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import AdminPageHeader from "../../../components/AdminPageHeader";
import TypeForm from "../TypeForm";
import { updateFurnitureTypeAction } from "@/lib/adminFurnitureTypeActions";

export default async function EditFurnitureTypePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const type = await prisma.furnitureType.findUnique({ where: { id } });
  if (!type) notFound();

  return (
    <div>
      <AdminPageHeader title="Editează tip" />
      <TypeForm action={updateFurnitureTypeAction} defaults={type} submitLabel="Salvează modificările" />
    </div>
  );
}
