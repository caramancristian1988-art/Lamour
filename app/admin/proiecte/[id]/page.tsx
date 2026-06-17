import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import AdminPageHeader from "../../components/AdminPageHeader";
import ProjectForm from "../ProjectForm";
import { updateProjectAction } from "@/lib/adminProjectActions";

export default async function EditProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const project = await prisma.project.findUnique({ where: { id } });
  if (!project) notFound();

  return (
    <div>
      <AdminPageHeader title="Editează proiect" />
      <ProjectForm action={updateProjectAction} defaults={project} submitLabel="Salvează modificările" />
    </div>
  );
}
