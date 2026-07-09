import type { LucideIcon } from "lucide-react";
import { MotifBackground } from "@/app/components/ui/motif";

interface Benefit {
  icon: LucideIcon;
  title: string;
  text: string;
}

interface Props {
  eyebrow: string;
  title: string;
  benefits: Benefit[];
}

export default function DivisionBenefits({ eyebrow, title, benefits }: Props) {
  return (
    <section className="relative overflow-hidden py-16 sm:py-20 bg-background">
      <MotifBackground />
      <div className="relative max-w-7xl mx-auto px-4">
        <div className="text-center mb-10">
          <p className="text-xs font-bold text-accent uppercase tracking-widest mb-3">{eyebrow}</p>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-primary tracking-tight">{title}</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {benefits.map((b) => (
            <div
              key={b.title}
              className="bg-card border border-border rounded-2xl shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 p-6 text-center flex flex-col items-center"
            >
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <b.icon className="w-7 h-7 text-primary" aria-hidden />
              </div>
              <h3 className="font-bold text-foreground text-sm mb-2">{b.title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{b.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
