import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Pencil, Plus } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Badge } from "@/app/components/ui/badge";
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
          <Button variant="accent" asChild>
            <Link href="/admin/blog/nou">
              <Plus className="w-4 h-4" aria-hidden />
              Articol nou
            </Link>
          </Button>
        }
      />

      {posts.length === 0 ? (
        <div className="bg-card border border-border rounded-2xl p-10 text-center text-muted-foreground">
          Nu există articole adăugate încă.
        </div>
      ) : (
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <div className="divide-y divide-border">
            {posts.map((post) => (
              <div key={post.id} className="flex items-start p-4">
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm text-primary line-clamp-2 leading-snug">{post.title}</p>
                  <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                    <p className="text-xs text-muted-foreground">/blog/{post.slug}</p>
                    <form action={togglePublishAction}>
                      <input type="hidden" name="id" value={post.id} />
                      <input type="hidden" name="published" value={post.published ? "1" : "0"} />
                      <button type="submit" aria-label={post.published ? `Marchează "${post.title}" ca draft` : `Publică "${post.title}"`}>
                        <Badge variant={post.published ? "success" : "muted"} className="cursor-pointer">
                          {post.published ? "Publicat" : "Draft"}
                        </Badge>
                      </button>
                    </form>
                    <div className="ml-auto flex items-center gap-0.5">
                      <Button variant="ghost" size="icon" asChild>
                        <Link href={`/admin/blog/${post.id}`} aria-label={`Editează articolul ${post.title}`}>
                          <Pencil className="w-4 h-4" aria-hidden />
                        </Link>
                      </Button>
                      <DeleteButton
                        action={deleteBlogPostAction}
                        id={post.id}
                        confirmText="Sigur vrei să ștergi acest articol?"
                        label={`Șterge articolul ${post.title}`}
                      />
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
