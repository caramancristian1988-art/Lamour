"use client";

import { useState } from "react";
import Image from "next/image";
import { Pause, Play, Quote, Users } from "lucide-react";
import { StarRating } from "@/app/components/ui/star-rating";
import { Avatar, AvatarFallback } from "@/app/components/ui/avatar";

export type MarqueeItem =
  | { kind: "review"; id: string; name: string; rating: number; text: string; product: string | null }
  | { kind: "facebook"; id: string; name: string; text: string; image?: { src: string; width: number; height: number } }
  | { kind: "cta"; id: string };

function getInitials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}

function Card({ item }: { item: MarqueeItem }) {
  const shell = "w-[290px] sm:w-[340px] shrink-0 rounded-2xl p-6 flex flex-col";

  if (item.kind === "cta") {
    return (
      <div className={`${shell} items-center justify-center text-center gap-3 bg-gradient-to-br from-secondary/30 to-accent/20 border border-accent/30`}>
        <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center shrink-0">
          <Users className="w-6 h-6 text-white" aria-hidden />
        </div>
        <p className="text-base font-bold text-primary leading-snug">
          Împreună construim
          <br />o societate mai incluzivă!
        </p>
      </div>
    );
  }

  // Captura de ecran a comentariului, afișată ca atare. Textul comentariului e textul alternativ, pentru cititoarele de ecran.
  if (item.kind === "facebook" && item.image) {
    return (
      <figure className="w-[480px] sm:w-[620px] shrink-0 self-center overflow-hidden rounded-2xl border border-border shadow-sm bg-card">
        <Image
          src={item.image.src}
          alt={`Comentariu pe Facebook de la ${item.name}: ${item.text}`}
          width={item.image.width}
          height={item.image.height}
          className="w-full h-auto"
          sizes="(max-width: 640px) 480px, 620px"
        />
      </figure>
    );
  }

  if (item.kind === "facebook") {
    return (
      <figure className={`${shell} bg-muted border border-border`}>
        <div className="flex items-center gap-2 text-xs font-semibold text-[#1877F2]">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
            <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" />
          </svg>
          Comentariu pe Facebook
        </div>
        <blockquote className="text-sm text-muted-foreground mt-3 flex-1 leading-relaxed">„{item.text}”</blockquote>
        <figcaption className="flex items-center gap-3 mt-4 pt-4 border-t border-border">
          <Avatar className="w-10 h-10">
            <AvatarFallback className="bg-primary text-white text-xs">{getInitials(item.name)}</AvatarFallback>
          </Avatar>
          <span className="text-sm font-bold text-foreground">{item.name}</span>
        </figcaption>
      </figure>
    );
  }

  return (
    <figure className={`${shell} bg-muted border border-border`}>
      <Quote className="w-7 h-7 text-accent/25 mb-3" aria-hidden />
      <StarRating rating={item.rating} />
      <blockquote className="text-sm text-muted-foreground mt-3 flex-1 leading-relaxed">„{item.text}”</blockquote>
      <figcaption className="flex items-center gap-3 mt-4 pt-4 border-t border-border">
        <Avatar className="w-10 h-10">
          <AvatarFallback className="bg-primary text-white text-xs">{getInitials(item.name)}</AvatarFallback>
        </Avatar>
        <div>
          <div className="text-sm font-bold text-foreground">{item.name}</div>
          {item.product && <div className="text-xs text-muted-foreground mt-0.5 truncate max-w-[180px]">{item.product}</div>}
        </div>
      </figcaption>
    </figure>
  );
}

// Carusel de recenzii care derulează de la dreapta la stânga, în buclă continuă.
//  • Seria de carduri e dublată: a doua copie e `aria-hidden`, deci cititoarele de ecran o citesc o singură dată.
//  • Se oprește la hover și când un element din el are focus; butonul „Oprește derularea” (WCAG 2.2.2) îl oprește definitiv.
//  • Cu „mișcare redusă” în sistem nu derulează singur: rândul devine derulabil manual.
export default function ReviewsMarquee({ items }: { items: MarqueeItem[] }) {
  const [paused, setPaused] = useState(false);

  if (items.length === 0) return null;

  // Pe ecrane late, o serie trebuie să acopere lățimea ca să nu apară goluri la reluare.
  const set: MarqueeItem[] = [];
  while (set.length < 8) set.push(...items);
  const seconds = Math.max(30, set.length * 6);

  return (
    <div>
      <div className="flex justify-center mb-4">
        <button
          type="button"
          onClick={() => setPaused((p) => !p)}
          aria-pressed={paused}
          className="motion-reduce:hidden inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-semibold text-primary hover:bg-muted transition-colors"
        >
          {paused ? <Play className="w-4 h-4" aria-hidden /> : <Pause className="w-4 h-4" aria-hidden />}
          {paused ? "Pornește derularea recenziilor" : "Oprește derularea recenziilor"}
        </button>
      </div>

      <div
        className="group/marquee motion-reduce:overflow-x-auto overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_5%,black_95%,transparent)]"
        role="region"
        aria-label="Recenzii și mărturii ale clienților"
        tabIndex={0}
      >
        <div
          className="flex w-max gap-5 pr-5 motion-safe:animate-marquee group-hover/marquee:[animation-play-state:paused] group-focus-within/marquee:[animation-play-state:paused]"
          style={{ animationDuration: `${seconds}s`, animationPlayState: paused ? "paused" : undefined }}
        >
          <ul className="flex gap-5" aria-label="Recenzii">
            {set.map((item, i) => (
              <li key={`a-${item.id}-${i}`} className="flex">
                <Card item={item} />
              </li>
            ))}
          </ul>
          {/* Copia pentru bucla continuă — ascunsă de tehnologiile asistive */}
          <ul className="flex gap-5 motion-reduce:hidden" aria-hidden>
            {set.map((item, i) => (
              <li key={`b-${item.id}-${i}`} className="flex">
                <Card item={item} />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
