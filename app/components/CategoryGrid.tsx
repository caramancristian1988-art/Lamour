import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ImageOff } from "lucide-react";

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

export default function CategoryGrid({ categories }: Props) {
  return (
    <section className="py-16 sm:py-20 bg-muted">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between mb-8 gap-4">
          <h2 className="text-2xl sm:text-3xl font-bold text-primary tracking-tight">
            Categorii <span className="text-accent">populare</span>
          </h2>
          <Link
            href="/produse"
            className="text-sm text-accent hover:underline font-semibold flex items-center gap-1 shrink-0 rounded"
          >
            Vezi toate
            <ArrowRight className="w-4 h-4" aria-hidden />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/produse?cat=${cat.slug}`}
              className="group flex flex-col items-center bg-card rounded-2xl border border-border p-4 sm:p-6 text-center transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
            >
              <div className="relative w-20 h-20 sm:w-32 sm:h-32 mb-4 shrink-0 rounded-xl overflow-hidden bg-secondary/30 flex items-center justify-center">
                {cat.image ? (
                  <Image
                    src={cat.image}
                    alt={cat.name}
                    fill
                    sizes="(max-width: 640px) 80px, 128px"
                    className="object-contain"
                  />
                ) : (
                  <ImageOff className="w-8 h-8 text-muted-foreground" aria-hidden />
                )}
              </div>
              <h3 className="text-base font-bold text-foreground leading-snug mb-1.5 line-clamp-2">{cat.name}</h3>
              {cat.description && (
                <p className="text-sm text-muted-foreground leading-snug line-clamp-2">{cat.description}</p>
              )}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
