import { Phone, Mail, HandHeart } from "lucide-react";

// Bara de sus: degrade vișiniu cu motiv popular foarte discret, mesajul în serif cursiv și datele de contact ca
// „pastile” care reacționează la hover. Pe telefon rămâne mesajul + telefonul (emailul apare de la sm în sus).
export default function TopBar({
  phone = "+000 00 000 000",
  phoneTel = "+00000000000",
  email = "contact@example.com",
}: {
  phone?: string;
  phoneTel?: string;
  email?: string;
}) {
  const pill =
    "group inline-flex h-8 items-center gap-2 whitespace-nowrap rounded-full border border-white/15 bg-white/10 px-3.5 text-[13px] font-semibold text-white transition-all duration-200 hover:-translate-y-px hover:border-white/35 hover:bg-white/20 hover:shadow-md active:translate-y-0";

  return (
    <div className="relative overflow-hidden bg-gradient-to-r from-brand-maroon-dark via-brand-maroon to-brand-maroon-dark text-white">
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-footer-pattern opacity-[0.07]" />

      <div className="relative mx-auto flex h-11 max-w-[110rem] items-center justify-between gap-3 px-4">
        <p className="flex min-w-0 items-center gap-2.5">
          <span
            aria-hidden
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/10 ring-1 ring-white/20"
          >
            <HandHeart className="h-4 w-4 text-brand-rose-light" />
          </span>
          <span className="truncate font-serif text-[13px] italic tracking-wide text-white/95 sm:text-[15px]">
            Suntem alături de tine, la fiecare pas
          </span>
        </p>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <a href={`tel:${phoneTel}`} className={pill}>
            <Phone className="h-3.5 w-3.5 text-brand-rose-light transition-transform duration-200 group-hover:-rotate-12 group-hover:scale-110" aria-hidden />
            {phone}
          </a>
          <a href={`mailto:${email}`} className={`${pill} hidden sm:inline-flex`}>
            <Mail className="h-3.5 w-3.5 text-brand-rose-light transition-transform duration-200 group-hover:scale-110" aria-hidden />
            {email}
          </a>
        </div>
      </div>

      {/* Linie fină roz la bază, ca o margine brodată */}
      <div aria-hidden className="h-px bg-gradient-to-r from-transparent via-brand-rose/60 to-transparent" />
    </div>
  );
}
