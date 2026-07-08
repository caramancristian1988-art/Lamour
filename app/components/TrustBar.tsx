import { Leaf, Layers, MapPin, Accessibility } from "lucide-react";

const items = [
  { icon: Leaf, title: "100% Celuloză", subtitle: "Moale, rezistentă și prietenoasă cu pielea" },
  { icon: Layers, title: "3 Straturi", subtitle: "Pentru extra rezistență și absorbție" },
  { icon: MapPin, title: "Fabricat în Moldova", subtitle: "Susținem locurile de muncă și economia locală" },
  { icon: Accessibility, title: "Accesibil pentru toți", subtitle: "Susținem incluziunea persoanelor cu dizabilități" },
];

export default function TrustBar() {
  return (
    <div className="bg-card border-y border-border">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-y md:divide-y-0 divide-border bg-muted/50 rounded-2xl border border-border overflow-hidden">
          {items.map((item) => (
            <div
              key={item.title}
              className="flex flex-col items-center text-center gap-2 px-3 py-5 md:flex-row md:items-center md:text-left md:gap-4 md:px-6"
            >
              <item.icon className="w-7 h-7 sm:w-8 sm:h-8 text-accent shrink-0" aria-hidden />
              <div>
                <p className="text-xs sm:text-sm font-bold text-foreground tracking-wide">{item.title}</p>
                <p className="text-[11px] sm:text-xs text-muted-foreground mt-0.5">{item.subtitle}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
