import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { Plus } from "lucide-react";
import { Button } from "@/app/components/ui/button";
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
          <Button variant="accent" asChild>
            <Link href="/admin/utilizatori/nou">
              <Plus className="w-4 h-4" aria-hidden />
              Cont nou
            </Link>
          </Button>
        }
      />
      <UsersList users={users} currentUserId={me?.id ?? ""} />
    </div>
  );
}
