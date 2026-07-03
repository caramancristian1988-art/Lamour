import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ImageOff, ArrowRight } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { SITE_NAME } from "@/lib/constants";
import { Button } from "@/app/components/ui/button";
import { MotifDivider } from "@/app/components/ui/motif";

export const metadata: Metadata = {
  title: `Proiecte realizate | ${SITE_NAME}`,
  description: `Portofoliu de proiecte și programe derulate de ${SITE_NAME} pentru comunitatea persoanelor nevăzătoare din Moldova.`,
};

export const revalidate = 3600;

async function getProjects() {
  try {
    return await prisma.project.findMany({ orderBy: { createdAt: "desc" } });
  } catch {
    return [];
  }
}

async function isProiecteEnabled() {
  try {
    const settings = await prisma.settings.findFirst();
    return settings?.proiecteEnabled ?? false;
  } catch {
    return false;
  }
}

export default async function ProiectePage() {
  if (!(await isProiecteEnabled())) notFound();

  const projects = await getProjects();

  return (
    <main className="bg-background">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="relative h-[70vw] max-h-[380px] min-h-[240px] sm:h-[38vh] sm:min-h-[300px]">
          <Image
            src="/IMG_2851.PNG"
            alt=""
            fill
            className="object-cover object-center"
            priority
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background from-15% via-background/70 via-45% to-transparent to-75%" />
          <div className="absolute inset-0 flex flex-col justify-center max-w-7xl mx-auto px-5 sm:px-6 lg:px-12">
            <nav aria-label="Fir de ariadnă" className="flex items-center gap-1.5 text-xs sm:text-sm text-muted-foreground mb-4">
              <Link href="/" className="hover:text-accent transition-colors rounded">Acasă</Link>
              <span aria-hidden>›</span>
              <span className="text-foreground font-medium">Proiecte</span>
            </nav>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight tracking-tight mb-4 text-primary max-w-md">
              Proiecte realizate
            </h1>
            <p className="text-sm sm:text-base text-foreground/80 leading-relaxed max-w-sm">
              O parte din proiectele și programele derulate de echipa și voluntarii noștri.
            </p>
          </div>
        </div>
      </section>

      {/* GRID */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-5 sm:px-6">
          {projects.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-muted-foreground">Momentan nu există proiecte publicate.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((p) => (
                <div
                  key={p.id}
                  className="group flex flex-col rounded-2xl border border-border overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 bg-card"
                >
                  <div className="relative h-52 bg-muted overflow-hidden">
                    {p.images[0] ? (
                      <Image
                        src={p.images[0]}
                        alt={p.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground/40">
                        <ImageOff className="w-10 h-10" aria-hidden />
                      </div>
                    )}
                    {p.images.length > 1 && (
                      <span className="absolute bottom-3 right-3 bg-black/60 text-white text-[10px] font-bold px-2.5 py-1 rounded-md">
                        +{p.images.length - 1} foto
                      </span>
                    )}
                  </div>
                  <div className="flex flex-col flex-1 p-5">
                    <h2 className="text-sm font-bold text-foreground leading-snug mb-2 line-clamp-2">{p.title}</h2>
                    <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3 flex-1">{p.description}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <MotifDivider className="max-w-7xl mx-auto" />

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-12 pb-16 pt-4">
        <div className="bg-primary rounded-2xl px-6 sm:px-8 py-8 sm:py-10 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <p className="text-white font-bold text-lg">Vrei un proiect similar în comunitatea ta?</p>
            <p className="text-white/70 text-sm mt-0.5">Scrie-ne și discutăm despre un posibil parteneriat.</p>
          </div>
          <Button asChild variant="accent" size="lg" className="shrink-0">
            <Link href="/contact">
              Contactează-ne
              <ArrowRight className="w-4 h-4" aria-hidden />
            </Link>
          </Button>
        </div>
      </section>
    </main>
  );
}
