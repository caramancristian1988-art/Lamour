import { prisma } from "@/lib/prisma";
import AdminPageHeader from "./components/AdminPageHeader";
import AdminStatCard from "./components/AdminStatCard";
import { getPopupStats } from "@/lib/popupStatActions";

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

export default async function AdminDashboardPage() {
  const stats = await getStats();
  const popupStats = await getPopupStats();

  return (
    <div>
      <AdminPageHeader title="Dashboard" description="Vedere de ansamblu asupra site-ului tău." />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <AdminStatCard
          href="/admin/mesaje"
          label="Mesaje primite"
          value={stats.messages}
          badge={stats.unreadMessages > 0 ? `${stats.unreadMessages} noi` : undefined}
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          }
        />
        <AdminStatCard
          href="/admin/recenzii"
          label="Recenzii publicate"
          value={stats.reviews}
          badge={stats.pendingReviews > 0 ? `${stats.pendingReviews} în așteptare` : undefined}
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.95a1 1 0 00.95.69h4.153c.969 0 1.371 1.24.588 1.81l-3.36 2.44a1 1 0 00-.364 1.118l1.285 3.95c.3.921-.755 1.688-1.539 1.118l-3.36-2.44a1 1 0 00-1.176 0l-3.36 2.44c-.783.57-1.838-.197-1.538-1.118l1.285-3.95a1 1 0 00-.363-1.118l-3.36-2.44c-.783-.57-.38-1.81.588-1.81h4.153a1 1 0 00.95-.69l1.286-3.95z" />
            </svg>
          }
        />
        <AdminStatCard
          href="/admin/produse"
          label="Produse"
          value={stats.products}
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          }
        />
        <AdminStatCard
          href="/admin/produse/categorii"
          label="Categorii"
          value={stats.categories}
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" />
            </svg>
          }
        />
        <AdminStatCard
          href="/admin/servicii"
          label="Servicii"
          value={stats.services}
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M14.7 6.3a1 1 0 000-1.4l-2.6-2.6a1 1 0 00-1.4 0L9.3 3.7l4 4 1.4-1.4zM7.9 5.1L2 11v4h4l5.9-5.9-4-4z" />
            </svg>
          }
        />
        <AdminStatCard
          href="/admin/proiecte"
          label="Proiecte"
          value={stats.projects}
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
            </svg>
          }
        />
        <AdminStatCard
          href="/admin/blog"
          label="Articole blog"
          value={stats.blogPosts}
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M11 4H6a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2v-5m-1.5-9.5a2.121 2.121 0 113 3L12 13l-4 1 1-4 8.5-8.5z" />
            </svg>
          }
        />
        <AdminStatCard
          label="Click-uri pop-up ofertă"
          value={popupStats.clicks}
          badge={popupStats.closes > 0 ? `${popupStats.closes} închideri` : undefined}
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          }
        />
        <AdminStatCard
          href="/admin/setari"
          label="Setări site"
          value="→"
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            </svg>
          }
        />
      </div>
    </div>
  );
}
