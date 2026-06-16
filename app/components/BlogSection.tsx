import Image from "next/image";
import Link from "next/link";

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
    <section className="py-16 bg-[#f6f8fb]">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-end justify-between mb-10">
          <div>
            <h2 className="text-3xl font-extrabold text-[#111827]">Blog & Ghiduri utile</h2>
            <p className="text-[#6b7280] mt-1">Sfaturi de la experții noștri</p>
          </div>
          <Link
            href="/blog"
            className="hidden sm:inline-flex items-center gap-1.5 text-[#1d2353] hover:text-[#c7092b] text-sm font-semibold transition-colors"
          >
            Toate articolele
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <article
              key={post.id}
              className="group bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden hover:-translate-y-1"
            >
              <Link href={`/blog/${post.slug}`} className="block">
                <div className="relative h-48 bg-gradient-to-br from-[#eef3ff] to-[#e8f4fd] overflow-hidden">
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
                      <svg className="w-16 h-16 text-[#1d2353]/20" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                    </div>
                  )}
                  <div className="absolute top-3 left-3 bg-[#1d2353] text-white text-[10px] font-bold px-2.5 py-1 rounded-lg">
                    Ghid
                  </div>
                </div>
              </Link>

              <div className="p-5">
                <Link href={`/blog/${post.slug}`}>
                  <h3 className="text-base font-bold text-[#111827] group-hover:text-[#c7092b] transition-colors leading-snug mb-2">
                    {post.title}
                  </h3>
                </Link>
                <p className="text-sm text-[#6b7280] leading-relaxed mb-4 line-clamp-2">
                  {post.description}
                </p>
                <Link
                  href={`/blog/${post.slug}`}
                  className="inline-flex items-center gap-1.5 text-[#c7092b] hover:text-[#a5071f] text-sm font-semibold transition-colors"
                >
                  Citește
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
