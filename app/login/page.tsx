import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import LoginForm from "./LoginForm";

export default async function LoginPage() {
  const user = await getSession();
  if (user) redirect("/cont");

  return (
    <main className="bg-white min-h-[70vh] flex items-start justify-center px-6 pt-10 sm:pt-16 pb-16">
      <LoginForm />
    </main>
  );
}
