import AdminPageHeader from "../../components/AdminPageHeader";
import BannerForm from "../BannerForm";
import { createBannerAction } from "@/lib/adminBannerActions";

export default function NewBannerPage() {
  return (
    <div>
      <AdminPageHeader title="Adaugă banner" />
      <BannerForm action={createBannerAction} submitLabel="Adaugă banner" />
    </div>
  );
}
