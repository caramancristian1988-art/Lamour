"use client";

import { useState } from "react";
import Image from "next/image";

interface FacebookVideoProps {
  /** Adresa publică a videoclipului de pe Facebook (https://www.facebook.com/<pagina>/videos/<id>/). */
  videoUrl: string;
  /** Imaginea afișată cât se încarcă playerul (copie locală — adresele de imagini Facebook expiră). */
  poster: string;
  /** Titlul videoclipului — citit de cititoarele de ecran la cadrul încorporat și la link. */
  title: string;
  className?: string;
  priority?: boolean;
  /** "landscape" (16:9, implicit) sau "portrait" (9:16 — clipuri verticale/Reels). Containerul primit prin className trebuie să aibă același raport. */
  orientation?: "landscape" | "portrait";
}

// Playerul Facebook e încărcat direct în pagină (leneș, aproape de ecran), nu după un click propriu.
// De ce: un iframe cross-origin creat DUPĂ un click nu poate porni singur redarea (browserul blochează autoplay-ul),
// deci vizitatorul ar fi trebuit să apese de două ori — o dată la noi, o dată pe butonul playerului. Așa, primul click
// cade direct pe butonul de play al playerului și videoclipul pornește imediat, cu sunet.
// Până se încarcă playerul, se vede imaginea de copertă.
export default function FacebookVideo({ videoUrl, poster, title, className = "", priority = false, orientation = "landscape" }: FacebookVideoProps) {
  const [ready, setReady] = useState(false);
  const portrait = orientation === "portrait";
  const src = `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(videoUrl)}&show_text=false&width=1280&t=0`;

  return (
    <div className={`relative overflow-hidden bg-black ${className}`}>
      {/* Copertă (până e gata playerul) */}
      {!ready && (
        <div aria-hidden className="absolute inset-0">
          {!portrait && <Image src={poster} alt="" fill className="object-cover scale-125 blur-2xl opacity-70" sizes="50vw" />}
          <Image src={poster} alt="" fill priority={priority} className="object-contain" sizes="(max-width: 1024px) 100vw, 50vw" />
          <span className="absolute inset-x-0 bottom-3 text-center text-sm font-semibold text-white drop-shadow">Se încarcă videoclipul…</span>
        </div>
      )}

      <div className="absolute inset-0 flex items-center justify-center">
        <iframe
          src={src}
          title={title}
          loading="lazy"
          onLoad={() => setReady(true)}
          className={`border-0 ${portrait ? "h-full w-full" : "aspect-video w-full"} ${ready ? "opacity-100" : "opacity-0"} transition-opacity duration-300`}
          allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share; fullscreen"
          allowFullScreen
        />
      </div>

      {/* Link către videoclip pe Facebook (filă nouă) */}
      <a
        href={videoUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`Vezi videoclipul pe Facebook (se deschide într-o filă nouă): ${title}`}
        className={`absolute left-1/2 ${portrait ? "bottom-14" : "top-3"} -translate-x-1/2 z-10 inline-flex whitespace-nowrap items-center gap-2 rounded-full bg-white/95 px-3 py-1.5 text-sm font-semibold text-primary shadow-md hover:bg-white focus-visible:outline-offset-2 transition-colors`}
      >
        <svg className="w-4 h-4 shrink-0 text-[#1877F2]" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
          <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" />
        </svg>
        <span className="hidden min-[380px]:inline">Vezi pe Facebook</span>
        <span className="min-[380px]:hidden">Facebook</span>
      </a>
    </div>
  );
}
