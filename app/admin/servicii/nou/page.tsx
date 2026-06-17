import AdminPageHeader from "../../components/AdminPageHeader";
import ServiceForm from "../ServiceForm";
import { createServiceAction } from "@/lib/adminServiceActions";

export default function NewServicePage() {
  return (
    <div>
      <AdminPageHeader title="Adaugă serviciu" />
      <ServiceForm action={createServiceAction} submitLabel="Adaugă serviciu" />
    </div>
  );
}
