import { prisma } from "@/lib/prisma";
import AdminPageHeader from "../components/AdminPageHeader";
import RecipientsManager from "./RecipientsManager";

export const dynamic = "force-dynamic";

async function getRecipients() {
  try {
    const rows = await prisma.telegramRecipient.findMany({ orderBy: { createdAt: "asc" } });
    return rows.map((r) => ({ id: r.id, name: r.name, role: r.role, connected: Boolean(r.chatId) }));
  } catch {
    return [];
  }
}

export default async function AdminTelegramPage() {
  const recipients = await getRecipients();

  return (
    <div>
      <AdminPageHeader
        title="Telegram"
        description="Cine primește notificări de comenzi pe Telegram, în afară de grupul principal."
      />

      <div className="bg-card border border-border rounded-2xl p-6 max-w-2xl mb-6">
        <p className="text-xs font-extrabold uppercase tracking-wide text-primary mb-3">Cum funcționează</p>
        <ol className="text-sm text-muted-foreground list-decimal pl-5 flex flex-col gap-1.5">
          <li>Adaugă persoana mai jos (nume + rol).</li>
          <li>Apasă &bdquo;Conectează Telegram&rdquo; și copiază linkul.</li>
          <li>Trimite-i linkul; ea îl deschide pe telefonul ei și apasă <b>Start</b> în bot.</li>
          <li>Statusul devine &bdquo;Telegram conectat&rdquo; — poți apăsa &bdquo;Trimite test&rdquo; ca să verifici.</li>
        </ol>
        <p className="text-xs font-extrabold uppercase tracking-wide text-primary mt-5 mb-2">Ce primește fiecare rol</p>
        <ul className="text-sm text-muted-foreground flex flex-col gap-1">
          <li><b>Depozitar</b> — comenzile confirmate, cu butonul &bdquo;Gata de ridicare&rdquo;.</li>
          <li><b>Contabil</b> — comenzile care cer factură, în privat.</li>
          <li><b>Curier</b> — notificare când comanda e gata de ridicare.</li>
          <li><b>Manager</b> — notificare la fiecare schimbare de etapă a comenzii.</li>
        </ul>
      </div>

      <RecipientsManager recipients={recipients} />
    </div>
  );
}
