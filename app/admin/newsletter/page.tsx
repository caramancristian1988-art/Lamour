import { prisma } from "@/lib/prisma";
import AdminPageHeader from "../components/AdminPageHeader";
import NewsletterCampaignPanel from "./NewsletterCampaignPanel";

async function getSubscribers() {
  try {
    return await prisma.newsletterSubscriber.findMany({ orderBy: { createdAt: "desc" } });
  } catch {
    return [];
  }
}

export default async function AdminNewsletterPage() {
  const subscribers = await getSubscribers();

  return (
    <div>
      <AdminPageHeader
        title="Newsletter"
        description="Abonații la newsletter din formularul de pe site și trimiterea de oferte prin email."
      />

      <NewsletterCampaignPanel subscribers={subscribers} />
    </div>
  );
}
