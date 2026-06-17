import { redirect } from "next/navigation";
import { getSession } from "./auth";

export async function requireAdmin() {
  const user = await getSession();
  if (!user || !user.isAdmin) {
    redirect("/");
  }
  return user;
}
