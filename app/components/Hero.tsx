"use client";

import { motion } from "framer-motion";
import { MotifBackground, MotifCorner } from "@/app/components/ui/motif";
import BannerCarousel, { type BannerSlide } from "@/app/components/BannerCarousel";
import { SITE_TAGLINE } from "@/lib/constants";

const fallbackBanners: BannerSlide[] = [
  {
    id: "fallback-1",
    image: "https://placehold.co/1280x560/710808/710808",
    alt: "Oferte speciale L'amour Cu Dragoste",
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
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <BannerCarousel banners={slides} />
        </motion.div>
      </div>
    </section>
  );
}
