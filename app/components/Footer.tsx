import Link from "next/link";
import Image from "next/image";
import { Phone, Mail, MapPin } from "lucide-react";
import type { SocialLinks, ContactInfo } from "@/lib/siteSettings";
import { Logo } from "@/app/components/Logo";
import { SITE_NAME, SITE_SHORT_NAME, SITE_TAGLINE } from "@/lib/constants";
import { MotifCorner, MotifDivider, MotifRosette, HeadingFlourish } from "@/app/components/ui/motif";
import NewsletterForm from "@/app/components/NewsletterForm";

const usefulLinks = [
  { label: "Despre noi", href: "/despre" },
  { label: "Produse", href: "/produse" },
  { label: "Oferte", href: "/produse?oferte=1" },
  { label: "Noutăți", href: "/blog" },
  { label: "Contact", href: "/contact" },
];

const infoLinks = [
  { label: "Livrare și plată", href: "/faq" },
  { label: "Politica de retur", href: "/faq" },
  { label: "Termeni și condiții", href: "/termeni" },
  { label: "Politica de confidențialitate", href: "/confidentialitate" },
];

const socialButton =
  "w-12 h-12 border border-white/30 rounded-full flex items-center justify-center text-white hover:border-white/70 hover:bg-white/10 hover:-translate-y-0.5 transition-all";

// Titlu de coloană: floare mică + text serif, ca în restul site-ului (titlurile sunt Playfair Display).
function ColumnTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="flex items-center gap-2 font-serif text-xl font-bold text-white mb-5">
      <HeadingFlourish className="text-brand-rose w-[18px] h-[18px]" />
      {children}
    </h3>
  );
}

// Rând de link cu un mic romb (motivul popular) în față.
function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="group flex items-center gap-3 text-[15px] text-white/80 hover:text-white transition-colors rounded">
      <span aria-hidden className="w-1.5 h-1.5 rotate-45 bg-brand-rose/70 group-hover:bg-brand-rose-light transition-colors shrink-0" />
      <span className="group-hover:translate-x-0.5 transition-transform">{children}</span>
    </Link>
  );
}

