import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import AdminPageHeader from "../components/AdminPageHeader";
import UsersList from "./UsersList";

async function getUsers() {
  try {
    return await prisma.user.findMany({ orderBy: { createdAt: "asc" } });
  } catch {
    return [];
  }
}

export default async function AdminUtilizatoriPage() {
  const [users, me] = await Promise.all([getUsers(), getSession()]);

  return (
    <div>
      <AdminPageHeader
        title="Utilizatori"
        description="Conturile create pentru panoul de administrare."
        action={
          <Link
            href="/admin/utilizatori/nou"
            className="inline-flex items-center gap-2 bg-[#c7092b] hover:bg-[#a5071f] text-white font-bold px-5 py-2.5 rounded-xl transition-colors text-sm uppercase tracking-wide"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Cont nou
          </Link>
        }
      />
      <UsersList users={users} currentUserId={me?.id ?? ""} />
    </div>
  );
}
