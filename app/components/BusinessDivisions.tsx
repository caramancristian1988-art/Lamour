import Link from "next/link";
import { ArrowRight, Sofa, Package, Building2 } from "lucide-react";
import { categoryIcons } from "./CategoryIcons";
import { MotifBackground } from "@/app/components/ui/motif";

const PaperIcon = categoryIcons["hartie-igienica"];

const divisions = [
  {
    slug: "produse",
    href: "/produse",
    title: "Produse din hârtie",
    description: "Hârtie igienică, șervețele, prosoape și produse de uz casnic, din 100% celuloză.",
    Icon: PaperIcon,
  },
  {
    slug: "mobila",
    href: "/mobila",
    title: "Mobilă",
    description: "Fabricație de mobilier la comandă — pentru birou și pentru casă.",
    Icon: Sofa,
  },
  {
    slug: "ambalaje",
    href: "/productie-la-comanda",
    title: "Ambalaje și fabricație la comandă",
    description: "Producție sub marcă proprie (private label) și servicii de ambalare.",
    Icon: Package,
  },
  {
    slug: "spatii",
    href: "/spatii-comerciale",
    title: "Spații comerciale",
    description: "Birouri, depozite și spații industriale disponibile spre închiriere.",
    Icon: Building2,
  },
];

export default function BusinessDivisions() {
  return (
    <section className="relative overflow-hidden py-16 sm:py-20 bg-background">
      <MotifBackground />
      <div className="relative max-w-7xl mx-auto px-4">
        <div className="text-center mb-10">
          <p className="text-xs font-bold text-accent uppercase tracking-widest mb-3">Domeniile noastre de activitate</p>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-primary tracking-tight">
            Mai mult decât un producător de hârtie igienică
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {divisions.map((d) => (
            <Link
              key={d.slug}
              href={d.href}
              className="group flex flex-col bg-card border border-border rounded-2xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 p-6"
            >
              <div className="w-16 h-16 rounded-2xl bg-secondary/25 flex items-center justify-center mb-5 transition-transform duration-300 group-hover:scale-105">
                <d.Icon className="w-9 h-9 text-primary" aria-hidden />
              </div>
              <h3 className="font-bold text-foreground text-base mb-2">{d.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed mb-5 flex-1">{d.description}</p>
              <span className="inline-flex items-center gap-1.5 text-sm font-bold text-accent">
                Află mai multe
                <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" aria-hidden />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
