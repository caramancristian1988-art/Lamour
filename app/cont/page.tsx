import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { logoutAction } from "@/lib/authActions";
import AccountStats from "../components/AccountStats";

export default async function ContPage() {
  const user = await getSession();
  if (!user) redirect("/login");

  const initials = user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

  return (
    <main className="bg-white min-h-[70vh]">
      <section className="border-b border-gray-100 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-8">
          <nav className="flex items-center gap-1.5 text-xs text-gray-400 mb-4">
            <Link href="/" className="hover:text-[#c7092b] transition-colors">Acasă</Link>
            <span>›</span>
            <span className="text-gray-600">Contul meu</span>
          </nav>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#1d2353]">
            Contul <span className="text-[#c7092b]">meu</span>
          </h1>
        </div>
      </section>

      <section className="py-10">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-12">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-16 h-16 rounded-full bg-[#fdf2f3] text-[#c7092b] flex items-center justify-center font-extrabold text-xl shrink-0">
              {initials}
            </div>
            <div className="min-w-0">
              <p className="font-extrabold text-lg text-[#1d2353] truncate">{user.name}</p>
              <p className="text-sm text-gray-500 truncate">{user.email}</p>
            </div>
          </div>

          {user.isAdmin && (
            <Link
              href="/admin"
              className="flex items-center justify-center gap-2 bg-[#1d2353] hover:bg-[#2a3470] text-white font-bold px-6 py-3.5 rounded-xl transition-colors text-sm uppercase tracking-wide mb-8"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1h3a1 1 0 001-1V10m-9 11h4" />
              </svg>
              Mergi la pagina de administrator
            </Link>
          )}

          <AccountStats />

          <div className="border-t border-gray-100 pt-6">
            <form action={logoutAction}>
              <button
                type="submit"
                className="text-sm font-bold text-gray-500 hover:text-[#c7092b] transition-colors"
              >
                Deconectează-te
              </button>
            </form>
          </div>
        </div>
      </section>
    </main>
  );
}