export default function Footer({ facebook, instagram, phone, email, address }: Partial<SocialLinks> & Partial<ContactInfo>) {
  return (
    <footer className="relative overflow-hidden bg-brand-maroon text-white">
      {/* ── Fundal decorativ: panglică sus, model „romb popular”, colțuri și rozetă mare ── */}
      <div aria-hidden className="relative z-10 h-[22px] w-full bg-ornamental-border-light" />
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-footer-pattern opacity-[0.08]" />
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/25" />
      <MotifRosette className="pointer-events-none absolute -bottom-32 -right-28 w-[30rem] h-[30rem] opacity-[0.12]" />
      <MotifRosette className="pointer-events-none absolute -top-40 -left-40 hidden lg:block w-[26rem] h-[26rem] opacity-[0.07]" />
      <MotifCorner className="absolute top-12 left-5 hidden md:block w-28 h-28 text-brand-rose opacity-40" />
      <MotifCorner flip className="absolute top-12 right-5 hidden md:block w-28 h-28 text-brand-rose opacity-40" />
      <MotifCorner className="absolute bottom-20 left-5 hidden md:block w-28 h-28 -scale-y-100 text-brand-rose opacity-40" />

      <div className="relative max-w-7xl mx-auto px-5 sm:px-8 pt-16 pb-12 sm:pt-20">
        {/* ── Rând 1: marca (logo mare, ca în navbar) + abonare ── */}
        <div className="grid grid-cols-1 lg:grid-cols-[1.15fr_1fr] gap-12 lg:gap-16 items-center">
          <div>
            <Link href="/" className="flex items-center gap-4 sm:gap-6 w-fit rounded-lg" aria-label={`${SITE_NAME} — prima pagină`}>
              <Logo size={104} className="sm:hidden border-2 border-logo-silver shadow-lg" />
              <Logo size={152} className="hidden sm:block border-2 border-logo-silver shadow-lg" />
              <span className="block leading-tight">
                <span className="block pr-2 text-3xl sm:text-4xl font-serif italic font-bold tracking-tight bg-gradient-to-r from-white to-brand-rose-light bg-clip-text text-transparent [-webkit-text-stroke:0.4px_var(--brand-rose-light)]">
                  {SITE_SHORT_NAME}
                </span>
                <span className="block pr-2 text-xl sm:text-2xl font-serif italic font-bold tracking-tight bg-gradient-to-r from-white to-brand-rose-light bg-clip-text text-transparent [-webkit-text-stroke:0.4px_var(--brand-rose-light)] -mt-1">
                  Lamour
                </span>
              </span>
            </Link>

            <p className="mt-6 text-base sm:text-lg text-white/85 leading-relaxed max-w-lg">{SITE_TAGLINE}</p>

            {(facebook || instagram) && (
              <div className="mt-6 flex items-center gap-3">
                <span className="text-sm font-semibold text-brand-rose-light mr-1">Urmărește-ne</span>
                {facebook && (
                  <a href={facebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook" className={socialButton}>
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
                      <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" />
                    </svg>
                  </a>
                )}
                {instagram && (
                  <a href={instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className={socialButton}>
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                    </svg>
                  </a>
                )}
              </div>
            )}
          </div>

          {/* Abonare: card translucid, cu colț ornamental */}
          <div className="relative rounded-3xl border border-white/20 bg-white/[0.07] backdrop-blur-[2px] p-6 sm:p-8 shadow-xl shadow-black/10">
            <MotifCorner className="absolute -top-3 -left-3 w-14 h-14 text-brand-rose-light opacity-80" />
            <h3 className="font-serif text-2xl font-bold text-white">Abonează-te</h3>
            <p className="mt-2 mb-5 text-[15px] text-white/80 leading-relaxed">
              Primește noutăți și oferte speciale direct pe email.
            </p>
            <NewsletterForm />
          </div>
        </div>

        <MotifDivider tone="onDark" className="my-12 sm:my-14" />

        {/* ── Rând 2: link-uri, contact, asociația ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12">
          <div>
            <ColumnTitle>Link-uri utile</ColumnTitle>
            <ul className="space-y-3.5">
              {usefulLinks.map((link) => (
                <li key={link.label}>
                  <FooterLink href={link.href}>{link.label}</FooterLink>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <ColumnTitle>Informații</ColumnTitle>
            <ul className="space-y-3.5">
              {infoLinks.map((link) => (
                <li key={link.label}>
                  <FooterLink href={link.href}>{link.label}</FooterLink>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <ColumnTitle>Contacte</ColumnTitle>
            <ul className="space-y-4">
              {address && (
                <li className="flex items-start gap-3 text-[15px] text-white/80">
                  <span className="mt-0.5 w-9 h-9 shrink-0 rounded-full border border-white/25 bg-white/5 flex items-center justify-center">
                    <MapPin className="w-4 h-4 text-brand-rose-light" aria-hidden />
                  </span>
                  <span className="pt-1.5">{address}</span>
                </li>
              )}
              {phone && (
                <li>
                  <a
                    href={`tel:${phone.replace(/[^\d+]/g, "")}`}
                    className="flex items-center gap-3 text-[15px] text-white/80 hover:text-white transition-colors rounded"
                  >
                    <span className="w-9 h-9 shrink-0 rounded-full border border-white/25 bg-white/5 flex items-center justify-center">
                      <Phone className="w-4 h-4 text-brand-rose-light" aria-hidden />
                    </span>
                    {phone}
                  </a>
                </li>
              )}
              {email && (
                <li>
                  <a href={`mailto:${email}`} className="flex items-center gap-3 text-[15px] text-white/80 hover:text-white transition-colors rounded break-all">
                    <span className="w-9 h-9 shrink-0 rounded-full border border-white/25 bg-white/5 flex items-center justify-center">
                      <Mail className="w-4 h-4 text-brand-rose-light" aria-hidden />
                    </span>
                    {email}
                  </a>
                </li>
              )}
            </ul>
          </div>

          <div className="sm:col-span-2 lg:col-span-1 flex justify-center lg:justify-end">
            {/* Sigla asociației conține deja numele în ea — nu îl mai repetăm ca text; textul alternativ îl spune cititoarelor de ecran. */}
            <div className="relative w-full max-w-[320px] lg:max-w-none rounded-3xl border border-white/20 bg-white/[0.07] px-6 py-7 flex flex-col items-center text-center gap-5">
              <div className="flex flex-col items-center gap-2">
                <p className="whitespace-nowrap text-xs font-semibold uppercase tracking-[0.2em] text-brand-rose-light">Suntem alături de</p>
                <span aria-hidden className="flex items-center gap-1.5 text-brand-rose">
                  <span className="h-px w-8 bg-brand-rose/60" />
                  <HeadingFlourish className="w-3.5 h-3.5" />
                  <span className="h-px w-8 bg-brand-rose/60" />
                </span>
              </div>
              <div className="relative w-full max-w-[250px] aspect-[1180/671]">
                <Image
                  src="/logo-asociatia-nevazatorilor-footer.png"
                  alt="Asociația Nevăzătorilor din Moldova"
                  fill
                  sizes="250px"
                  className="object-contain drop-shadow-[0_6px_18px_rgba(0,0,0,0.25)]"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Bara de jos ── */}
      <div className="relative border-t border-white/15 bg-black/15">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 py-5 flex flex-col lg:flex-row items-center justify-between gap-2 lg:gap-6 text-sm text-white/80 text-center">
          <span>
            © {new Date().getFullYear()} {SITE_NAME}. Toate drepturile rezervate.
          </span>
          <span>
            Website realizat de{" "}
            <a
              href="https://racustefan.com"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-white underline underline-offset-4 decoration-brand-rose/60 hover:decoration-white transition-colors rounded"
            >
              racustefan.com
            </a>
          </span>
          <span className="flex items-center gap-2 text-brand-rose-light">
            <HeadingFlourish className="w-4 h-4" />
            Făcut cu dragoste în Moldova
          </span>
        </div>
      </div>
    </footer>
  );
}
