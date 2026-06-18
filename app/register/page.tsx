import { requireAdmin } from "@/lib/adminAuth";
import RegisterForm from "./RegisterForm";

export default async function RegisterPage() {
  await requireAdmin();

  return (
    <main className="bg-white min-h-[70vh] flex items-start justify-center px-6 pt-10 sm:pt-16 pb-16">
      <RegisterForm />
    </main>
  );
}
