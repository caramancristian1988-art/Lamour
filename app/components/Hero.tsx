import { MotifBackground, MotifCorner } from "@/app/components/ui/motif";
import BannerCarousel, { type BannerSlide } from "@/app/components/BannerCarousel";
import { SITE_NAME, SITE_TAGLINE } from "@/lib/constants";

const fallbackBanners: BannerSlide[] = [
  {
    id: "fallback-1",
    image: "https://placehold.co/1280x560/710808/710808",
    alt: `Oferte speciale ${SITE_NAME}`,
    title: "Oferte speciale",
    subtitle: SITE_TAGLINE,
    ctaLabel: "Vezi ofertele",
    link: "/produse?oferte=1",
  },
];

export default function Hero({ banners = [] }: { banners?: BannerSlide[] }) {
  const slides = banners.length > 0 ? banners : fallbackBanners;

  return (
    <section className="relative overflow-hidden bg-background pt-6 pb-10 sm:pb-14">
      <MotifBackground />
      <MotifCorner className="absolute top-6 left-6 hidden sm:block" />
      <MotifCorner className="absolute bottom-6 right-6 hidden sm:block" flip />

      <div className="relative max-w-7xl mx-auto px-5 sm:px-6">
        {/* Fără animație de intrare pe opacitate: imaginea principală e elementul LCP, iar un fade-in
            condiționat de încărcarea/hidratarea framer-motion o ținea invizibilă ~2s după ce se descărcase. */}
        <BannerCarousel banners={slides} />
      </div>
    </section>
  );
}
