import { Phone, Mail, HandHeart } from "lucide-react";

export default function TopBar({
  phone = "+000 00 000 000",
  phoneTel = "+00000000000",
  email = "contact@example.com",
}: {
  phone?: string;
  phoneTel?: string;
  email?: string;
}) {
  return (
    <div className="bg-brand-maroon text-white text-sm py-2.5 px-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 sm:gap-4">
        <div className="flex items-center gap-1.5 min-w-0">
          <HandHeart className="w-4 h-4 text-white/70 shrink-0" aria-hidden />
          <span className="truncate text-xs sm:text-sm">Suntem alături de tine, la fiecare pas</span>
        </div>
        <div className="flex items-center gap-3 sm:gap-8 shrink-0">
          <a
            href={`tel:${phoneTel}`}
            className="flex items-center gap-1.5 hover:text-brand-rose-light transition-colors text-xs sm:text-sm whitespace-nowrap rounded"
          >
            <Phone className="w-3.5 h-3.5 text-white/70 shrink-0" aria-hidden />
            {phone}
          </a>
          <a
            href={`mailto:${email}`}
            className="hidden sm:flex items-center gap-1.5 hover:text-brand-rose-light transition-colors rounded"
          >
            <Mail className="w-3.5 h-3.5 text-white/70" aria-hidden />
            {email}
          </a>
        </div>
      </div>
    </div>
  );
}
