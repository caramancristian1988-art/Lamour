import { requireAdmin } from "@/lib/adminAuth";
import { prisma } from "@/lib/prisma";
import AdminSidebar from "./AdminSidebar";

export const metadata = {
  title: "Admin | Climat Rapid",
};

async function getNotifications() {
  try {
    const [unreadMessages, pendingReviews, recentMessages, recentReviews] = await Promise.all([
      prisma.contactMessage.count({ where: { read: false } }),
      prisma.review.count({ where: { approved: false } }),
      prisma.contactMessage.findMany({ where: { read: false }, orderBy: { createdAt: "desc" }, take: 5 }),
      prisma.review.findMany({ where: { approved: false }, orderBy: { createdAt: "desc" }, take: 5 }),
    ]);
    return {
      unreadMessages,
      pendingReviews,
      recentMessages: recentMessages.map((m) => ({
        id: m.id,
        name: m.name,
        phone: m.phone,
        createdAt: m.createdAt.toISOString(),
      })),
      recentReviews: recentReviews.map((r) => ({
        id: r.id,
        name: r.name,
        text: r.text,
        createdAt: r.createdAt.toISOString(),
      })),
    };
  } catch {
    return { unreadMessages: 0, pendingReviews: 0, recentMessages: [], recentReviews: [] };
  }
}

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await requireAdmin();
  const notifications = await getNotifications();

  return (
    <div className="min-h-screen bg-[#f6f8fb] lg:flex">
      <AdminSidebar userName={user.name} notifications={notifications} />
      <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-10">{children}</main>
    </div>
  );
}
