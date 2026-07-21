import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { ImageOff, ExternalLink, Pencil, Plus } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Badge } from "@/app/components/ui/badge";
import AdminPageHeader from "../components/AdminPageHeader";
import DeleteButton from "../components/DeleteButton";
import { deleteSpaceAction } from "@/lib/adminSpaceActions";

async function getListings() {
  try {
    return await prisma.spaceListing.findMany({ orderBy: [{ order: "asc" }, { createdAt: "desc" }], include: { type: true } });
  } catch {
    return [];
  }
}

function ListingRow({ listing }: { listing: Awaited<ReturnType<typeof getListings>>[number] }) {
  return (
    <div className="flex items-start gap-3 p-4">
      <div className="relative w-12 h-12 rounded-xl bg-muted overflow-hidden shrink-0 mt-0.5">
        {listing.image ? (
          <Image src={listing.image} alt={listing.title} fill className="object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
            <ImageOff className="w-6 h-6" aria-hidden />
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-bold text-sm text-primary line-clamp-2 leading-snug">{listing.title}</p>
        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
          <Badge variant="outline">{listing.type.name}</Badge>
          <p className="text-sm text-muted-foreground">{listing.location}</p>
        </div>
        <div className="flex items-center gap-2 mt-2 flex-wrap">
          <span className="text-sm font-bold text-primary">{listing.priceLabel}</span>
          <span className="text-sm text-muted-foreground">{listing.area} m²</span>
          <div className="ml-auto flex items-center gap-0.5">
            <Button variant="ghost" size="icon" asChild>
              <Link href={`/spatii-comerciale/${listing.slug}`} target="_blank" rel="noopener noreferrer" aria-label={`Vezi anunțul ${listing.title} pe site`}>
                <ExternalLink className="w-4 h-4" aria-hidden />
              </Link>
            </Button>
            <Button variant="ghost" size="icon" asChild>
              <Link href={`/admin/chirie/${listing.id}`} aria-label={`Editează anunțul ${listing.title}`}>
                <Pencil className="w-4 h-4" aria-hidden />
              </Link>
            </Button>
            <DeleteButton action={deleteSpaceAction} id={listing.id} confirmText="Sigur vrei să ștergi acest anunț?" label={`Șterge anunțul ${listing.title}`} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default async function AdminChiriePage() {
  const listings = await getListings();

  return (
    <div>
      <AdminPageHeader
        title="Chirie"
        description="Anunțurile de spații de închiriat afișate pe site, la /spatii-comerciale și în divizia Chirie din /produse."
        action={
          <div className="flex items-center gap-2">
            <Button variant="outline" asChild>
              <Link href="/admin/chirie/categorii">Tipuri (filtre)</Link>
            </Button>
            <Button variant="accent" asChild>
              <Link href="/admin/chirie/nou">
                <Plus className="w-4 h-4" aria-hidden />
                Adaugă anunț
              </Link>
            </Button>
          </div>
        }
      />

      <p className="text-sm text-muted-foreground mb-4">{listings.length} anunțuri</p>

      {listings.length === 0 ? (
        <div className="bg-card border border-border rounded-2xl p-10 text-center text-muted-foreground">
          Nu există anunțuri adăugate încă.
        </div>
      ) : (
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <div className="divide-y divide-border">
            {listings.map((l) => (
              <ListingRow key={l.id} listing={l} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
