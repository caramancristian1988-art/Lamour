"use client";

import Link from "next/link";
import Image from "next/image";
import { Menu, ChevronDown, Sparkles, ImageOff } from "lucide-react";
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

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className={
            buttonClassName ??
            cn(
              "flex items-center gap-2 bg-accent hover:bg-brand-red-dark text-white text-sm font-bold px-5 h-12 rounded-xl transition-colors uppercase tracking-wide",
              className
            )
          }
        >
          <Menu className="w-4 h-4" aria-hidden />
          <span className="truncate">{label}</span>
          <ChevronDown className="w-3.5 h-3.5" aria-hidden />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        className="w-[calc(100vw-2rem)] max-w-md lg:w-96 max-h-[70vh] overflow-y-auto p-2"
      >
        <p className="px-3 pt-1.5 pb-2 text-xs font-bold text-muted-foreground uppercase tracking-wide">Produse</p>
        <Link
          href="/produse?oferte=1"
          className="flex items-center gap-4 rounded-xl px-3 py-3 text-base font-bold text-accent hover:bg-muted transition-colors"
        >
          <span className="relative w-14 h-14 rounded-xl bg-secondary/40 shrink-0 flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-accent" aria-hidden />
          </span>
          Oferte speciale
        </Link>
        {productsDropdown.map((item) => (
          <Link
            key={item.id}
            href={`/produse?cat=${item.slug}`}
            className="flex items-center gap-4 rounded-xl px-3 py-3 text-base font-semibold text-foreground hover:text-accent hover:bg-muted transition-colors"
          >
            <span className="relative w-14 h-14 rounded-xl bg-muted overflow-hidden shrink-0 flex items-center justify-center">
              {item.image ? (
                <Image src={item.image} alt={item.name} fill className="object-cover" />
              ) : (
                <ImageOff className="w-6 h-6 text-muted-foreground" aria-hidden />
              )}
            </span>
            {item.name}
          </Link>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
