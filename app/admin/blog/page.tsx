import Link from "next/link";
import { prisma } from "@/lib/prisma";
import AdminPageHeader from "../components/AdminPageHeader";
import DeleteButton from "../components/DeleteButton";
import { deleteBlogPostAction, togglePublishAction } from "@/lib/adminBlogActions";

async function getPosts() {
  try {
    return await prisma.blogPost.findMany({ orderBy: { createdAt: "desc" } });
  } catch {
    return [];
  }
}

export default async function AdminBlogPage() {
  const posts = await getPosts();

  return (
    <div>
      <AdminPageHeader
        title="Blog"
        description="Articolele publicate pe site."
        action={
          <Link
            href="/admin/blog/nou"
            className="inline-flex items-center gap-2 bg-[#c7092b] hover:bg-[#a5071f] text-white font-bold px-5 py-2.5 rounded-xl transition-colors text-sm uppercase tracking-wide"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Articol nou
          </Link>
        }
      />

      {posts.length === 0 ? (
        <div className="bg-white border border-gray-100 rounded-2xl p-10 text-center text-gray-500">
          Nu există articole adăugate încă.
        </div>
      ) : (
        <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
          <div className="divide-y divide-gray-100">
            {posts.map((post) => (
              <div key={post.id} className="flex items-start p-4">
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm text-[#1d2353] line-clamp-2 leading-snug">{post.title}</p>
                  <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                    <p className="text-xs text-gray-400">/blog/{post.slug}</p>
                    <form action={togglePublishAction}>
                      <input type="hidden" name="id" value={post.id} />
                      <input type="hidden" name="published" value={post.published ? "1" : "0"} />
                      <button
                        type="submit"
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase transition-colors ${
                          post.published ? "bg-green-100 text-green-700 hover:bg-green-200" : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                        }`}
                      >
                        {post.published ? "Publicat" : "Draft"}
                      </button>
                    </form>
                    <div className="ml-auto flex items-center gap-0.5">
                      <Link
                        href={`/admin/blog/${post.id}`}
                        className="text-gray-400 hover:text-[#c7092b] transition-colors p-1.5 rounded-lg hover:bg-[#fdf2f3]"
                        aria-label="Editează"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.5-9.5a2.121 2.121 0 113 3L12 13l-4 1 1-4 8.5-8.5z" />
                        </svg>
                      </Link>
                      <DeleteButton action={deleteBlogPostAction} id={post.id} confirmText="Sigur vrei să ștergi acest articol?" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
