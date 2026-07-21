import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import AdminPageHeader from "../../../components/AdminPageHeader";
import TypeForm from "../TypeForm";
import { updateSpaceTypeAction } from "@/lib/adminSpaceTypeActions";

export default async function EditSpaceTypePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const type = await prisma.spaceType.findUnique({ where: { id } });
  if (!type) notFound();

  return (
    <div>
      <AdminPageHeader title="Editează tip" />
      <TypeForm action={updateSpaceTypeAction} defaults={type} submitLabel="Salvează modificările" />
    </div>
  );
}
