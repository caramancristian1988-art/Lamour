import Link from "next/link";
import { HeartHandshake, Users, Sparkles } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { MotifBackground } from "@/app/components/ui/motif";
import { SITE_NAME } from "@/lib/constants";

const points = [
  { icon: Users, text: "O parte din echipa noastră este formată din angajați ai Asociației Nevăzătorilor din Moldova" },
  { icon: HeartHandshake, text: "Locuri de muncă stabile, demne și adaptate, într-un mediu de producție modern" },
  { icon: Sparkles, text: "Convingerea că fiecare persoană merită șansa de a fi utilă și respectată" },
];

export default function SocialImpact() {
  return (
    <section className="relative overflow-hidden py-16 sm:py-20 bg-primary text-white">
      <MotifBackground className="opacity-[0.08]" />
      <div className="relative max-w-7xl mx-auto px-4">
        <div className="max-w-3xl">
          <p className="text-xs font-bold text-brand-rose-light uppercase tracking-widest mb-3">Impact social</p>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold leading-tight tracking-tight mb-5">
            Credem într-o lume mai bună, în care fiecare persoană are șansa de a fi utilă și respectată.
          </h2>
          <p className="text-white/80 leading-relaxed mb-8 max-w-lg">
            {SITE_NAME} colaborează cu Asociația Nevăzătorilor din Moldova, oferind locuri de
            muncă persoanelor cu dizabilități vizuale. Este parte din felul nostru de a face afaceri —
            cu grijă pentru oameni, nu doar pentru produse.
          </p>

          <div className="flex flex-col gap-4 mb-8">
            {points.map((p) => (
              <div key={p.text} className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                  <p.icon className="w-5 h-5 text-brand-rose-light" aria-hidden />
                </div>
                <p className="text-sm text-white/85 leading-relaxed pt-2">{p.text}</p>
              </div>
            ))}
          </div>

          <Button asChild variant="accent" size="lg">
            <Link href="/despre">Află mai multe despre noi</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
