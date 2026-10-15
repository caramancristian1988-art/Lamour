import { MapPin, ExternalLink } from "lucide-react";
import { getContactInfo } from "@/lib/siteSettings";

// Locația „SRL Lumintehnica" din Google Maps (coordonatele reperului). Linkul lung duce la fișa locului din Maps.
const MAPS_PLACE_URL =
  "https://www.google.com/maps/place/SRL+Lumintehnica/@46.9996228,28.8045398,18.5z/data=!4m6!3m5!1s0x40c97f9cc0cd1731:0xd71e89ee206f9b67!8m2!3d46.9998573!4d28.8045076!16s%2Fg%2F11q8r_lfcy";
const MAPS_EMBED_URL = "https://www.google.com/maps?q=46.9998573,28.8045076&z=18&hl=ro&output=embed";

// Harta pe toată lățimea paginii (și cât un ecran de înaltă), la finalul primei pagini, chiar deasupra subsolului.
// Încărcată leneș: nu încetinește prima afișare — iframe-ul se cere abia când ajungi aproape de ea.
export default async function LocationMap() {
  const { address } = await getContactInfo();

  return (
    <section aria-labelledby="locatie-titlu" className="relative border-t border-border bg-muted">
      <iframe
        title="Harta Google Maps cu locația LuminTehnica"
        src={MAPS_EMBED_URL}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        allowFullScreen
        className="block h-[85svh] min-h-[420px] w-full border-0"
      />

      <div className="pointer-events-none absolute inset-x-4 bottom-4 sm:inset-x-auto sm:left-8 sm:top-8 sm:bottom-auto sm:max-w-sm">
        <div className="pointer-events-auto rounded-2xl border border-border bg-card/95 p-5 shadow-xl backdrop-blur">
          <h2 id="locatie-titlu" className="flex items-center gap-2 text-xl font-bold text-primary">
            <MapPin className="h-5 w-5 shrink-0 text-accent" aria-hidden />
            Unde ne găsești
          </h2>
          <p className="mt-2 text-sm text-foreground">{address}</p>
          <a
            href={MAPS_PLACE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex h-11 items-center justify-center gap-2 rounded-full bg-accent px-5 text-sm font-bold uppercase tracking-wide text-white shadow-md transition-colors hover:bg-brand-red-dark"
          >
            Deschide în Google Maps
            <ExternalLink className="h-4 w-4" aria-hidden />
            <span className="sr-only">(se deschide într-o fereastră nouă)</span>
          </a>
        </div>
      </div>
    </section>
  );
}
