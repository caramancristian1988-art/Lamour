import Link from "next/link";
import Image from "next/image";

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
}

interface Props {
  categories: Category[];
}

const localDescriptions: Record<string, string> = {
  "conditioane-rezidentiale": "Pentru confortul casei tale",
  "conditioane-comerciale": "Soluții pentru spații mari",
  "sisteme-multisplit": "Conectează până la 5 unități",
  "conditioane-portabile": "Flexibile și ușor de mutat",
  "accesorii-consumabile": "Tot ce ai nevoie pentru instalare",
};

const localImages: Record<string, string> = {
  "conditioane-rezidentiale": "/rezidentiale.avif",
  "conditioane-comerciale": "/Aparat-aer-conditionat-tavan-Daikin-Climatizare-sibiu-600x600.webp",
  "sisteme-multisplit": "/multisplit.webp",
  "conditioane-portabile": "/portabile.webp",
  "accesorii-consumabile": "/9e0723f0-6ade-49f6-abca-8102bebbfec0.png",
};

export default function CategoryGrid({ categories }: Props) {
  return (
    <section className="py-16 bg-[#f6f8fb]">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-extrabold text-[#111827] uppercase tracking-wide">
            Categorii <span className="text-[#c7092b]">populare</span>
          </h2>
          <Link href="/produse" className="text-sm text-[#c7092b] hover:underline font-semibold flex items-center gap-1">
            Vezi toate categoriile
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
          {categories.map((cat) => {
            const imageSrc = localImages[cat.slug] ?? cat.image;
            const description = localDescriptions[cat.slug] ?? cat.description;
            return (
              <Link
                key={cat.id}
                href={`/produse?cat=${cat.slug}`}
                className="group flex flex-col items-center bg-white rounded-2xl border border-[#e5e7eb] p-4 sm:p-6 text-center transition-all duration-300 hover:shadow-lg hover:-translate-y-[3px]"
              >
                {/* Image container */}
                <div className="relative w-24 h-24 sm:w-[180px] sm:h-[180px] lg:w-[210px] lg:h-[210px] mb-5 flex-shrink-0">
                  {imageSrc ? (
                    <Image
                      src={imageSrc}
                      alt={cat.name}
                      fill
                      sizes="(max-width: 640px) 96px, 180px"
                      className="object-contain"
                    />
                  ) : (
                    <div className="w-full h-full rounded-xl bg-gradient-to-br from-[#eef3ff] to-[#e8f4fd]" />
                  )}
                </div>

                {/* Title */}
                <h3 className="text-[17px] font-bold text-[#111827] leading-snug mb-2 line-clamp-2 max-w-[130px] text-center">
                  {cat.name}
                </h3>

                {/* Description */}
                <p className="text-[13px] text-[#6b7280] leading-snug text-center line-clamp-2">
                  {description}
                </p>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
