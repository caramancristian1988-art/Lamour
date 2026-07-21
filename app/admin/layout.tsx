import { requireAdmin } from "@/lib/adminAuth";
import { prisma } from "@/lib/prisma";
import AdminSidebar from "./AdminSidebar";
import { SITE_SHORT_NAME } from "@/lib/constants";

export const metadata = {
  title: { absolute: `Admin | ${SITE_SHORT_NAME}` },
  robots: { index: false, follow: false },
};

async function getNotifications() {
  try {
    const [unreadMessages, pendingReviews] = await Promise.all([
      prisma.contactMessage.count({ where: { read: false } }),
      prisma.review.count({ where: { approved: false } }),
    ]);
    return { unreadMessages, pendingReviews };
  } catch {
    return { unreadMessages: 0, pendingReviews: 0 };
  }
}

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await requireAdmin();
  const notifications = await getNotifications();

  return (
    <div className="min-h-screen bg-background lg:flex">
      <AdminSidebar userName={user.name} notifications={notifications} />
      <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-10">{children}</main>
    </div>
  );
}
