import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { ImageOff, Pencil, Plus } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import AdminPageHeader from "../components/AdminPageHeader";
import DeleteButton from "../components/DeleteButton";
import { deleteBannerAction } from "@/lib/adminBannerActions";

async function getBanners() {
  try {
    return await prisma.banner.findMany({ orderBy: { order: "asc" } });
  } catch {
    return [];
  }
}

export default async function AdminBannerePage() {
  const banners = await getBanners();

  return (
    <div>
      <AdminPageHeader
        title="Bannere"
        description="Caruselul de oferte afișat pe pagina principală, sub textul de introducere."
        action={
          <Button variant="accent" asChild>
            <Link href="/admin/bannere/nou">
              <Plus className="w-4 h-4" aria-hidden />
              Adaugă banner
            </Link>
          </Button>
        }
      />

      {banners.length === 0 ? (
        <div className="bg-card border border-border rounded-2xl p-10 text-center text-muted-foreground">
          Nu există bannere adăugate încă.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {banners.map((b) => (
            <div key={b.id} className="bg-card border border-border rounded-2xl overflow-hidden">
              <div className="relative h-32 bg-muted">
                {b.image ? (
                  <Image src={b.image} alt={b.alt} fill className="object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                    <ImageOff className="w-8 h-8" aria-hidden />
                  </div>
                )}
                <span className="absolute top-2 left-2 bg-black/60 text-white text-[10px] font-bold px-2 py-1 rounded-full">
                  #{b.order}
                </span>
              </div>
              <div className="p-4">
                <p className="font-bold text-sm text-primary line-clamp-2">{b.alt}</p>
                <p className="text-xs text-muted-foreground truncate mt-1">{b.link || "Fără link"}</p>
                <div className="flex items-center justify-end gap-0.5 mt-3">
                  <Button variant="ghost" size="icon" asChild>
                    <Link href={`/admin/bannere/${b.id}`} aria-label={`Editează bannerul ${b.alt}`}>
                      <Pencil className="w-4 h-4" aria-hidden />
                    </Link>
                  </Button>
                  <DeleteButton
                    action={deleteBannerAction}
                    id={b.id}
                    confirmText="Sigur vrei să ștergi acest banner?"
                    label={`Șterge bannerul ${b.alt}`}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
