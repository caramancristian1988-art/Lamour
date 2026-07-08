import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import AdminPageHeader from "../../components/AdminPageHeader";
import BannerForm from "../BannerForm";
import { updateBannerAction } from "@/lib/adminBannerActions";

export default async function EditBannerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const banner = await prisma.banner.findUnique({ where: { id } });
  if (!banner) notFound();

  return (
    <div>
      <AdminPageHeader title="Editează banner" />
      <BannerForm action={updateBannerAction} defaults={banner} submitLabel="Salvează modificările" />
    </div>
  );
}
