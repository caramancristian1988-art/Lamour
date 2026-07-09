import { ShieldCheck, Building2, MapPin, Accessibility } from "lucide-react";
import { MotifBackground } from "@/app/components/ui/motif";

const items = [
  { icon: ShieldCheck, title: "Calitate garantată", subtitle: "Control riguros la fiecare etapă de producție" },
  { icon: Building2, title: "4 domenii de activitate", subtitle: "Hârtie, mobilă, ambalaje și spații comerciale" },
  { icon: MapPin, title: "Fabricat în Moldova", subtitle: "Susținem locurile de muncă și economia locală" },
  { icon: Accessibility, title: "Accesibil pentru toți", subtitle: "Susținem incluziunea persoanelor cu dizabilități" },
];

export default function TrustBar() {
  return (
    <div className="relative overflow-hidden bg-background py-10 sm:py-12">
      <MotifBackground />
      <div className="relative max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
          {items.map((item) => (
            <div key={item.title} className="flex flex-col items-center text-center gap-3">
              <div className="w-16 h-16 sm:w-[70px] sm:h-[70px] rounded-full border-2 border-accent/60 flex items-center justify-center shrink-0">
                <item.icon className="w-6 h-6 sm:w-7 sm:h-7 text-primary" aria-hidden />
              </div>
              <div>
                <p className="text-sm sm:text-base font-bold text-primary tracking-tight">{item.title}</p>
                <p className="text-xs text-muted-foreground mt-1 leading-snug max-w-[180px] mx-auto">{item.subtitle}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
