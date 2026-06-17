import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import AuthLayout from "../components/AuthLayout";
import LoginForm from "./LoginForm";

export default async function LoginPage() {
  const user = await getSession();
  if (user) redirect("/cont");

  return (
    <AuthLayout>
      <LoginForm />
    </AuthLayout>
  );
}
