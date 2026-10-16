import { MapPin, MapPinned, Navigation, ExternalLink } from "lucide-react";
import { getContactInfo } from "@/lib/siteSettings";

// Locația „SRL Lumintehnica" din Google Maps (coordonatele reperului). Linkul lung duce la fișa locului din Maps.
const MAPS_PLACE_URL =
  "https://www.google.com/maps/place/SRL+Lumintehnica/@46.9996228,28.8045398,18.5z/data=!4m6!3m5!1s0x40c97f9cc0cd1731:0xd71e89ee206f9b67!8m2!3d46.9998573!4d28.8045076!16s%2Fg%2F11q8r_lfcy";
// Aceleași coordonate, deschise în aplicația preferată: Waze (pornește navigarea) și Apple Maps (iPhone / Mac).
const WAZE_URL = "https://waze.com/ul?ll=46.9998573%2C28.8045076&navigate=yes&zoom=17";
const APPLE_MAPS_URL = "https://maps.apple.com/?ll=46.9998573%2C28.8045076&q=SRL%20Lumintehnica";
const MAPS_EMBED_URL = "https://www.google.com/maps?q=46.9998573,28.8045076&z=18&hl=ro&output=embed";

// Harta pe toată lățimea paginii, joasă (o fâșie), la finalul primei pagini, chiar deasupra subsolului. Pe telefon cardul cu
// adresa stă deasupra hărții (nu o acoperă); de la sm în sus plutește peste ea, în colț.
// Încărcată leneș: nu încetinește prima afișare — iframe-ul se cere abia când ajungi aproape de ea.
export default async function LocationMap() {
  const { address } = await getContactInfo();

  const card = (
    <div className="rounded-2xl border border-border bg-card/95 p-4 shadow-xl backdrop-blur sm:p-5">
      <h2 className="flex items-center gap-2 text-lg font-bold text-primary sm:text-xl">
        <MapPin className="h-5 w-5 shrink-0 text-accent" aria-hidden />
        Unde ne găsești
      </h2>
      <p className="mt-1.5 text-sm text-foreground">{address}</p>
      <div className="mt-3 flex flex-col gap-2">
        <a
          href={MAPS_PLACE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-accent px-5 text-sm font-bold uppercase tracking-wide text-white shadow-md transition-colors hover:bg-brand-red-dark"
        >
          Deschide în Google Maps
          <ExternalLink className="h-4 w-4" aria-hidden />
          <span className="sr-only">(se deschide într-o fereastră nouă)</span>
        </a>
        <div className="grid grid-cols-2 gap-2">
          <a
            href={WAZE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-11 items-center justify-center gap-1.5 rounded-full border-2 border-primary bg-card px-3 text-sm font-bold text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
          >
            <Navigation className="h-4 w-4" aria-hidden />
            Waze
            <span className="sr-only">(se deschide într-o fereastră nouă)</span>
          </a>
          <a
            href={APPLE_MAPS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-11 items-center justify-center gap-1.5 rounded-full border-2 border-primary bg-card px-3 text-sm font-bold text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
          >
            <MapPinned className="h-4 w-4" aria-hidden />
            Apple Maps
            <span className="sr-only">(se deschide într-o fereastră nouă)</span>
          </a>
        </div>
      </div>
    </div>
  );

  return (
    <section id="harta" aria-label="Locația LuminTehnica pe hartă" className="relative scroll-mt-24 border-t border-border bg-muted">
      {/* Pe telefon: cardul deasupra hărții */}
      <div className="px-4 py-4 sm:hidden">{card}</div>
      <iframe
        title="Harta Google Maps cu locația LuminTehnica"
        src={MAPS_EMBED_URL}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        allowFullScreen
        className="block h-[260px] w-full border-0 sm:h-[320px] lg:h-[360px]"
      />

      {/* De la sm în sus: cardul plutește peste hartă, în colțul din stânga sus */}
      <div className="pointer-events-none absolute left-6 top-6 hidden max-w-sm sm:block lg:left-10 lg:top-8">
        <div className="pointer-events-auto">{card}</div>
      </div>
    </section>
  );
}
