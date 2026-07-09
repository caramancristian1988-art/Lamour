import Image from "next/image";
import { MotifDivider, MotifBackground } from "@/app/components/ui/motif";

interface Photo {
  label: string;
  color: string;
}

interface Props {
  eyebrow: string;
  title: string;
  photos: Photo[];
}

export default function DivisionGallery({ eyebrow, title, photos }: Props) {
  return (
    <section className="relative overflow-hidden py-16 sm:py-20 bg-background">
      <MotifBackground />
      <div className="relative max-w-7xl mx-auto px-4">
        <div className="text-center mb-10">
          <p className="text-xs font-bold text-accent uppercase tracking-widest mb-3">{eyebrow}</p>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-primary tracking-tight">{title}</h2>
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
