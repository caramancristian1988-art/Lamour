import {
  MessageSquare,
  Star,
  Package,
  Layers,
  Wrench,
  Image as ImageIcon,
  FileText,
  Megaphone,
  Settings,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import AdminPageHeader from "./components/AdminPageHeader";
import AdminStatCard from "./components/AdminStatCard";
import MiniBarChart from "./components/MiniBarChart";
import { getPopupStats } from "@/lib/popupStatActions";
import { MESSAGE_STATUSES } from "@/lib/messageStatuses";

async function getStats() {
  try {
    const [products, categories, services, projects, blogPosts, messages, unreadMessages, reviews, pendingReviews] =
      await Promise.all([
        prisma.product.count(),
        prisma.category.count(),
        prisma.service.count(),
        prisma.project.count(),
        prisma.blogPost.count(),
        prisma.contactMessage.count(),
        prisma.contactMessage.count({ where: { read: false } }),
        prisma.review.count({ where: { approved: true } }),
        prisma.review.count({ where: { approved: false } }),
      ]);
    return { products, categories, services, projects, blogPosts, messages, unreadMessages, reviews, pendingReviews };
  } catch {
    return {
      products: 0,
      categories: 0,
      services: 0,
      projects: 0,
      blogPosts: 0,
      messages: 0,
      unreadMessages: 0,
      reviews: 0,
      pendingReviews: 0,
    };
  }
}

async function getMessagesByStatus() {
  try {
    const grouped = await prisma.contactMessage.groupBy({
      by: ["status"],
      _count: { _all: true },
    });
    const counts = new Map(grouped.map((g) => [g.status, g._count._all]));
    return MESSAGE_STATUSES.map((s) => ({ label: s.label, value: counts.get(s.value) ?? 0 }));
  } catch {
    return MESSAGE_STATUSES.map((s) => ({ label: s.label, value: 0 }));
  }
}

export default async function AdminDashboardPage() {
  const [stats, popupStats, messagesByStatus] = await Promise.all([
    getStats(),
    getPopupStats(),
    getMessagesByStatus(),
  ]);

  const contentChartData = [
    { label: "Produse", value: stats.products },
    { label: "Servicii", value: stats.services },
    { label: "Proiecte", value: stats.projects },
    { label: "Articole blog", value: stats.blogPosts },
  ];

  return (
    <div>
      <AdminPageHeader title="Dashboard" description="Vedere de ansamblu asupra site-ului tău." />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <AdminStatCard
          href="/admin/mesaje"
          label="Mesaje primite"
          value={stats.messages}
          badge={stats.unreadMessages > 0 ? `${stats.unreadMessages} noi` : undefined}
          icon={<MessageSquare className="w-6 h-6" aria-hidden />}
        />
        <AdminStatCard
          href="/admin/recenzii"
          label="Recenzii publicate"
          value={stats.reviews}
          badge={stats.pendingReviews > 0 ? `${stats.pendingReviews} în așteptare` : undefined}
          icon={<Star className="w-6 h-6" aria-hidden />}
        />
        <AdminStatCard
          href="/admin/produse"
          label="Produse"
          value={stats.products}
          icon={<Package className="w-6 h-6" aria-hidden />}
        />
        <AdminStatCard
          href="/admin/produse/categorii"
          label="Categorii"
          value={stats.categories}
          icon={<Layers className="w-6 h-6" aria-hidden />}
        />
        <AdminStatCard
          href="/admin/servicii"
          label="Servicii"
          value={stats.services}
          icon={<Wrench className="w-6 h-6" aria-hidden />}
        />
        <AdminStatCard
          href="/admin/proiecte"
          label="Proiecte"
          value={stats.projects}
          icon={<ImageIcon className="w-6 h-6" aria-hidden />}
        />
        <AdminStatCard
          href="/admin/blog"
          label="Articole blog"
          value={stats.blogPosts}
          icon={<FileText className="w-6 h-6" aria-hidden />}
        />
        <AdminStatCard
          label="Click-uri pop-up ofertă"
          value={popupStats.clicks}
          badge={popupStats.closes > 0 ? `${popupStats.closes} închideri` : undefined}
          icon={<Megaphone className="w-6 h-6" aria-hidden />}
        />
        <AdminStatCard
          href="/admin/setari"
          label="Setări site"
          value="→"
          icon={<Settings className="w-6 h-6" aria-hidden />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <MiniBarChart
          title="Conținut publicat"
          description="Câte elemente din fiecare tip sunt momentan pe site."
          data={contentChartData}
          color="primary"
        />
        <MiniBarChart
          title="Cereri și comenzi pe stare"
          description="Distribuția mesajelor primite după stadiul lor curent."
          data={messagesByStatus}
          color="accent"
          emptyMessage="Nu există încă nicio cerere sau comandă."
        />
      </div>
    </div>
  );
}
