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
}

// „Click-to-load”: până la apăsare se afișează doar imaginea locală, deci pagina nu încarcă scripturile și
// cookie-urile Facebook (mai rapid, iar vizitatorul nu e urmărit fără să fi cerut să vadă videoclipul).
// După apăsare se încarcă playerul oficial Facebook și pornește redarea.
export default function FacebookVideo({ videoUrl, poster, title, className = "", priority = false }: FacebookVideoProps) {
  const [playing, setPlaying] = useState(false);
  const src = `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(videoUrl)}&show_text=false&width=1280&t=0&autoplay=true`;

  return (
    <div className={`relative overflow-hidden bg-black ${className}`}>
      {playing ? (
        <div className="absolute inset-0 flex items-center bg-black">
          <iframe
            src={src}
            title={title}
            className="aspect-video w-full border-0"
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
          <Image
            src={poster}
            alt=""
            fill
            priority={priority}
            className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            sizes="(max-width: 1024px) 100vw, 50vw"
          />
          <span aria-hidden className="absolute inset-0 bg-black/15 group-hover:bg-black/25 transition-colors" />
          <span
            aria-hidden
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-primary/90 text-white shadow-xl ring-4 ring-white/70 group-hover:scale-105 transition-transform"
          >
            <Play className="w-9 h-9 sm:w-10 sm:h-10 ml-1" fill="currentColor" />
          </span>
          <span className="absolute left-4 bottom-4 sm:left-6 sm:bottom-5 text-sm sm:text-base font-semibold text-white drop-shadow">
            Vezi videoclipul
          </span>
        </button>
      )}
    </div>
  );
}
