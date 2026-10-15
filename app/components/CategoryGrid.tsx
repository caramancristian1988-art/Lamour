"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ImageOff, ChevronDown } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { categoryIcons } from "./CategoryIcons";
import { MotifBackground, HeadingFlourish } from "@/app/components/ui/motif";

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
}

interface Props {
  categories: Category[];
}

const COLLAPSED_COUNT = 6;

export default function CategoryGrid({ categories }: Props) {
  const [expanded, setExpanded] = useState(false);
  const hasMore = categories.length > COLLAPSED_COUNT;
  const visible = expanded ? categories : categories.slice(0, COLLAPSED_COUNT);

  return (
    <section className="relative overflow-hidden py-8 sm:py-10 bg-background">
      <MotifBackground />
      <div className="relative max-w-7xl mx-auto px-4">
        <div className="flex items-center gap-4 mb-6 flex-wrap">
          <h2 className="text-2xl sm:text-3xl font-bold text-primary tracking-tight uppercase max-w-full text-balance">
            Categorii populare
          </h2>
          <div className="flex items-center gap-3 flex-1 min-w-[60px]">
            <HeadingFlourish />
            <span className="h-px flex-1 bg-gradient-to-r from-brand-rose to-brand-rose/15" />
          </div>
          <Button asChild variant="accent" size="sm" className="shrink-0">
            <Link href="/produse?division=uz-casnic">Vezi toate categoriile</Link>
          </Button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
          {visible.map((cat) => {
            const Icon = categoryIcons[cat.slug];
            return (
              <Link
                key={cat.id}
                href={`/produse?cat=${cat.slug}`}
                className="group flex flex-col items-center text-center gap-3"
              >
                <div className="relative w-full aspect-square rounded-2xl overflow-hidden flex items-center justify-center">
                  {cat.image ? (
                    <Image
                      src={cat.image}
                      alt={cat.name}
                      fill
                      sizes="(max-width: 640px) 45vw, 200px"
                      className="object-contain transition-transform duration-300 ease-out motion-reduce:transition-none group-hover:scale-[0.88] group-focus-visible:scale-[0.88]"
                    />
                  ) : Icon ? (
                    <Icon className="w-1/2 h-1/2 text-primary transition-transform duration-300 ease-out motion-reduce:transition-none group-hover:scale-[0.88] group-focus-visible:scale-[0.88]" />
                  ) : (
                    <ImageOff className="w-8 h-8 text-muted-foreground" aria-hidden />
                  )}
                </div>
                <h3 className="text-sm sm:text-base font-bold text-foreground leading-snug line-clamp-2">
                  {cat.name}
                </h3>
              </Link>
            );
          })}
        </div>

        {hasMore && (
          <div className="mt-6 flex justify-center">
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={() => setExpanded((v) => !v)}
              aria-expanded={expanded}
              className="group min-w-[16rem] border-accent bg-card text-accent shadow-md hover:bg-accent hover:text-accent-foreground hover:shadow-lg"
            >
              {expanded ? "Vezi mai puține categorii" : `Vezi toate categoriile (${categories.length})`}
              <ChevronDown
                className={`h-5 w-5 transition-transform duration-300 ${expanded ? "rotate-180" : ""}`}
                aria-hidden
              />
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}
