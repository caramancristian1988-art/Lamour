import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { Image as ImageIcon, Pencil, Plus } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import AdminPageHeader from "../components/AdminPageHeader";
import DeleteButton from "../components/DeleteButton";
import { deleteProjectAction } from "@/lib/adminProjectActions";

async function getProjects() {
  try {
    return await prisma.project.findMany({ orderBy: { createdAt: "desc" } });
  } catch {
    return [];
  }
}

export default async function AdminProiectePage() {
  const projects = await getProjects();

  return (
    <div>
      <AdminPageHeader
        title="Proiecte"
        description="Galeria de proiecte realizate, afișată vizitatorilor."
        action={
          <Button variant="accent" asChild>
            <Link href="/admin/proiecte/nou">
              <Plus className="w-4 h-4" aria-hidden />
              Adaugă proiect
            </Link>
          </Button>
        }
      />

      {projects.length === 0 ? (
        <div className="bg-card border border-border rounded-2xl p-10 text-center text-muted-foreground">
          Nu există proiecte adăugate încă.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((p) => (
            <div key={p.id} className="bg-card border border-border rounded-2xl overflow-hidden">
              <div className="relative h-40 bg-muted">
                {p.images[0] ? (
                  <Image src={p.images[0]} alt={p.title} fill className="object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                    <ImageIcon className="w-8 h-8" aria-hidden />
                  </div>
                )}
                {p.images.length > 1 && (
                  <span className="absolute bottom-2 right-2 bg-black/60 text-white text-[10px] font-bold px-2 py-1 rounded-full">
                    +{p.images.length - 1} foto
                  </span>
                )}
              </div>
              <div className="p-4">
                <p className="font-bold text-sm text-primary truncate">{p.title}</p>
                <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{p.description}</p>
                <div className="flex items-center justify-end gap-0.5 mt-3">
                  <Button variant="ghost" size="icon" asChild>
                    <Link href={`/admin/proiecte/${p.id}`} aria-label={`Editează proiectul ${p.title}`}>
                      <Pencil className="w-4 h-4" aria-hidden />
                    </Link>
                  </Button>
                  <DeleteButton
                    action={deleteProjectAction}
                    id={p.id}
                    confirmText="Sigur vrei să ștergi acest proiect?"
                    label={`Șterge proiectul ${p.title}`}
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
