import { requireAdmin } from "@/lib/adminAuth";
import AdminSidebar from "./AdminSidebar";

export const metadata = {
  title: "Admin | Climat Rapid",
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await requireAdmin();

  return (
    <div className="min-h-screen bg-[#f6f8fb] lg:flex">
      <AdminSidebar userName={user.name} />
      <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-10">{children}</main>
    </div>
  );
}
