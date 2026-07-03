import Link from "next/link";
import NewsletterForm from "./NewsletterForm";
import type { SocialLinks } from "@/lib/siteSettings";
import { Logo } from "@/app/components/Logo";
import { SITE_NAME, SITE_TAGLINE } from "@/lib/constants";
import { MotifDivider } from "@/app/components/ui/motif";

const footerLinks = {
  "DESPRE": [
    { label: "Despre noi", href: "/despre" },
    { label: "Blog", href: "/blog" },
    { label: "Politica de confidențialitate", href: "/confidentialitate" },
    { label: "Termeni și condiții", href: "/termeni" },
  ],
  "SUPORT": [
    { label: "Contact", href: "/contact" },
    { label: "Întrebări frecvente", href: "/faq" },
    { label: "Servicii", href: "/servicii" },
    { label: "Proiecte", href: "/proiecte" },
  ],
  "EXPLOREAZĂ": [
    { label: "Toate produsele", href: "/produse" },
    { label: "Oferte speciale", href: "/produse?oferte=1" },
  ],
};

export default function Footer({ facebook, instagram }: Partial<SocialLinks>) {
  return (
    <footer className="bg-brand-maroon text-white">
      <div className="max-w-7xl mx-auto px-4 pt-14 pb-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand column */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Link href="/" className="flex items-center gap-2.5 mb-4 rounded-lg w-fit">
              <Logo size={36} />
              <span className="text-base font-bold text-white tracking-tight">{SITE_NAME}</span>
            </Link>

            <p className="text-white/70 text-sm leading-relaxed mb-6">{SITE_TAGLINE}</p>

            <div className="flex items-center gap-2">
              {facebook && (
                <a
                  href={facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Facebook"
                  className="w-10 h-10 border border-white/30 rounded-full flex items-center justify-center hover:border-white/60 hover:bg-white/10 transition-colors"
                >
                  <svg className="w-4.5 h-4.5" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
                    <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" />
                  </svg>
                </a>
              )}
              {instagram && (
                <a
                  href={instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                  className="w-10 h-10 border border-white/30 rounded-full flex items-center justify-center hover:border-white/60 hover:bg-white/10 transition-colors"
                >
                  <svg className="w-4.5 h-4.5" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                  </svg>
                </a>
              )}
            </div>
          </div>

          {(Object.entries(footerLinks) as [string, { label: string; href: string }[]][]).map(([section, links]) => (
            <div key={section}>
              <h4 className="text-xs font-bold text-brand-rose-light uppercase tracking-wider mb-4">{section}</h4>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link href={link.href} className="text-sm text-white/70 hover:text-white transition-colors rounded">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div>
            <h4 className="text-xs font-bold text-brand-rose-light uppercase tracking-wider mb-4">Abonează-te la noutăți</h4>
            <p className="text-sm text-white/70 mb-4 leading-relaxed">Fii la curent cu noutățile și evenimentele noastre.</p>
            <NewsletterForm />
          </div>
        </div>

        <MotifDivider className="opacity-40 mt-10" />
      </div>

      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-4 text-center text-xs text-white/50">
          © {new Date().getFullYear()} {SITE_NAME}. Toate drepturile rezervate.
        </div>
      </div>
    </footer>
  );
}
