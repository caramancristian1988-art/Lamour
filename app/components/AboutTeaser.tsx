import Link from "next/link";
import Image from "next/image";
import { Button } from "@/app/components/ui/button";
import { MotifDivider } from "@/app/components/ui/motif";

export default function AboutTeaser() {
  return (
    <section className="py-16 sm:py-20">
      <div className="max-w-7xl mx-auto px-4">
        <MotifDivider className="mb-10 sm:mb-14" />

        <div className="grid lg:grid-cols-2 gap-10 lg:gap-14 items-center">
          <div>
            <p className="text-xs font-bold text-accent uppercase tracking-widest mb-3">Despre noi</p>
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
            <Button asChild variant="accent" size="lg">
              <Link href="/despre">Citește mai mult</Link>
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="relative h-40 sm:h-48 rounded-2xl overflow-hidden col-span-2">
              {/* Placeholder — swap for a real production-line/factory photo. */}
              <Image src="https://placehold.co/800x400/9D5654/ffffff?text=Fabrica+noastra" alt="Fabrica L'amour Cu Dragoste" fill className="object-cover" />
            </div>
            <div className="relative h-32 sm:h-40 rounded-2xl overflow-hidden">
              {/* Placeholder — swap for a real photo of the packaging line/products. */}
              <Image src="https://placehold.co/400x300/D8B2B1/652F37?text=Produsele+noastre" alt="Produsele L'amour Cu Dragoste" fill className="object-cover" />
            </div>
            <div className="relative h-32 sm:h-40 rounded-2xl overflow-hidden">
              {/* Placeholder — reserved for a respectful, inclusive photo of a
                  visually-impaired employee at work (e.g. with a white cane),
                  once real photography is available. */}
              <Image src="https://placehold.co/400x300/710808/ffffff?text=Echipa+noastra" alt="Echipa noastră incluzivă" fill className="object-cover" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
