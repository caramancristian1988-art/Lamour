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

// Matches the product mentioned in a message's source/body so we can link
// straight to it, the same way the Telegram notification does.
async function attachProductSlugs<T extends { source: string; message: string | null }>(messages: T[]) {
  try {
    const products = await prisma.product.findMany({ select: { name: true, slug: true } });
    return messages.map((m) => {
      const haystack = `${m.source} ${m.message ?? ""}`;
      const match = products.find((p) => haystack.includes(p.name));
      return { ...m, productSlug: match?.slug ?? null };
    });
  } catch {
    return messages.map((m) => ({ ...m, productSlug: null }));
  }
}

export default async function AdminMesajePage() {
  const rawMessages = await getMessages();
  const messages = await attachProductSlugs(rawMessages);

  return (
    <div>
      <AdminPageHeader title="Mesaje Contact" description="Mesajele primite prin formularul de contact." />
      <MessagesList messages={messages} />
    </div>
  );
}
