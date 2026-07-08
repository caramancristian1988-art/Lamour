"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Leaf, ShieldCheck, HeartHandshake } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { MotifBackground, MotifCorner } from "@/app/components/ui/motif";
import BannerCarousel, { type BannerSlide } from "@/app/components/BannerCarousel";

const heroBenefits = [
  { icon: Leaf, title: "Grijă autentică", desc: "Suntem alături la fiecare pas" },
  { icon: ShieldCheck, title: "Încredere", desc: "Servicii transparente și sigure" },
  { icon: HeartHandshake, title: "Comunitate", desc: "Împreună, mai puternici" },
];

export default function Hero({ banners = [] }: { banners?: BannerSlide[] }) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-brand-cream via-white to-brand-rose-light/40">
      <MotifBackground />
      <MotifCorner className="absolute top-6 left-6 hidden sm:block" />
      <MotifCorner className="absolute bottom-6 right-6 hidden sm:block" flip />

      <div className="relative max-w-7xl mx-auto px-5 sm:px-6 py-16 sm:py-24 lg:py-28">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-2xl"
        >
          <span className="inline-block rounded-full bg-secondary/60 text-secondary-foreground px-4 py-1.5 text-xs font-bold uppercase tracking-wider mb-6">
            Asociația Nevăzătorilor din Moldova
          </span>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-primary leading-[1.08] tracking-tight mb-5">
            Un drum accesibil,{" "}
            <span className="text-accent">pentru fiecare dintre noi.</span>
          </h1>
          <p className="text-lg text-foreground/80 leading-relaxed mb-8 max-w-xl">
            Sprijin, resurse și comunitate pentru persoanele nevăzătoare și cu deficiențe de vedere din Moldova.
          </p>
          <div className="flex flex-wrap gap-4">
            <Button asChild size="lg" variant="accent">
              <Link href="/produse">Descoperă serviciile</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/despre">Află mai multe despre noi</Link>
            </Button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          className="mt-14 flex flex-wrap gap-4"
        >
          {heroBenefits.map((b) => (
            <div
              key={b.title}
              className="flex items-center gap-3 bg-white/80 backdrop-blur-sm border border-border rounded-2xl px-5 py-4 shadow-sm"
            >
              <div className="w-11 h-11 bg-primary rounded-xl flex items-center justify-center shrink-0">
                <b.icon className="w-5 h-5 text-white" aria-hidden />
              </div>
              <div>
                <div className="text-sm font-bold text-foreground tracking-tight">{b.title}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{b.desc}</div>
              </div>
            </div>
          ))}
        </motion.div>

        {banners.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="mt-10 sm:mt-14"
          >
            <BannerCarousel banners={banners} />
          </motion.div>
        )}
      </div>
    </section>
  );
}
