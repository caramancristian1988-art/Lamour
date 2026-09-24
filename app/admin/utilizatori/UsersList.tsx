"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { toggleAdminAction, deleteUserAction } from "@/lib/adminUserActions";

interface UserRow {
  id: string;
  name: string;
  email: string;
  isAdmin: boolean;
  createdAt: Date;
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("ro-MD", { day: "2-digit", month: "2-digit", year: "numeric" }).format(date);
}

function getInitials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}

export default function UsersList({ users: initialUsers, currentUserId }: { users: UserRow[]; currentUserId: string }) {
  const [users, setUsers] = useState(initialUsers);
  const adminCount = users.filter((u) => u.isAdmin).length;

  function patchUser(id: string, patch: Partial<UserRow>) {
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, ...patch } : u)));
  }

  function removeUser(id: string) {
    setUsers((prev) => prev.filter((u) => u.id !== id));
  }

  function handleToggleAdmin(user: UserRow) {
    const makeAdmin = !user.isAdmin;
    if (user.id === currentUserId && !makeAdmin) return;
    if (!makeAdmin && user.isAdmin && adminCount <= 1) return;

    patchUser(user.id, { isAdmin: makeAdmin });
    const formData = new FormData();
    formData.set("id", user.id);
    formData.set("makeAdmin", String(makeAdmin));
    toggleAdminAction(formData);
  }

  function handleDelete(user: UserRow) {
    if (user.id === currentUserId) return;
    if (!confirm(`Sigur vrei să ștergi contul lui ${user.name}?`)) return;

    removeUser(user.id);
    const formData = new FormData();
    formData.set("id", user.id);
    deleteUserAction(formData);
  }

  if (users.length === 0) {
    return (
      <div className="bg-card border border-border rounded-2xl p-10 text-center text-muted-foreground">
        Nu există conturi create.
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden">
      <div className="divide-y divide-border">
        {users.map((u) => {
          const isSelf = u.id === currentUserId;
          const isLastAdmin = u.isAdmin && adminCount <= 1;
          return (
            <div key={u.id} className="flex items-center gap-4 p-4">
              <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold shrink-0">
                {getInitials(u.name)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-bold text-sm text-primary truncate">{u.name}</p>
                  {isSelf && (
                    <span className="text-[10px] font-bold text-muted-foreground bg-muted px-2 py-0.5 rounded-full uppercase shrink-0">
                      Tu
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground truncate">{u.email}</p>
              </div>
              <p className="text-xs text-muted-foreground shrink-0 hidden sm:block">{formatDate(u.createdAt)}</p>
              <button
                type="button"
                onClick={() => handleToggleAdmin(u)}
                disabled={(isSelf && u.isAdmin) || (u.isAdmin && isLastAdmin)}
                title={
                  isSelf && u.isAdmin
                    ? "Nu îți poți elimina propriile drepturi de administrator"
                    : u.isAdmin && isLastAdmin
                    ? "Trebuie să existe cel puțin un administrator"
                    : undefined
                }
                className={cn(
                  "text-xs font-bold px-3 py-1.5 rounded-full border transition-all active:scale-95 shrink-0 disabled:opacity-50 disabled:cursor-not-allowed",
                  u.isAdmin
                    ? "bg-accent/10 text-accent border-accent/20"
                    : "bg-muted text-muted-foreground border-border hover:bg-muted/70"
                )}
              >
                {u.isAdmin ? "Administrator" : "Utilizator"}
              </button>
              <button
                type="button"
                onClick={() => handleDelete(u)}
                disabled={isSelf}
                aria-label={`Șterge contul lui ${u.name}`}
                title={isSelf ? "Nu îți poți șterge propriul cont" : `Șterge contul lui ${u.name}`}
                className="text-muted-foreground hover:text-accent transition-colors p-1.5 rounded-lg hover:bg-accent/10 shrink-0 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent"
              >
                <Trash2 className="w-4 h-4" aria-hidden />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
