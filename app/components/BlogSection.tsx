import Image from "next/image";
import Link from "next/link";
import { ImageOff, ArrowRight } from "lucide-react";
import { Badge } from "@/app/components/ui/badge";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  description: string;
  image: string | null;
  createdAt: Date;
}

interface Props {
  posts: BlogPost[];
}

export default function BlogSection({ posts }: Props) {
  return (
    <section className="py-16 bg-muted">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-end justify-between mb-10 gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-primary tracking-tight">Blog & Ghiduri utile</h2>
            <p className="text-muted-foreground mt-1">Sfaturi de la echipa noastră</p>
          </div>
          <Link
            href="/blog"
            className="hidden sm:inline-flex items-center gap-1.5 text-foreground hover:text-accent text-sm font-semibold transition-colors rounded"
          >
            Toate articolele
            <ArrowRight className="w-4 h-4" aria-hidden />
          </Link>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <article
              key={post.id}
              className="group bg-card rounded-2xl border border-border shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden hover:-translate-y-1"
            >
              <Link href={`/blog/${post.slug}`} className="block">
                <div className="relative h-48 bg-secondary/20 overflow-hidden">
                  {post.image ? (
                    <Image
                      src={post.image}
                      alt={post.title}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <ImageOff className="w-16 h-16 text-muted-foreground/30" aria-hidden />
                    </div>
                  )}
                  <Badge variant="default" className="absolute top-3 left-3">
                    Ghid
                  </Badge>
                </div>
              </Link>

              <div className="p-5">
                <Link href={`/blog/${post.slug}`} className="rounded">
                  <h3 className="text-base font-bold text-foreground group-hover:text-accent transition-colors leading-snug mb-2">
                    {post.title}
                  </h3>
                </Link>
                <p className="text-sm text-muted-foreground leading-relaxed mb-4 line-clamp-2">
                  {post.description}
                </p>
                <Link
                  href={`/blog/${post.slug}`}
                  className="inline-flex items-center gap-1.5 text-accent hover:text-brand-red-dark text-sm font-semibold transition-colors rounded"
                >
                  Citește
                  <ArrowRight className="w-4 h-4" aria-hidden />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
