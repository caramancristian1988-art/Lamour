import AdminPageHeader from "../../components/AdminPageHeader";
import BlogForm from "../BlogForm";
import { createBlogPostAction } from "@/lib/adminBlogActions";

export default function NewBlogPostPage() {
  return (
    <div>
      <AdminPageHeader title="Articol nou" />
      <BlogForm action={createBlogPostAction} submitLabel="Publică articolul" />
    </div>
  );
}
