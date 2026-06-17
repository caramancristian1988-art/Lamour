import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { logoutAction } from "@/lib/authActions";

export default async function ContPage() {
  const user = await getSession();
  if (!user) redirect("/login");

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
          <div className="border border-gray-100 rounded-2xl p-6 mb-6 flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-[#1d2353] text-white flex items-center justify-center font-extrabold text-lg shrink-0">
              {user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)}
            </div>
            <div className="min-w-0">
              <p className="font-extrabold text-[#1d2353] truncate">{user.name}</p>
              <p className="text-sm text-gray-500 truncate">{user.email}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <Link
              href="/favorite"
              className="border border-gray-100 rounded-2xl p-5 flex items-center gap-3 hover:shadow-md hover:-translate-y-0.5 transition-all"
            >
              <svg className="w-6 h-6 text-[#c7092b]" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              <span className="font-bold text-sm text-[#1d2353]">Produsele mele favorite</span>
            </Link>
            <Link
              href="/cos"
              className="border border-gray-100 rounded-2xl p-5 flex items-center gap-3 hover:shadow-md hover:-translate-y-0.5 transition-all"
            >
              <svg className="w-6 h-6 text-[#c7092b]" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <span className="font-bold text-sm text-[#1d2353]">Coșul meu</span>
            </Link>
          </div>

          <form action={logoutAction}>
            <button
              type="submit"
              className="text-sm font-bold text-gray-500 hover:text-[#c7092b] transition-colors"
            >
              Deconectează-te
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}
