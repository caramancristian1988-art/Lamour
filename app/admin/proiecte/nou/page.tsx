import AdminPageHeader from "../../components/AdminPageHeader";
import ProjectForm from "../ProjectForm";
import { createProjectAction } from "@/lib/adminProjectActions";

export default function NewProjectPage() {
  return (
    <div>
      <AdminPageHeader title="Adaugă proiect" />
      <ProjectForm action={createProjectAction} submitLabel="Adaugă proiect" />
    </div>
  );
}
