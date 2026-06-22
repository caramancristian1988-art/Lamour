"use client";

import { useState } from "react";
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
      <div className="bg-white border border-gray-100 rounded-2xl p-10 text-center text-gray-500">
        Nu există conturi create.
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
      <div className="divide-y divide-gray-100">
        {users.map((u) => {
          const isSelf = u.id === currentUserId;
          const isLastAdmin = u.isAdmin && adminCount <= 1;
          return (
            <div key={u.id} className="flex items-center gap-4 p-4">
              <div className="w-10 h-10 rounded-full bg-[#1d2353] text-white flex items-center justify-center text-xs font-bold shrink-0">
                {getInitials(u.name)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-bold text-sm text-[#1d2353] truncate">{u.name}</p>
                  {isSelf && (
                    <span className="text-[10px] font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full uppercase shrink-0">
                      Tu
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500 truncate">{u.email}</p>
              </div>
              <p className="text-xs text-gray-400 shrink-0 hidden sm:block">{formatDate(u.createdAt)}</p>
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
                className={`text-xs font-bold px-3 py-1.5 rounded-full border transition-all active:scale-95 shrink-0 disabled:opacity-50 disabled:cursor-not-allowed ${
                  u.isAdmin
                    ? "bg-[#fdf2f3] text-[#c7092b] border-[#fbd5d9]"
                    : "bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100"
                }`}
              >
                {u.isAdmin ? "Administrator" : "Utilizator"}
              </button>
              <button
                type="button"
                onClick={() => handleDelete(u)}
                disabled={isSelf}
                aria-label="Șterge contul"
                title={isSelf ? "Nu îți poți șterge propriul cont" : "Șterge contul"}
                className="text-gray-400 hover:text-[#c7092b] transition-colors p-1.5 rounded-lg hover:bg-[#fdf2f3] shrink-0 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
