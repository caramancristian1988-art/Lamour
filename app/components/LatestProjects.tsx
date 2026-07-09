import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ImageOff } from "lucide-react";
import { MotifBackground } from "@/app/components/ui/motif";

interface Project {
  id: string;
  title: string;
  description: string;
  images: string[];
}

interface Props {
  projects: Project[];
}

export default function LatestProjects({ projects }: Props) {
  if (projects.length === 0) return null;

  return (
    <section className="relative overflow-hidden py-16 sm:py-20 bg-background">
      <MotifBackground />
      <div className="relative max-w-7xl mx-auto px-4">
        <div className="flex items-end justify-between mb-10 gap-4">
          <h2 className="text-2xl sm:text-3xl font-bold text-primary tracking-tight">
            Ultimele <span className="text-accent">proiecte</span>
          </h2>
          <Link href="/proiecte" className="text-sm text-accent hover:underline font-semibold flex items-center gap-1 shrink-0 rounded">
            Vezi toate proiectele
            <ArrowRight className="w-4 h-4" aria-hidden />
          </Link>
        </div>

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
              </div>
              <div className="flex flex-col flex-1 p-5">
                <h3 className="text-sm font-bold text-foreground leading-snug mb-2 line-clamp-2">{p.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3 flex-1">{p.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
