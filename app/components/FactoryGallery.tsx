import Image from "next/image";
import { MotifDivider } from "@/app/components/ui/motif";

// Placeholder gallery — swap each image for a real factory photo when available.
const photos = [
  { label: "Linia de producție", color: "9D5654" },
  { label: "Utilaje moderne", color: "710808" },
  { label: "Ambalare", color: "D8B2B1" },
  { label: "Materie primă", color: "9D5654" },
  { label: "Control calitate", color: "710808" },
  { label: "Depozitare", color: "D8B2B1" },
  { label: "Echipa noastră", color: "9D5654" },
  { label: "Livrare", color: "710808" },
];

export default function FactoryGallery() {
  return (
    <section className="py-16 sm:py-20 bg-card">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-10">
          <p className="text-xs font-bold text-accent uppercase tracking-widest mb-3">Fabrica noastră</p>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-primary tracking-tight">
            De la materie primă, la produsul din casa ta
          </h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {photos.map((photo) => (
            <div key={photo.label} className="relative h-40 sm:h-48 rounded-2xl overflow-hidden">
              <Image
                src={`https://placehold.co/600x600/${photo.color}/ffffff?text=${encodeURIComponent(photo.label)}`}
                alt={photo.label}
                fill
                className="object-cover"
              />
            </div>
          ))}
        </div>

        <MotifDivider className="mt-12" />
      </div>
    </section>
  );
}
