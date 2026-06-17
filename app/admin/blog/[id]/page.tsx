import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import AdminPageHeader from "../../components/AdminPageHeader";
import BlogForm from "../BlogForm";
import { updateBlogPostAction } from "@/lib/adminBlogActions";

export default async function EditBlogPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const post = await prisma.blogPost.findUnique({ where: { id } });
  if (!post) notFound();

  return (
    <div>
      <AdminPageHeader title="Editează articol" />
      <BlogForm action={updateBlogPostAction} defaults={post} submitLabel="Salvează modificările" />
    </div>
  );
}
