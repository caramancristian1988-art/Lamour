"use client";

import { useEffect, useState } from "react";
import { Sparkles, Clock } from "lucide-react";

function pad(n: number) {
  return String(n).padStart(2, "0");
}

export default function ProductOfferBanner({
  discount,
  countdownMinutes,
}: {
  discount: number;
  countdownMinutes: number;
}) {
  const totalSeconds = countdownMinutes * 60;
  const [secondsLeft, setSecondsLeft] = useState(totalSeconds);

  useEffect(() => {
    const interval = setInterval(() => {
      setSecondsLeft((s) => (s > 0 ? s - 1 : totalSeconds));
    }, 1000);
    return () => clearInterval(interval);
  }, [totalSeconds]);

  const hours = Math.floor(secondsLeft / 3600);
  const minutes = Math.floor((secondsLeft % 3600) / 60);
  const seconds = secondsLeft % 60;

  return (
    <div className="relative overflow-hidden rounded-2xl bg-accent px-5 py-4 flex items-center justify-between gap-4">
      <Sparkles className="absolute -right-4 -bottom-6 w-28 h-28 text-white/10" aria-hidden />
      <div className="relative">
        <p className="text-white/80 text-[10px] font-bold uppercase tracking-widest mb-0.5">Ofertă limitată</p>
        <p className="text-white text-lg font-bold leading-tight">-{discount}% reducere azi</p>
      </div>
      <div
        className="relative flex items-center gap-1.5 bg-black/20 rounded-xl px-3 py-2 text-white text-sm font-bold tabular-nums shrink-0"
        role="timer"
        aria-label={`Timp rămas: ${pad(hours)}:${pad(minutes)}:${pad(seconds)}`}
      >
        <Clock className="w-4 h-4 shrink-0" aria-hidden />
        {pad(hours)}:{pad(minutes)}:{pad(seconds)}
      </div>
    </div>
  );
}
