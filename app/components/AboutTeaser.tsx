import Link from "next/link";
import { HeartHandshake } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { MotifBackground, HeadingFlourish } from "@/app/components/ui/motif";
import FacebookVideo from "@/app/components/FacebookVideo";
import { INTRO_VIDEO } from "@/lib/siteVideos";

export default function AboutTeaser() {
  return (
    <section className="relative overflow-hidden py-8 sm:py-10 bg-background">
      <MotifBackground />
      <div className="relative max-w-7xl mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-14 lg:items-stretch">
          <div className="flex flex-col justify-center">
            <p className="flex items-center gap-2 text-xs font-bold text-accent uppercase tracking-widest mb-3">
              Despre noi
              <HeadingFlourish className="w-4 h-4" />
            </p>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-primary tracking-tight mb-4">
              Suntem o companie din Republica Moldova
            </h2>
            <p className="text-foreground/80 leading-relaxed mb-4">
              Producem hârtie igienică, șervețele și alte produse de uz casnic, din 100% celuloză, cu grijă
              pentru oameni și pentru natură.
            </p>
            <p className="text-foreground/80 leading-relaxed mb-8">
              Ne implicăm activ în susținerea incluziunii sociale, oferind locuri de muncă persoanelor cu
              dizabilități — o parte din echipa noastră este formată din angajați ai Asociației Nevăzătorilor
              din Moldova.
            </p>
            <Button asChild variant="accent" size="lg" className="self-start">
              <Link href="/despre">Citește mai mult</Link>
            </Button>
          </div>

          <FacebookVideo
            videoUrl={INTRO_VIDEO.url}
            poster={INTRO_VIDEO.poster}
            title={INTRO_VIDEO.title}
            className="aspect-video w-full lg:aspect-auto lg:h-full lg:min-h-[320px] rounded-2xl"
          />
        </div>

        <div className="mt-10 sm:mt-14 flex items-center justify-center gap-3 bg-secondary/20 border border-accent/30 rounded-2xl px-6 py-4 text-center">
          <HeartHandshake className="w-5 h-5 text-primary shrink-0" aria-hidden />
          <p className="text-sm sm:text-base italic text-primary font-medium">
            Credem într-o lume mai bună, în care fiecare persoană are șansa de a fi utilă și respectată.
          </p>
        </div>
      </div>
    </section>
  );
}
