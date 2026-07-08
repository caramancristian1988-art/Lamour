"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Bell,
  Package,
  Wrench,
  Image as ImageIcon,
  FileText,
  MessageSquare,
  Star,
  Megaphone,
  Mail,
  HelpCircle,
  Settings,
  Users,
  ArrowLeft,
  LogOut,
  Menu,
} from "lucide-react";
import { logoutAction } from "@/lib/authActions";
import { Logo } from "@/app/components/Logo";
import { SITE_SHORT_NAME } from "@/lib/constants";
import {
  Sheet,
  SheetContent,
} from "@/app/components/ui/sheet";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/notificari", label: "Notificări", icon: Bell },
  { href: "/admin/produse", label: "Produse", icon: Package },
  { href: "/admin/servicii", label: "Servicii", icon: Wrench },
  { href: "/admin/proiecte", label: "Proiecte", icon: ImageIcon },
  { href: "/admin/blog", label: "Blog", icon: FileText },
  { href: "/admin/mesaje", label: "Cereri și comenzi", icon: MessageSquare },
  { href: "/admin/recenzii", label: "Recenzii", icon: Star },
  { href: "/admin/popup", label: "Pop-up ofertă", icon: Megaphone },
  { href: "/admin/newsletter", label: "Newsletter", icon: Mail },
  { href: "/admin/faq", label: "Întrebări frecvente", icon: HelpCircle },
  { href: "/admin/setari", label: "Setări", icon: Settings },
  { href: "/admin/utilizatori", label: "Utilizatori", icon: Users },
];

interface Notifications {
  unreadMessages: number;
  pendingReviews: number;
}

function NavBadge({ count, active }: { count: number; active: boolean }) {
  if (count <= 0) return null;
  return (
    <span
      className={cn(
        "ml-auto text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center shrink-0",
        active ? "bg-white text-accent" : "bg-accent text-white"
      )}
    >
      {count > 9 ? "9+" : count}
    </span>
  );
}

function SidebarContent({
  userName,
  notifications,
  onNavigate,
}: {
  userName: string;
  notifications: Notifications;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();

  const badgeFor: Record<string, number> = {
    "/admin/notificari": notifications.unreadMessages + notifications.pendingReviews,
    "/admin/mesaje": notifications.unreadMessages,
    "/admin/recenzii": notifications.pendingReviews,
  };

  return (
    <div className="flex flex-col h-full">
      <div className="px-6 py-6 border-b border-white/10 flex items-center gap-3">
        <Logo size={40} />
        <Link href="/admin" className="min-w-0">
          <span className="block text-lg font-extrabold uppercase tracking-tight text-white truncate">
            {SITE_SHORT_NAME}
          </span>
          <span className="block text-[11px] text-white/60">Panou de administrare</span>
        </Link>
      </div>

      <nav className="flex-1 px-3 py-4 flex flex-col gap-1 overflow-y-auto">
        {navItems.map((item) => {
          const active = item.href === "/admin" ? pathname === "/admin" : pathname?.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors",
                active ? "bg-accent text-white" : "text-white/70 hover:bg-white/10 hover:text-white"
              )}
            >
              <Icon className="w-5 h-5 shrink-0" aria-hidden />
              {item.label}
              <NavBadge count={badgeFor[item.href] ?? 0} active={!!active} />
            </Link>
          );
        })}
      </nav>

      <div className="px-3 py-4 border-t border-white/10 shrink-0">
        <div className="px-3 py-2 text-xs text-white/50 truncate">{userName}</div>
        <Link
          href="/"
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold text-white/70 hover:bg-white/10 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5" aria-hidden />
          Vezi site-ul
        </Link>
        <form action={logoutAction}>
          <button
            type="submit"
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold text-white/70 hover:bg-white/10 hover:text-white transition-colors"
          >
            <LogOut className="w-5 h-5" aria-hidden />
            Deconectează-te
          </button>
        </form>
      </div>
    </div>
  );
}

export default function AdminSidebar({ userName, notifications }: { userName: string; notifications: Notifications }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Mobile top bar */}
      <div className="lg:hidden sticky top-0 z-40 flex items-center justify-between bg-primary text-white px-4 py-3">
        <Link href="/admin" className="flex items-center gap-2 font-extrabold uppercase tracking-tight">
          <Logo size={28} />
          {SITE_SHORT_NAME} <span className="text-white/50 text-xs font-normal normal-case">Admin</span>
        </Link>
        <button onClick={() => setOpen(true)} aria-label="Deschide meniul de administrare" className="p-1.5">
          <Menu className="w-6 h-6" aria-hidden />
        </button>
      </div>

      {/* Mobile drawer */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="left" className="p-0 bg-primary border-none w-72 max-w-[80vw] [&_button[aria-label='Închide meniul']]:text-white/60 [&_button[aria-label='Închide meniul']]:hover:text-white">
          <SidebarContent userName={userName} notifications={notifications} onNavigate={() => setOpen(false)} />
        </SheetContent>
      </Sheet>

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex lg:flex-col w-64 shrink-0 bg-primary min-h-screen sticky top-0 z-40 self-start">
        <SidebarContent userName={userName} notifications={notifications} />
      </aside>
    </>
  );
}
