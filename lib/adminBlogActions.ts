"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "./prisma";
import { requireAdmin } from "./adminAuth";

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export interface BlogFormState {
  error?: string;
}

export async function createBlogPostAction(_prevState: BlogFormState, formData: FormData): Promise<BlogFormState> {
  await requireAdmin();

  const title = String(formData.get("title") ?? "").trim();
  const slugInput = String(formData.get("slug") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const image = String(formData.get("image") ?? "").trim() || null;
  const content = String(formData.get("content") ?? "").trim() || null;
  const category = String(formData.get("category") ?? "").trim() || null;
  const published = formData.get("published") === "on";

  if (!title) return { error: "Completează titlul." };
  const slug = slugify(slugInput || title);
  if (!slug) return { error: "Slug-ul nu este valid." };

  const existing = await prisma.blogPost.findUnique({ where: { slug } });
  if (existing) return { error: "Există deja un articol cu acest slug." };

  await prisma.blogPost.create({ data: { title, slug, description: description || title, image, content, category, published } });
  revalidatePath("/admin/blog");
  revalidatePath("/blog");
  revalidatePath(`/blog/${slug}`);
  if (category) revalidatePath(`/blog/categorie/${slugify(category)}`);
  redirect("/admin/blog");
}

export async function updateBlogPostAction(_prevState: BlogFormState, formData: FormData): Promise<BlogFormState> {
  await requireAdmin();

  const id = String(formData.get("id") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  const slugInput = String(formData.get("slug") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const image = String(formData.get("image") ?? "").trim() || null;
  const content = String(formData.get("content") ?? "").trim() || null;
  const category = String(formData.get("category") ?? "").trim() || null;
  const published = formData.get("published") === "on";

  if (!id) return { error: "Articol invalid." };
  if (!title) return { error: "Completează titlul." };
  const slug = slugify(slugInput || title);
  if (!slug) return { error: "Slug-ul nu este valid." };

  const existing = await prisma.blogPost.findUnique({ where: { slug } });
  if (existing && existing.id !== id) return { error: "Există deja un articol cu acest slug." };

  const before = await prisma.blogPost.findUnique({ where: { id }, select: { slug: true, category: true } });
  await prisma.blogPost.update({
    where: { id },
    data: { title, slug, description: description || title, image, content, category, published },
  });
  revalidatePath("/admin/blog");
  revalidatePath("/blog");
  revalidatePath(`/blog/${slug}`);
  if (before?.slug && before.slug !== slug) revalidatePath(`/blog/${before.slug}`);
  if (category) revalidatePath(`/blog/categorie/${slugify(category)}`);
  if (before?.category && before.category !== category) revalidatePath(`/blog/categorie/${slugify(before.category)}`);
  redirect("/admin/blog");
}

export async function deleteBlogPostAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  const post = await prisma.blogPost.findUnique({ where: { id }, select: { slug: true, category: true } });
  await prisma.blogPost.delete({ where: { id } });
  revalidatePath("/admin/blog");
  revalidatePath("/blog");
  if (post?.slug) revalidatePath(`/blog/${post.slug}`);
  if (post?.category) revalidatePath(`/blog/categorie/${slugify(post.category)}`);
}

export async function togglePublishAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const published = formData.get("published") === "1";
  if (!id) return;
  const post = await prisma.blogPost.findUnique({ where: { id }, select: { slug: true, category: true } });
  await prisma.blogPost.update({ where: { id }, data: { published: !published } });
  revalidatePath("/admin/blog");
  revalidatePath("/blog");
  if (post?.slug) revalidatePath(`/blog/${post.slug}`);
  if (post?.category) revalidatePath(`/blog/categorie/${slugify(post.category)}`);
}
