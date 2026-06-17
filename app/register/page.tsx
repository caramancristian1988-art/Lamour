import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import RegisterForm from "./RegisterForm";

export default async function RegisterPage() {
  const user = await getSession();
  if (user) redirect("/cont");

  return (
    <main className="bg-white min-h-[70vh] flex items-center justify-center px-4 py-16">
      <RegisterForm />
    </main>
  );
}
