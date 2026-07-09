import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { Badge } from "@/app/components/ui/badge";
import { MotifBackground } from "@/app/components/ui/motif";

interface Post {
  slug: string;
  title: string;
  description: string;
  category: string | null;
  image: string | null;
  createdAt: Date;
}

interface Props {
  posts: Post[];
}

export default function LatestNews({ posts }: Props) {
  if (posts.length === 0) return null;

  return (
    <section className="relative overflow-hidden py-16 sm:py-20 bg-background">
      <MotifBackground />
      <div className="relative max-w-7xl mx-auto px-4">
        <div className="flex items-end justify-between mb-10 gap-4">
          <h2 className="text-2xl sm:text-3xl font-bold text-primary tracking-tight">
            Ultimele <span className="text-accent">noutăți</span>
          </h2>
          <Link href="/blog" className="text-sm text-accent hover:underline font-semibold flex items-center gap-1 shrink-0 rounded">
            Vezi toate noutățile
            <ArrowRight className="w-4 h-4" aria-hidden />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="group flex flex-col rounded-2xl border border-border overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 bg-card"
            >
              <div className="relative h-44 bg-muted overflow-hidden">
                {post.image && (
                  <Image
                    src={post.image}
                    alt={post.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                )}
                {post.category && (
                  <Badge className="absolute top-3 left-3">{post.category}</Badge>
                )}
              </div>
              <div className="flex flex-col flex-1 p-5">
                <p className="text-xs text-muted-foreground mb-2">
                  {post.createdAt.toLocaleDateString("ro-MD", { day: "numeric", month: "long", year: "numeric" })}
                </p>
                <h3 className="text-sm font-bold text-foreground leading-snug line-clamp-2">{post.title}</h3>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
