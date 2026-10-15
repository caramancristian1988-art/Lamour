"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useSearchParams } from "next/navigation";
import { Menu, ChevronDown, ImageOff } from "lucide-react";
import { categoryIcons } from "./CategoryIcons";
import { HeadingFlourish } from "@/app/components/ui/motif";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/app/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export interface CategoryLink {
  id: string;
  slug: string;
  name: string;
  image: string | null;
}

const fallbackCategories: CategoryLink[] = [
  { id: "categorie-1", slug: "categorie-1", name: "Categoria unu", image: null },
  { id: "categorie-2", slug: "categorie-2", name: "Categoria doi", image: null },
  { id: "categorie-3", slug: "categorie-3", name: "Categoria trei", image: null },
];

interface Props {
  className?: string;
  buttonClassName?: string;
  label?: string;
  categories?: CategoryLink[];
}

export default function AllCategoriesMenu({ className, buttonClassName, label = "Toate categoriile", categories }: Props) {
  const productsDropdown = categories && categories.length > 0 ? categories : fallbackCategories;
  const [open, setOpen] = useState(false);
  // true când meniul s-a închis prin click/atingere în afara lui: atunci NU mai readucem focusul pe buton, ca butonul
  // să nu rămână „selectat” (cu inel de focus) după ce ai apăsat în altă parte a ecranului.
  const closedByPointer = useRef(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Force-close on any navigation — Radix only auto-closes for
  // DropdownMenuItem selections, not plain <Link> clicks, so without this
  // the menu stays open after navigating to a category/offers page.
  // Adjusting state during render (not in an effect) per React's guidance
  // for "resetting state when a prop changes".
  const routeKey = `${pathname}?${searchParams.toString()}`;
  const [lastRouteKey, setLastRouteKey] = useState(routeKey);
  if (routeKey !== lastRouteKey) {
    setLastRouteKey(routeKey);
    if (open) setOpen(false);
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className={cn(
            "group",
            buttonClassName ??
              cn(
                "flex items-center gap-2 bg-accent hover:bg-brand-red-dark text-white text-sm font-bold px-5 h-12 rounded-xl transition-colors uppercase tracking-wide",
                className
              )
          )}
        >
          <Menu className="w-4 h-4" aria-hidden />
          <span className="truncate">{label}</span>
          {/* Săgeata se întoarce în sus cât meniul e deschis (data-state vine de la Radix) */}
          <ChevronDown className="w-3.5 h-3.5 transition-transform duration-200 group-data-[state=open]:rotate-180" aria-hidden />
        </button>
      </DropdownMenuTrigger>
      {/* Panou lat (mega-meniu): categoriile se așază pe mai multe coloane, pe lățimea paginii, ca să încapă toate
          fără o listă lungă în jos; derulare în stilul site-ului dacă sunt foarte multe. */}
      <DropdownMenuContent
        align="start"
        collisionPadding={16}
        onPointerDownOutside={() => {
          closedByPointer.current = true;
        }}
        onCloseAutoFocus={(e) => {
          if (closedByPointer.current) {
            e.preventDefault();
            closedByPointer.current = false;
            // scoatem focusul de pe buton (altfel apare ca selectat)
            (document.activeElement as HTMLElement | null)?.blur?.();
          }
        }}
        className="w-[calc(100vw-2rem)] sm:w-[min(calc(100vw-3rem),70rem)] max-h-[min(78vh,46rem)] overflow-y-auto scrollbar-brand p-4 sm:p-6 rounded-2xl"
      >
        <div className="flex items-center gap-3 mb-4 sm:mb-5">
          <h2 className="text-lg sm:text-xl font-bold text-primary tracking-tight uppercase">Categorii</h2>
          <HeadingFlourish className="shrink-0" />
          <span aria-hidden className="h-px flex-1 bg-gradient-to-r from-brand-rose to-brand-rose/15" />
          <Link
            href="/produse"
            onClick={() => setOpen(false)}
            className="shrink-0 text-sm font-bold text-accent hover:underline underline-offset-4 rounded"
          >
            Toate produsele
          </Link>
        </div>

        <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
          <li>
            <Link
              href="/produse?oferte=1"
              onClick={() => setOpen(false)}
              className="group flex flex-col items-center text-center gap-2.5 rounded-2xl"
            >
              <span className="relative w-full aspect-square flex items-center justify-center">
                {/* Eticheta 3D roșie cu „%” și panglică aurie — fără fundal în spate (imaginea are transparență) */}
                <Image
                  src="/oferte-speciale.webp"
                  alt=""
                  fill
                  sizes="(max-width: 640px) 45vw, (max-width: 1280px) 20vw, 180px"
                  className="object-contain drop-shadow-md transition-transform duration-300 ease-out motion-reduce:transition-none group-hover:scale-[0.88] group-focus-visible:scale-[0.88]"
                />
              </span>
              <span className="text-sm sm:text-[15px] font-bold text-accent leading-snug">Oferte speciale</span>
            </Link>
          </li>
          {productsDropdown.map((item) => {
            const Icon = categoryIcons[item.slug];
            return (
              <li key={item.id}>
                <Link
                  href={`/produse?cat=${item.slug}`}
                  onClick={() => setOpen(false)}
                  className="group flex flex-col items-center text-center gap-2.5 rounded-2xl"
                >
                  <span className="relative w-full aspect-square rounded-2xl overflow-hidden flex items-center justify-center">
                    {item.image ? (
                      <Image
                        src={item.image}
                        alt=""
                        fill
                        sizes="(max-width: 640px) 45vw, (max-width: 1280px) 20vw, 180px"
                        className="object-cover transition-transform duration-300 ease-out motion-reduce:transition-none group-hover:scale-[0.88] group-focus-visible:scale-[0.88]"
                      />
                    ) : Icon ? (
                      <Icon className="w-1/2 h-1/2 text-primary transition-transform duration-300 ease-out motion-reduce:transition-none group-hover:scale-[0.88] group-focus-visible:scale-[0.88]" />
                    ) : (
                      <ImageOff className="w-7 h-7 text-muted-foreground" aria-hidden />
                    )}
                  </span>
                  <span className="text-sm sm:text-[15px] font-bold text-foreground group-hover:text-accent transition-colors leading-snug line-clamp-2">
                    {item.name}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
