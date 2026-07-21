import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ExternalLink } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import AdminPageHeader from "../../components/AdminPageHeader";
import CopyableId from "../../components/CopyableId";
import SpaceListingForm from "../SpaceListingForm";
import { updateSpaceAction } from "@/lib/adminSpaceActions";

export default async function EditSpaceListingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [listing, allListings] = await Promise.all([
    prisma.spaceListing.findUnique({ where: { id } }),
    prisma.spaceListing.findMany({ select: { type: true } }),
  ]);
  if (!listing) notFound();

  const types = Array.from(new Set(allListings.map((l) => l.type))).sort();

  return (
    <div>
      <AdminPageHeader
        title="Editează anunț de chirie"
        action={
          <div className="flex items-center gap-4">
            <CopyableId id={listing.id} />
            <Button variant="ghost" size="sm" asChild>
              <Link href={`/spatii-comerciale/${listing.slug}`} target="_blank" rel="noopener noreferrer">
                Vezi pe site
                <ExternalLink className="w-3.5 h-3.5" aria-hidden />
              </Link>
            </Button>
          </div>
        }
      />
      <SpaceListingForm action={updateSpaceAction} defaults={listing} types={types} submitLabel="Salvează modificările" />
    </div>
  );
}
