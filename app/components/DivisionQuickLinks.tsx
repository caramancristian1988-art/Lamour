import Link from "next/link";
import { ArrowRight, Sofa, Building2 } from "lucide-react";
import { HeadingFlourish } from "@/app/components/ui/motif";

const items = [
  {
    href: "/mobila",
    title: "Mobilă",
    description: "Fabricație de mobilier la comandă — pentru birou și pentru casă.",
    Icon: Sofa,
  },
  {
    href: "/spatii-comerciale",
    title: "Chirie",
    description: "Birouri, depozite și spații comerciale disponibile spre închiriere.",
    Icon: Building2,
  },
];

export default function DivisionQuickLinks() {
  return (
    <section className="relative overflow-hidden py-12 sm:py-16 bg-background">
      <div className="relative max-w-7xl mx-auto px-4">
        <div className="flex items-center gap-2.5 mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-primary tracking-tight uppercase">Alte domenii</h2>
          <HeadingFlourish />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="group flex items-center gap-5 bg-card border border-border rounded-2xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 p-6"
            >
              <div className="w-16 h-16 shrink-0 rounded-2xl bg-secondary/25 flex items-center justify-center transition-transform duration-300 group-hover:scale-105">
                <item.Icon className="w-9 h-9 text-primary" aria-hidden />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-foreground text-base mb-1">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
              </div>
              <ArrowRight className="w-5 h-5 text-accent shrink-0 transition-transform duration-300 group-hover:translate-x-1" aria-hidden />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
