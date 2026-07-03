import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { Image as ImageIcon, Link2, ExternalLink, AlertTriangle, Pencil, Plus } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Badge } from "@/app/components/ui/badge";
import AdminPageHeader from "../components/AdminPageHeader";
import DeleteButton from "../components/DeleteButton";
import { deleteServiceAction } from "@/lib/adminServiceActions";

async function getServices() {
  try {
    return await prisma.service.findMany({ orderBy: [{ section: "asc" }, { order: "asc" }] });
  } catch {
    return [];
  }
}

const KNOWN_HREFS = [
  "/servicii/instalare",
  "/servicii/mentenanta",
  "/servicii/diagnosticare",
  "/servicii/consultanta",
  "/servicii/multisplit",
  "/servicii/comerciale",
];

const sectionLabels: Record<string, string> = {
  principale: "Principale",
  avansate: "Avansate",
  suplimentare: "Suplimentare",
};

export default async function AdminServiciiPage() {
  const services = await getServices();
  const connected = services.filter((s) => s.href && KNOWN_HREFS.includes(s.href));
  const orphan = services.filter((s) => !s.href || !KNOWN_HREFS.includes(s.href));

  return (
    <div>
      <AdminPageHeader
        title="Servicii"
        description="Gestionează serviciile afișate pe site."
        action={
          <Button variant="accent" asChild>
            <Link href="/admin/servicii/nou">
              <Plus className="w-4 h-4" aria-hidden />
              Adaugă serviciu
            </Link>
          </Button>
        }
      />

      {/* Connected services */}
      <div className="mb-3 flex items-center gap-2">
        <Badge variant="success" className="gap-1.5">
          <Link2 className="w-3.5 h-3.5" aria-hidden />
          Conectate la site ({connected.length})
        </Badge>
      </div>

      {connected.length === 0 ? (
        <div className="bg-card border border-border rounded-2xl p-6 text-center text-muted-foreground mb-6">
          Niciun serviciu conectat la site încă.
        </div>
      ) : (
        <div className="bg-card border border-border rounded-2xl overflow-hidden mb-6">
          <div className="divide-y divide-border">
            {connected.map((s) => (
              <div key={s.id} className="flex items-start gap-3 p-4">
                <div className="relative w-12 h-12 rounded-xl bg-muted overflow-hidden shrink-0 mt-0.5">
                  {s.image ? (
                    <Image src={s.image} alt={s.title} fill className="object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                      <ImageIcon className="w-6 h-6" aria-hidden />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-bold text-sm text-primary leading-snug">{s.title}</p>
                    <Badge variant="success">Live</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{s.description}</p>
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    <Badge variant="muted">{sectionLabels[s.section] ?? s.section}</Badge>
                    {s.href && (
                      <a
                        href={s.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-semibold text-muted-foreground hover:text-accent hover:underline flex items-center gap-1"
                      >
                        <ExternalLink className="w-3 h-3" aria-hidden />
                        {s.href}
                      </a>
                    )}
                    <div className="ml-auto flex items-center gap-0.5">
                      <Button variant="ghost" size="icon" asChild>
                        <Link href={`/admin/servicii/${s.id}`} aria-label={`Editează serviciul ${s.title}`}>
                          <Pencil className="w-4 h-4" aria-hidden />
                        </Link>
                      </Button>
                      <DeleteButton
                        action={deleteServiceAction}
                        id={s.id}
                        confirmText="Sigur vrei să ștergi acest serviciu?"
                        label={`Șterge serviciul ${s.title}`}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Orphan services */}
      {orphan.length > 0 && (
        <>
          <div className="mb-3 flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-full">
              <AlertTriangle className="w-3.5 h-3.5" aria-hidden />
              Fără pagină pe site ({orphan.length}) — setează href pentru a conecta
            </span>
          </div>
          <div className="bg-card border border-amber-200 rounded-2xl overflow-hidden">
            <div className="divide-y divide-border">
              {orphan.map((s) => (
                <div key={s.id} className="flex items-start gap-3 p-4 opacity-80">
                  <div className="relative w-12 h-12 rounded-xl bg-muted overflow-hidden shrink-0 mt-0.5">
                    {s.image ? (
                      <Image src={s.image} alt={s.title} fill className="object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                        <ImageIcon className="w-6 h-6" aria-hidden />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-sm text-primary leading-snug">{s.title}</p>
                      <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                        FĂRĂ HREF
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{s.description}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-xs text-muted-foreground italic">
                        Adaugă href în editare pentru a conecta la o pagină din site
                      </span>
                      <div className="ml-auto flex items-center gap-0.5">
                        <Button variant="ghost" size="icon" asChild>
                          <Link href={`/admin/servicii/${s.id}`} aria-label={`Editează serviciul ${s.title}`}>
                            <Pencil className="w-4 h-4" aria-hidden />
                          </Link>
                        </Button>
                        <DeleteButton
                          action={deleteServiceAction}
                          id={s.id}
                          confirmText="Sigur vrei să ștergi acest serviciu?"
                          label={`Șterge serviciul ${s.title}`}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
