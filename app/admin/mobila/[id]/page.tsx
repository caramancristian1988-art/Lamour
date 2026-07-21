import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ExternalLink } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import AdminPageHeader from "../../components/AdminPageHeader";
import CopyableId from "../../components/CopyableId";
import FurnitureListingForm from "../FurnitureListingForm";
import { updateFurnitureAction } from "@/lib/adminFurnitureActions";

export default async function EditFurnitureListingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [listing, types, allListings] = await Promise.all([
    prisma.furnitureListing.findUnique({ where: { id } }),
    prisma.furnitureType.findMany({ orderBy: { name: "asc" } }),
    prisma.furnitureListing.findMany({ select: { material: true } }),
  ]);
  if (!listing) notFound();

  const materials = Array.from(new Set(allListings.map((l) => l.material))).sort();

  return (
    <div>
      <AdminPageHeader
        title="Editează lucrare mobilier"
        action={
          <div className="flex items-center gap-4">
            <CopyableId id={listing.id} />
            <Button variant="ghost" size="sm" asChild>
              <Link href={`/mobila/${listing.slug}`} target="_blank" rel="noopener noreferrer">
                Vezi pe site
                <ExternalLink className="w-3.5 h-3.5" aria-hidden />
              </Link>
            </Button>
          </div>
        }
      />
      <FurnitureListingForm action={updateFurnitureAction} defaults={listing} types={types} materials={materials} submitLabel="Salvează modificările" />
    </div>
  );
}
