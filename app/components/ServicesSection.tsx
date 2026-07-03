import Link from "next/link";
import { Wrench, HeartPulse, Stethoscope, ShieldCheck } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { MotifBackground } from "@/app/components/ui/motif";

const services = [
  { icon: Wrench, title: "Instalare rapidă și sigură" },
  { icon: HeartPulse, title: "Mentenanță periodică" },
  { icon: Stethoscope, title: "Diagnosticare & suport" },
  { icon: ShieldCheck, title: "Garanție pentru servicii" },
];

export default function ServicesSection() {
  return (
    <section className="py-10 sm:py-16 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="relative rounded-3xl overflow-hidden bg-brand-maroon">
          <MotifBackground className="opacity-[0.08]" />
          <div className="relative grid lg:grid-cols-2 gap-8 px-6 sm:px-10 py-10 sm:py-14">
            <div className="flex flex-col justify-center">
              <p className="text-xs font-bold text-brand-rose-light uppercase tracking-widest mb-3">
                Servicii pentru comunitate
              </p>
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3 leading-snug tracking-tight">
                Suport și îndrumare, la fiecare pas
              </h2>
              <p className="text-white/70 text-sm sm:text-base leading-relaxed mb-6 max-w-md">
                Echipa noastră oferă servicii complete de sprijin, orientare și asistență
                pentru persoanele nevăzătoare și familiile lor.
              </p>
              <Button asChild variant="accent" className="self-start">
                <Link href="/servicii">Vezi serviciile</Link>
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-4 sm:gap-5 content-center lg:border-l lg:border-white/10 lg:pl-8">
              {services.map((s) => (
                <div key={s.title} className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full border border-white/25 flex items-center justify-center text-white/80 shrink-0">
                    <s.icon className="w-5 h-5" aria-hidden />
                  </div>
                  <span className="text-white text-sm font-medium leading-tight">{s.title}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
