import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import AuthLayout from "../components/AuthLayout";
import RegisterForm from "./RegisterForm";

export default async function RegisterPage() {
  const user = await getSession();
  if (user) redirect("/cont");

  return (
    <AuthLayout>
      <RegisterForm />
    </AuthLayout>
  );
}
