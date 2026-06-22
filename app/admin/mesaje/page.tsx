import { prisma } from "@/lib/prisma";
import AdminPageHeader from "../components/AdminPageHeader";
import MessagesList from "./MessagesList";

async function getMessages() {
  try {
    return await prisma.contactMessage.findMany({ orderBy: { createdAt: "desc" } });
  } catch {
    return [];
  }
}

export default async function AdminMesajePage() {
  const messages = await getMessages();

  return (
    <div>
      <AdminPageHeader title="Mesaje Contact" description="Mesajele primite prin formularul de contact." />
      <MessagesList messages={messages} />
    </div>
  );
}
