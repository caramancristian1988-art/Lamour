"use client";

import { useState } from "react";
import Image from "next/image";
import { Play } from "lucide-react";

interface FacebookVideoProps {
  /** Adresa publică a videoclipului de pe Facebook (https://www.facebook.com/<pagina>/videos/<id>/). */
  videoUrl: string;
  /** Imaginea afișată înainte de redare (copie locală — adresele de imagini Facebook expiră). */
  poster: string;
  /** Titlul videoclipului — citit de cititoarele de ecran la buton și la cadrul încorporat. */
  title: string;
  className?: string;
  priority?: boolean;
  /** "landscape" (16:9, implicit) sau "portrait" (9:16 — clipuri verticale/Reels). Containerul primit prin className trebuie să aibă același raport. */
  orientation?: "landscape" | "portrait";
}

// „Click-to-load”: până la apăsare se afișează doar imaginea locală, deci pagina nu încarcă scripturile și
// cookie-urile Facebook (mai rapid, iar vizitatorul nu e urmărit fără să fi cerut să vadă videoclipul).
// După apăsare se încarcă playerul oficial Facebook și pornește redarea.
export default function FacebookVideo({ videoUrl, poster, title, className = "", priority = false, orientation = "landscape" }: FacebookVideoProps) {
  const portrait = orientation === "portrait";
  const [playing, setPlaying] = useState(false);
  const src = `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(videoUrl)}&show_text=false&width=1280&t=0&autoplay=true`;

  return (
    <div className={`relative overflow-hidden bg-black ${className}`}>
      {playing ? (
        <div className="absolute inset-0 flex items-center justify-center bg-black">
          <iframe
            src={src}
            title={title}
            className={portrait ? "h-full w-full border-0" : "aspect-video w-full border-0"}
            allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share; fullscreen"
            allowFullScreen
          />
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setPlaying(true)}
          aria-label={`Redă videoclipul: ${title}`}
          className="group absolute inset-0 w-full h-full block focus-visible:outline-offset-[-6px]"
        >
          {/* Fundal: aceeași imagine, mărită și estompată — umple spațiul când zona nu are raportul 16:9 al videoclipului. */}
          {!portrait && <Image src={poster} alt="" fill aria-hidden className="object-cover scale-125 blur-2xl opacity-70" sizes="50vw" />}
          {/* Cadrul videoclipului, ÎNTREG (object-contain): nu se mai taie marginile. */}
          <Image
            src={poster}
            alt=""
            fill
            priority={priority}
            className="object-contain"
            sizes="(max-width: 1024px) 100vw, 50vw"
          />
          <span aria-hidden className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors" />
          <span
            aria-hidden
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-primary/90 text-white shadow-xl ring-4 ring-white/70 group-hover:scale-105 transition-transform"
          >
            <Play className="w-9 h-9 sm:w-10 sm:h-10 ml-1" fill="currentColor" />
          </span>
          <span className="absolute left-4 top-4 sm:left-6 sm:top-5 rounded-full bg-black/45 px-3 py-1 text-sm font-semibold text-white">
            Vezi videoclipul
          </span>
        </button>
      )}
    </div>
  );
}
