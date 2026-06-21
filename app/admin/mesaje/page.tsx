import { prisma } from "@/lib/prisma";
import AdminPageHeader from "../components/AdminPageHeader";
import DeleteButton from "../components/DeleteButton";
import MessageStatusBadge from "../components/MessageStatusBadge";
import ClientTypeBadge from "../components/ClientTypeBadge";
import { markMessageReadAction, deleteMessageAction } from "@/lib/adminMessageActions";

async function getMessages() {
  try {
    return await prisma.contactMessage.findMany({ orderBy: { createdAt: "desc" } });
  } catch {
    return [];
  }
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("ro-MD", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }).format(date);
}

const STATUS_ACCENT_COLORS: Record<string, string> = {
  in_asteptare: "#f59e0b",
  sunat: "#3b82f6",
  nu_raspunde: "#f97316",
  ocupat: "#f97316",
  se_gandeste: "#eab308",
  in_lucru: "#0ea5e9",
  task_creat: "#64748b",
  comanda_confirmata: "#06b6d4",
  asteptam_plata: "#a855f7",
  achitat: "#14b8a6",
  programat: "#6366f1",
  rezolvat: "#22c55e",
  anulat: "#9ca3af",
  nu_interesat: "#ef4444",
};

export default async function AdminMesajePage() {
  const messages = await getMessages();

  return (
    <div>
      <AdminPageHeader title="Mesaje Contact" description="Mesajele primite prin formularul de contact." />

      {messages.length === 0 ? (
        <div className="bg-white border border-gray-100 rounded-2xl p-10 text-center text-gray-500">
          Nu există mesaje primite încă.
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {messages.map((m) => (
            <div
              key={m.id}
              style={{ borderLeftColor: STATUS_ACCENT_COLORS[m.status] ?? STATUS_ACCENT_COLORS.in_asteptare }}
              className={`bg-white border rounded-2xl p-5 border-l-4 transition-colors ${
                m.read ? "border-gray-100" : "border-[#c7092b]/30"
              }`}
            >
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-sm text-[#1d2353]">{m.name}</p>
                    {!m.read && (
                      <span className="text-[10px] font-bold text-[#c7092b] bg-[#fdf2f3] px-2 py-0.5 rounded-full uppercase">
                        Nou
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-500 mt-1 flex-wrap">
                    <a href={`tel:${m.phone}`} className="hover:text-[#c7092b] transition-colors">{m.phone}</a>
                    {m.email && <a href={`mailto:${m.email}`} className="hover:text-[#c7092b] transition-colors">{m.email}</a>}
                    <span>{formatDate(m.createdAt)}</span>
                    <span className="text-[10px] font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full uppercase">
                      {m.source}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <MessageStatusBadge id={m.id} status={m.status} />
                  <ClientTypeBadge id={m.id} clientType={m.clientType} />
                  {!m.read && (
                    <form action={markMessageReadAction}>
                      <input type="hidden" name="id" value={m.id} />
                      <button
                        type="submit"
                        className="text-xs font-bold text-[#1d2353] border border-gray-200 hover:bg-gray-50 px-3 py-1.5 rounded-lg transition-colors"
                      >
                        Marchează ca citit
                      </button>
                    </form>
                  )}
                  <DeleteButton action={deleteMessageAction} id={m.id} confirmText="Sigur vrei să ștergi acest mesaj?" />
                </div>
              </div>
              {m.message && <p className="text-sm text-gray-600 mt-3 leading-relaxed whitespace-pre-line">{m.message}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
